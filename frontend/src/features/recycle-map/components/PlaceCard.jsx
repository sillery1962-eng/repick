import { useState } from "react";
import { pinColor } from "../lib/markerImage";
import { distanceKm, formatKm, isExact, kindOf, placeLinks, posOf } from "../lib/place";

/** 목록 카드 (v4.5 시안: 아이콘 타일 · 이름 · 종류 · 거리/운영시간 · 검은 길찾기 버튼) */
export default function PlaceCard({ p, me, tempPos, active, onSelect, onFind, onChoose }) {
  const [open, setOpen] = useState(false);
  const [cands, setCands] = useState(null); // null | "loading" | [] | [{...}]
  const pos = posOf(p, tempPos);
  const exact = isExact(p, tempPos);
  const color = pinColor(p);
  const links = placeLinks(p, tempPos);
  const route = links.find((l) => l.label === "카카오 길찾기");
  const view = links.find((l) => l.label === "카카오맵에서 보기");
  const dist = me && pos ? formatKm(distanceKm(me, pos)) : p.gu;
  const flag = p.isSub ? "이용자 제보 · 확인 전" : !pos ? "지도 위치 없음" : !exact ? "대략 위치" : null;

  const find = async (e) => {
    e.stopPropagation();
    setCands("loading");
    setCands(await onFind(p));
  };

  return (
    <article
      className={"rm-card" + (active ? " rm-on" : "")}
      data-id={p.id}
      onClick={(e) => { if (!e.target.closest("a,button")) { onSelect(p.id, "list"); setOpen(true); } }}
    >
      <div className="rm-cardRow">
        <span className="rm-tile" style={{ background: color + "22" }} aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" fill={color} />
            <circle cx="12" cy="10" r="2.8" fill="#FFFFFF" />
          </svg>
        </span>
        <span className="rm-cardText">
          <span className="rm-name">{p.name}</span>
          <span className="rm-kindLine">{kindOf(p)} · {(p.items || []).join(" · ")}</span>
          <span className="rm-sub">
            {dist}{p.hours ? ` · ${p.hours}` : ""}
            {flag && <span className="rm-flag">{flag}</span>}
          </span>
        </span>
        <a className="rm-route" href={(route || view).href} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} ${route ? "길찾기" : "카카오맵에서 보기"}`}>
          {route ? "길찾기" : "지도 보기"}
        </a>
      </div>

      {(active || open) && (
        <div className="rm-more">
          {p.address && <div className="rm-sub">{p.address}</div>}
          {p.memo && <div className="rm-sub">{p.memo}</div>}
          <div className="rm-links">
            {links.filter((l) => l !== route && l !== view).map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={l.muted ? "rm-src" : undefined}>{l.label}</a>
            ))}
            {route && <a href={view.href} target="_blank" rel="noopener noreferrer">카카오맵에서 보기</a>}
            {onFind && !p.isSub && !exact && cands === null && (
              <button type="button" className="rm-link" onClick={find}>카카오에서 정확한 위치 찾기</button>
            )}
          </div>
          {cands === "loading" && <div className="rm-cands">찾는 중…</div>}
          {Array.isArray(cands) && (
            <div className="rm-cands">
              {cands.length === 0 ? (
                <span>카카오에서 맞는 장소를 찾지 못했습니다. 카카오맵에서 직접 확인해 주세요.</span>
              ) : (
                <>
                  <span>맞는 곳을 고르면 지도 핀을 옮겨 둡니다 (이 화면에서만):</span>
                  {cands.map((d) => (
                    <button key={d.id} type="button" onClick={(e) => { e.stopPropagation(); onChoose(p.id, { lat: +d.y, lng: +d.x }); setCands(null); }}>
                      {d.place_name} · {d.road_address_name || d.address_name}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
