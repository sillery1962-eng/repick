import { CATEGORIES, GU_LIST } from "../lib/constants";

/** 검색 · 자치구 · 분류 칩 (v4.5 수거함 찾기 시안의 검색창과 알약 버튼) */
export default function Filters({ filt, setFilt, guCounts }) {
  const set = (k) => (v) => setFilt((f) => ({ ...f, [k]: v }));
  return (
    <div className="rm-filters">
      <label className="rm-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B716D" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
        <input type="search" id="rm-q" placeholder="동네, 장소 이름으로 검색" aria-label="동네, 장소 이름으로 검색" value={filt.q} onChange={(e) => set("q")(e.target.value)} />
        <select id="rm-gu" aria-label="자치구" value={filt.gu} onChange={(e) => set("gu")(e.target.value)}>
          <option value="">서울 전체</option>
          {GU_LIST.map((g) => (
            <option key={g} value={g}>{guCounts[g] ? `${g} (${guCounts[g]})` : `${g} (없음)`}</option>
          ))}
        </select>
      </label>
      <div className="rm-chips" role="group" aria-label="분류">
        {CATEGORIES.map(([v, text]) => (
          <button key={v || "all"} type="button" className="rm-chip" aria-pressed={filt.cat === v} onClick={() => set("cat")(v)}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
