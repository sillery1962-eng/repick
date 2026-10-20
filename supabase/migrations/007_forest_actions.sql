-- 007_forest_actions.sql  (10/20 · 백현숙, 경난 님 검토안 기반)
-- 나의 숲: 물 주기 · 수확 · 수확 보너스를 DB 함수로 한 번에 처리한다. 006 다음에 실행한다.
-- 실행: Supabase 대시보드 → SQL Editor → 전체 붙여넣기 → Run (한 번만 실행. 다시 실행해도 결과는 같다)
--
-- 왜 DB 함수인가
--   · 창 두 개에서 동시에 물 주기·수확을 눌러도 두 번 처리되지 않게, 회원 한 명씩 줄을 세워(잠금) 처리한다
--   · 새 테이블은 없다. 통장(point_transactions)·수확한 나무(harvested_trees)·보너스 기록(reward_claims)만 쓴다
--
-- ⚠️ 숫자 위치 예외 (api-spec 1번 "숫자는 코드 표" 규칙의 예외)
--   · 나무 단계별 물방울(3·6·7·8·9·10·12 = 55)과 사은품 이름은 이 파일 안에 있다 (동시 처리를 DB에서 하기 때문)
--   · 바꾸려면 새 번호 파일로 함수를 다시 만든다. Python 쪽에 같은 표를 또 두지 않는다
--
-- 5그루 규칙 (10/20 결정, A안)
--   · 1~4그루: 사용자가 그때 받을지 더 모을지 고른다 (POST /forest/rewards)
--   · 5그루째 수확: 그 자리에서 텀블러 자동 지급 → 0그루부터 다시 (5그루를 넘게 모을 수 없다)
--
-- 오류 코드 (FastAPI에서 그대로 HTTP 상태로 쓴다: 'PT409' → 409)
--   · PT400 입력이 잘못됨 · 잔액 부족   · PT409 아직 할 수 없음(수확 전·이미 다 자람)
--   · PT404 회원 없음                   · PT500 기록이 맞지 않음(자동으로 지우지 않음)
--   · 메시지는 화면에 그대로 보여 줘도 되는 한국어 문장
--
-- FastAPI에서 부르는 법 (secret 키)
--   supabase.rpc("repick_forest_state",  {"p_user_id": user["id"]}).execute()
--   supabase.rpc("repick_forest_action", {"p_user_id": user["id"], "p_action": "water", "p_value": 2}).execute()
--   p_action: 'water'(p_value = 물방울 수) / 'harvest' / 'rewards'(p_value = 1·2·3)

begin;

