import { ITEMS } from "./constants";

export const kindOf = (p) => p.kind || "AI 무인회수기";

/** 카카오 검색으로 고른 임시 위치가 있으면 그걸, 없으면 저장된 좌표를 씁니다. */
export const posOf = (p, tempPos) =>
  tempPos?.[p.id] ||
  (typeof p.lat === "number" && typeof p.lng === "number" ? { lat: p.lat, lng: p.lng } : null);

export const isExact = (p, tempPos) => Boolean(posOf(p, tempPos) && (p.precise || tempPos?.[p.id]));

/** "AI 그린모아모아 (은평평화공원)" → "은평평화공원", "다산동 주민센터 앞" → "다산동 주민센터" */
export const searchName = (p) =>
  p.name
    .replace(/^AI 그린모아모아 \((.*)\)$/, "$1")
    .replace(/\s*\(.*\)$/, "")
    .replace(/\s*(앞|옆)$/, "");

export const searchQuery = (p) =>
  p.address && /\d/.test(p.address) ? p.address : `서울 ${p.gu} ${searchName(p)}`;

export const itemClass = (item) => ITEMS.find(([k]) => k === item)?.[1] || "pet";

export function distanceKm(a, b) {
  const R = 6371;
  const r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r;
  const dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const formatKm = (d) => (d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`);

const enc = encodeURIComponent;
export function placeLinks(p, tempPos) {
  const pos = posOf(p, tempPos);
  const links = [];
  if (isExact(p, tempPos)) links.push({ href: `https://map.kakao.com/link/to/${enc(p.name)},${pos.lat},${pos.lng}`, label: "카카오 길찾기" });
  links.push({ href: `https://map.kakao.com/link/search/${enc(searchQuery(p))}`, label: "카카오맵에서 보기" });
  links.push({ href: `https://map.naver.com/p/search/${enc(searchQuery(p))}`, label: "네이버지도" });
  if (p.src) links.push({ href: p.src, label: `출처: ${p.srcLabel || "링크"}`, muted: true });
  return links;
}
