import geo from "../data/seoul-gu.json";
import { kindOf, posOf } from "../lib/place";
import { pinColor } from "../lib/markerImage";

const { proj } = geo;
const toXY = ({ lat, lng }) => [(lng - proj.lng0) * proj.kx * proj.S, (proj.lat0 - lat) * proj.S];

/**
 * 카카오 키가 없거나 지도를 못 불러올 때 쓰는 대체 지도.
 * 서울 25개 구 경계 위에 장소를 점으로 찍습니다 (v4.5 시안의 지도 모양).
 */
export default function SeoulSvgMap({ places, allPlaces, tempPos, selectedId, onSelect, me }) {
  const hasGu = new Set(allPlaces.map((p) => p.gu));
  const dots = places.map((p) => ({ p, pos: posOf(p, tempPos) })).filter((d) => d.pos);
  const sel = dots.find((d) => d.p.id === selectedId);
  const meXY = me && toXY(me);

  return (
    <svg className="rm-svgMap" viewBox="-10 -10 1020 843" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`서울 25개 자치구 지도와 수거함 ${dots.length}곳`}>
      <rect x="-10" y="-10" width="1020" height="843" fill="#EEF0E8" />
      {geo.gus.map((g) => (
        <path key={g.name} d={g.d} fill={hasGu.has(g.name) ? "#D3EBC7" : "#E4E7DE"} stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" />
      ))}
      {geo.gus.map((g) => (
        <text key={g.name} x={g.cx} y={g.cy} textAnchor="middle" fontSize="17" fontWeight="700" fill="#6B716D" pointerEvents="none">
          {g.name.length > 2 ? g.name.slice(0, -1) : g.name}
        </text>
      ))}
      {dots.map(({ p, pos }) => {
        const [x, y] = toXY(pos);
        const label = `${p.gu} ${p.name}`;
        const common = { fill: pinColor(p), stroke: "#FFFFFF", strokeWidth: 2.5, className: "rm-dot", tabIndex: 0, role: "button", "aria-label": label,
          onClick: () => onSelect(p.id, "map"), onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(p.id, "map"); } } };
        return kindOf(p) === "일반 수거함"
          ? <rect key={p.id} x={x - 8} y={y - 8} width="16" height="16" rx="2" {...common}><title>{label}</title></rect>
          : <circle key={p.id} cx={x} cy={y} r="8" {...common}><title>{label}</title></circle>;
      })}
      {sel && (() => { const [x, y] = toXY(sel.pos); return <circle cx={x} cy={y} r="16" fill="none" stroke="#121614" strokeWidth="3" pointerEvents="none" />; })()}
      {meXY && (
        <g pointerEvents="none">
          <circle cx={meXY[0]} cy={meXY[1]} r="22" fill="#3E9BEA" opacity="0.18" />
          <circle cx={meXY[0]} cy={meXY[1]} r="9" fill="#3E9BEA" stroke="#FFFFFF" strokeWidth="3" />
        </g>
      )}
    </svg>
  );
}