-- =========================================================
-- 1. repick_forest_state: 지금 나무 상태 (읽기만)
--    단계는 저장하지 않고 "물 준 합계 − 수확한 나무 × 55"로 계산한다
-- =========================================================
create or replace function public.repick_forest_state(p_user_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_costs integer[] := array[3,6,7,8,9,10,12];   -- 단계별 필요 물방울 (합계 55)
  v_names text[] := array['새싹','떡잎','줄기','묘목','어린 나무','큰 나무','열매 나무'];
  v_balance bigint; v_water bigint; v_harvest bigint; v_spent bigint;
  v_current bigint; v_progress bigint; v_stage integer := 1; v_trees jsonb;
begin
  -- 한 문장에서 읽어 통장·수확·보너스 기록을 같은 시점 기준으로 맞춘다
  select
    coalesce((select sum(amount) from public.point_transactions where user_id=p_user_id and currency='drop'),0),
    coalesce((select -sum(amount) from public.point_transactions where user_id=p_user_id and currency='drop' and type='watering'),0),
    (select count(*) from public.harvested_trees where user_id=p_user_id),
    coalesce((select sum(trees_spent) from public.reward_claims where user_id=p_user_id),0),
    coalesce((select jsonb_agg(jsonb_build_object('id',id,'tree_type',tree_type,'harvested_at',harvested_at) order by id desc)
              from public.harvested_trees where user_id=p_user_id),'[]'::jsonb)
  into v_balance,v_water,v_harvest,v_spent,v_trees;

  v_current := v_water - v_harvest * 55;          -- 지금 나무에 준 물방울
  if v_current < 0 or v_current > 55 or v_spent > v_harvest then
    raise exception '나무 기록이 맞지 않아요. 관리자에게 알려 주세요.' using errcode = 'PT500';
  end if;

  v_progress := v_current;
  while v_stage < 7 and v_progress >= v_costs[v_stage] loop
    v_progress := v_progress - v_costs[v_stage];
    v_stage := v_stage + 1;
  end loop;

  return jsonb_build_object('stage',v_stage,'max_stage',7,'stage_name',v_names[v_stage],
    'drops_in_stage',v_progress,'drops_to_next',v_costs[v_stage],
    'watered_in_cycle',v_current,'harvest_ready',v_current=55,
    'next_stage',case when v_stage < 7 then v_stage+1 else null end,
    'drops_balance',v_balance,'saved_trees',v_harvest-v_spent,
    'harvested',v_trees,'mutations_ready',true);
end $$;

-- =========================================================
-- 2. 잔액 검사 트리거: 통장에서 빼는 줄(amount < 0)은 잔액이 모자라면 DB가 거부
--    물 주기뿐 아니라 기부·전환에도 걸린다 → 기부 담당(지원)에게 PT400 처리 안내
--    새로 넣는 줄만 확인한다 (지난 기록은 건드리지 않음)
-- =========================================================
create or replace function public.repick_guard_spend()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_balance bigint;
begin
  if new.amount < 0 then
    perform 1 from public.profiles where id=new.user_id for update;   -- 같은 회원은 줄 세우기
    select coalesce(sum(amount),0) into v_balance from public.point_transactions
      where user_id=new.user_id and currency=new.currency;
    if v_balance + new.amount < 0 then
      raise exception '잔액이 부족해요.' using errcode = 'PT400';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists repick_guard_spend_before_insert on public.point_transactions;
create trigger repick_guard_spend_before_insert
before insert on public.point_transactions
for each row execute function public.repick_guard_spend();

-- =========================================================
-- 3. repick_forest_action: 물 주기 · 수확 · 수확 보너스 받기
-- =========================================================
create or replace function public.repick_forest_action(p_user_id uuid,p_action text,p_value integer default 0)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_state jsonb; v_current integer; v_saved integer; v_fruit text;
  v_tier integer; v_item text; v_gifts jsonb; v_auto jsonb := null;
begin
  -- 같은 회원의 요청은 순서대로 하나씩 (다른 회원은 기다리지 않음)
  perform 1 from public.profiles where id=p_user_id for update;
  if not found then raise exception '회원 정보를 찾을 수 없어요.' using errcode = 'PT404'; end if;

  v_state := public.repick_forest_state(p_user_id);
  v_current := (v_state->>'watered_in_cycle')::integer;
  v_saved := (v_state->>'saved_trees')::integer;

  -- 물 주기: 통장에 watering 한 줄 (drop −)
  if p_action='water' then
    if p_value is null or p_value<=0 or p_value>55 then
      raise exception '물방울 개수를 확인해 주세요.' using errcode = 'PT400'; end if;
    if v_current=55 then
      raise exception '나무가 다 자랐어요. 먼저 수확해 주세요.' using errcode = 'PT409'; end if;
    if p_value>55-v_current then
      raise exception '수확까지 필요한 물방울보다 많이 줄 수 없어요.' using errcode = 'PT400'; end if;
    if (v_state->>'drops_balance')::bigint<p_value then
      raise exception '물방울이 부족해요.' using errcode = 'PT400'; end if;
    insert into public.point_transactions(user_id,currency,type,amount)
      values(p_user_id,'drop','watering',-p_value);
    return public.repick_forest_state(p_user_id);

  -- 수확: 사과·배·감 중 랜덤 → harvested_trees 한 줄 (물방울 변화 없음)
  elsif p_action='harvest' then
    if v_current<>55 then
      raise exception '7단계를 모두 키운 뒤 수확할 수 있어요.' using errcode = 'PT409'; end if;
    v_fruit := (array['apple','pear','persimmon'])[1+floor(random()*3)::integer];
    insert into public.harvested_trees(user_id,tree_type) values(p_user_id,v_fruit);
    v_saved := v_saved + 1;

    -- 5그루째면 텀블러 자동 지급 → 0그루부터 다시 (10/20 A안)
    if v_saved >= 5 then
      insert into public.reward_claims(user_id,tier,trees_spent,item,choice)
        values(p_user_id,5,v_saved,'텀블러','gift');
      v_auto := jsonb_build_object('tier',5,'item','텀블러','trees_spent',v_saved);
      v_saved := 0;
    end if;

    select coalesce(jsonb_agg(jsonb_build_object('tier',tier,'item',item) order by tier),'[]'::jsonb)
      into v_gifts from (values(1,'친환경 쿠폰'),(2,'재활용 노트'),(3,'에코백')) as gifts(tier,item)
      where tier<=v_saved;
    return jsonb_build_object('tree_type',v_fruit,'saved_trees',v_saved,
      'available_gifts',v_gifts,'auto_reward',v_auto);

  -- 수확 보너스 받기 (1~4그루일 때 사용자가 고름): 모아 둔 나무를 모두 쓰고 0그루부터
  elsif p_action='rewards' then
    v_tier := p_value;
    v_item := case v_tier when 1 then '친환경 쿠폰' when 2 then '재활용 노트'
      when 3 then '에코백' else null end;          -- 5(텀블러)는 수확 때 자동 지급
    if v_item is null then
      raise exception '사은품 단계를 확인해 주세요.' using errcode = 'PT400'; end if;
    if v_saved<v_tier then
      raise exception '모아 둔 나무가 부족해요.' using errcode = 'PT400'; end if;
    insert into public.reward_claims(user_id,tier,trees_spent,item,choice)
      values(p_user_id,v_tier,v_saved,v_item,'gift');
    return jsonb_build_object('item',v_item,'trees_spent',v_saved,'saved_trees',0);
  end if;

  raise exception '지원하지 않는 나무 요청이에요.' using errcode = 'PT400';
end $$;

-- =========================================================
-- 4. 권한: 회원 ID를 받는 함수라서 브라우저(anon·authenticated)는 못 부르고 FastAPI(secret 키)만
-- =========================================================
revoke all on function public.repick_forest_state(uuid) from public,anon,authenticated;
revoke all on function public.repick_forest_action(uuid,text,integer) from public,anon,authenticated;
revoke all on function public.repick_guard_spend() from public,anon,authenticated;
grant execute on function public.repick_forest_state(uuid) to service_role;
grant execute on function public.repick_forest_action(uuid,text,integer) to service_role;

commit;
