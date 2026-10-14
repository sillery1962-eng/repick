import { useEffect, useRef, useState } from "react";
import { GU_LIST, ITEMS, KINDS, REPORT_CONTACT } from "../lib/constants";

// address·gu가 null이면 아직 손대지 않은 것 → 지도에서 찍은 위치의 주소(suggest)를 보여 줍니다.
const EMPTY = { name: "", gu: null, kind: KINDS[0], address: null, hours: "", memo: "", items: ["투명페트"] };
const COOLDOWN_MS = 60_000;

/**
 * 제보 창. submit이 있으면 Firestore로 보내고, 없으면 복사할 텍스트를 만들어 줍니다.
 * suggest: 지도에서 찍은 위치의 { address, gu } (카카오 주소 변환 결과)
 */
export default function ReportDialog({ open, onClose, pick, suggest, submit, mapReady }) {
  const ref = useRef(null);
  const [f, setF] = useState(EMPTY);
  const [msg, setMsg] = useState("");
  const [copyText, setCopyText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const close = () => { setMsg(""); setCopyText(""); onClose(); };
  const address = f.address ?? suggest?.address ?? "";
  const gu = f.gu ?? (GU_LIST.includes(suggest?.gu) ? suggest.gu : "");

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const toggleItem = (it) => setF((x) => ({ ...x, items: x.items.includes(it) ? x.items.filter((i) => i !== it) : [...x.items, it] }));

  const where = pick
    ? `위치: ${suggest?.address || "지도에서 찍은 곳"} (핀을 끌어서 옮길 수 있어요)`
    : mapReady ? "위치: 아직 안 찍음 (목록에만 표시됩니다)" : "위치: 지도를 쓸 수 없어 주소로만 받습니다";

  async function onSubmit(e) {
    e.preventDefault();
    const name = f.name.trim();
    if (!name || !gu) return setMsg("장소 이름과 자치구를 입력해 주세요.");
    if (!f.items.length) return setMsg("배출 품목을 하나 이상 골라 주세요.");
    const doc = {
      name: name.slice(0, 80), gu, kind: f.kind, items: f.items,
      address: address.trim().slice(0, 120), hours: f.hours.trim().slice(0, 60), memo: f.memo.trim().slice(0, 200),
      lat: pick ? +pick.lat.toFixed(6) : null, lng: pick ? +pick.lng.toFixed(6) : null,
    };
    if (!submit) { setCopyText(JSON.stringify(doc, null, 1)); setMsg(""); return; }

    let last = 0;
    try { last = Number(localStorage.getItem("rm-lastReport")) || 0; } catch { /* 저장소 막힘 */ }
    if (Date.now() - last < COOLDOWN_MS) return setMsg("제보는 1분에 한 번만 보낼 수 있습니다. 잠시 후 다시 시도해 주세요.");

    setSending(true); setMsg("보내는 중…");
    try {
      await submit(doc);
      try { localStorage.setItem("rm-lastReport", String(Date.now())); } catch { /* 저장소 막힘 */ }
      setMsg("제보를 받았습니다. 지도에 '이용자 제보'로 바로 표시됩니다.");
      setF(EMPTY);
      setTimeout(close, 1200);
    } catch {
      setMsg("보내지 못했습니다. 입력 내용을 확인하고 다시 시도해 주세요.");
    } finally {
      setSending(false);
    }
  }

  async function copy() {
    try { await navigator.clipboard.writeText(copyText); setMsg("복사했습니다."); }
    catch { document.getElementById("rm-copyText")?.select(); setMsg("선택했습니다. Ctrl+C로 복사하세요."); }
  }

  return (
    <dialog ref={ref} className="rm-dialog" aria-labelledby="rm-rTitle" onClose={close}>
      <form onSubmit={onSubmit} noValidate>
        <h2 id="rm-rTitle">수거함 제보하기</h2>
        <p className="rm-hint">{where}</p>
        <label>장소 이름 *<input id="rm-rName" type="text" maxLength={80} value={f.name} onChange={set("name")} placeholder="예: 응암2동 주민센터 정문 옆" /></label>
        <div className="rm-row">
          <label>자치구 *
            <select id="rm-rGu" value={gu} onChange={set("gu")}>
              <option value="">선택</option>
              {GU_LIST.map((g) => <option key={g}>{g}</option>)}
            </select>
          </label>
          <label>종류
            <select id="rm-rKind" value={f.kind} onChange={set("kind")}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select>
          </label>
        </div>
        <label>주소<input id="rm-rAddr" type="text" maxLength={120} value={address} onChange={set("address")} /></label>
        <fieldset>
          <legend>배출 품목 *</legend>
          <div className="rm-checks">
            {ITEMS.map(([it]) => (
              <label key={it}><input type="checkbox" checked={f.items.includes(it)} onChange={() => toggleItem(it)} /> {it}</label>
            ))}
          </div>
        </fieldset>
        <label>운영 시간<input id="rm-rHours" type="text" maxLength={60} value={f.hours} onChange={set("hours")} placeholder="예: 24시간" /></label>
        <label>메모<textarea id="rm-rMemo" rows={2} maxLength={200} value={f.memo} onChange={set("memo")} placeholder="예: 수퍼빈 앱 필요, 월요일 휴무" /></label>

        {copyText && (
          <div className="rm-copyBox">
            <p className="rm-hint">{REPORT_CONTACT ? `아래 내용을 복사해서 ${REPORT_CONTACT}(으)로 보내 주세요.` : "아래 내용을 복사해서 지도 관리자에게 보내 주세요."}</p>
            <textarea id="rm-copyText" rows={5} readOnly value={copyText} />
            <button type="button" className="rm-btn rm-ghost" onClick={copy}>내용 복사</button>
          </div>
        )}
        <p className="rm-msg" role="status">{msg}</p>
        <div className="rm-dlgActions">
          <button type="button" className="rm-btn rm-ghost" onClick={close}>닫기</button>
          <button type="submit" className="rm-btn" disabled={sending}>{submit ? "제보 보내기" : "제보 내용 만들기"}</button>
        </div>
      </form>
    </dialog>
  );
}
