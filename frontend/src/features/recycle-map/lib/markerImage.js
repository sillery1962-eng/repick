import { kindOf } from "./place";

/** v4.5 시안 색: AI 무인회수기 파랑, 일반 수거함 검정, 이용자 제보 주황 */
const COLORS = { ai: "#3E9BEA", general: "#121614", sub: "#F5A623" };

export const pinColor = (p) => (p.isSub ? COLORS.sub : kindOf(p) === "일반 수거함" ? COLORS.general : COLORS.ai);

function svg(color, square) {
  const shape = square
    ? `<rect x="5" y="5" width="22" height="22" rx="5" fill="${color}" stroke="#fff" stroke-width="3"/>`
    : `<path d="M16 2C8.8 2 3 7.6 3 14.6 3 24 16 38 16 38s13-14 13-23.4C29 7.6 23.2 2 16 2z" fill="${color}" stroke="#fff" stroke-width="2.5"/><circle cx="16" cy="14.5" r="5" fill="#fff"/>`;
  return (
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">${shape}</svg>`)
  );
}

const cache = {};

/** react-kakao-maps-sdk의 MapMarker `image` prop 형태. 같은 객체를 재사용해 불필요한 갱신을 막습니다. */
export function markerImage(p) {
  const color = pinColor(p);
  const square = kindOf(p) === "일반 수거함";
  const key = color + square;
  if (!cache[key]) {
    cache[key] = square
      ? { src: svg(color, true), size: { width: 32, height: 32 }, options: { offset: { x: 16, y: 16 } } }
      : { src: svg(color, false), size: { width: 32, height: 40 }, options: { offset: { x: 16, y: 39 } } };
  }
  return cache[key];
}
