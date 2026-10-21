-- 010_forest_reward_spend_tier.sql  (10/21 · 백현숙, 경난 님 검토안 기반)
-- 나무 수확 보너스: "모아 둔 나무 모두 사용" → "고른 사은품에 필요한 나무만 사용"으로 바꾼다. 009 다음.
-- 실행: Supabase 대시보드 → SQL Editor → 전체 붙여넣기 → Run (다시 실행해도 결과는 같다)
--
-- 바뀌는 것 (10/21 팀 결정, 경난 님 노션 10/20 "나무선물 필요 수량만 차감" 검토)
--   · 친환경 쿠폰 1그루 · 재활용 노트 2그루 · 에코백 3그루만 쓰고 나머지는 남긴다
--     예: 4그루에서 쿠폰 → 3그루 남음 / 노트 → 2그루 / 에코백 → 1그루
--   · 007 repick_forest_action의 rewards 부분 두 줄만 다르다 (trees_spent = v_tier, saved_trees = v_saved − v_tier)
--   · 007 파일은 고치지 않는다 (README 규칙 1). 이 파일이 함수를 통째로 다시 만든다
--
-- 그대로인 것
--   · 회원별 잠금(동시 신청 한 번만), 나무 부족 → PT400, 물 주기·수확, 다른 함수(state·잔액 검사 트리거)
--   · 5그루째 수확 = 텀블러 자동 지급 → 0그루. 수확 전에는 최대 4그루라서 이때는 항상 5그루를 쓴다
--   · 지난 보상 기록(reward_claims)은 건드리지 않는다 → 이미 "모두 사용"으로 받은 기록은 그대로

begin;

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

  -- 수확 보너스 받기 (1~4그루일 때 사용자가 고름): 고른 단계만큼만 쓰고 나머지는 남김 (10/21 변경)
  elsif p_action='rewards' then
    v_tier := p_value;
    v_item := case v_tier when 1 then '친환경 쿠폰' when 2 then '재활용 노트'
      when 3 then '에코백' else null end;          -- 5(텀블러)는 수확 때 자동 지급
    if v_item is null then
      raise exception '사은품 단계를 확인해 주세요.' using errcode = 'PT400'; end if;
    if v_saved<v_tier then
      raise exception '모아 둔 나무가 부족해요.' using errcode = 'PT400'; end if;
    insert into public.reward_claims(user_id,tier,trees_spent,item,choice)
      values(p_user_id,v_tier,v_tier,v_item,'gift');               -- 007: trees_spent = v_saved
    return jsonb_build_object('item',v_item,'trees_spent',v_tier,
      'saved_trees',v_saved-v_tier);                               -- 007: saved_trees = 0
  end if;

  raise exception '지원하지 않는 나무 요청이에요.' using errcode = 'PT400';
end $$;

-- 권한은 007과 같다: 브라우저(anon·authenticated)는 못 부르고 FastAPI(secret 키)만
revoke all on function public.repick_forest_action(uuid,text,integer) from public,anon,authenticated;
grant execute on function public.repick_forest_action(uuid,text,integer) to service_role;

commit;
