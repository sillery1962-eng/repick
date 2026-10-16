import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Filters from "./components/Filters";
import MapView from "./components/MapView";
import PlaceCard from "./components/PlaceCard";
import ComingSoonDialog from "./components/ComingSoonDialog";
import ReportDialog from "./components/ReportDialog";
import SeoulSvgMap from "./components/SeoulSvgMap";
import { useMyLocation } from "./hooks/useMyLocation";
import { usePlaces } from "./hooks/usePlaces";
import { KAKAO_JS_KEY, KINDS, REPORT_READY } from "./lib/constants";
import { distanceKm, isExact, kindOf, placeLinks, posOf, searchName } from "./lib/place";
import "./RecycleMapPage.css";

const INIT_FILTER = { q: "", gu: "", cat: "", inView: false };

/**
 * 서울 무인회수기 지도 — v4.5 실사 비교 시안의 "수거함 찾기" 화면.
 * 팀 앱의 헤더·내비게이션 아래에 <RecycleMapPage />로 붙이면 됩니다.
 */
export default function RecycleMapPage() {
  const { places, submit } = usePlaces();
  const { me, status: locStatus, locate } = useMyLocation();
  const [filt, setFilt] = useState(INIT_FILTER);
  const [selectedId, setSelectedId] = useState(null);
  const [tempPos, setTempPos] = useState({});
  const [map, setMap] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [picking, setPicking] = useState(false);
  const [pick, setPick] = useState(null);
  const [suggest, setSuggest] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [soonOpen, setSoonOpen] = useState(false);
  const mapBoxRef = useRef(null);

  const guCounts = useMemo(() => {
    const c = {};
    places.forEach((p) => { c[p.gu] = (c[p.gu] || 0) + 1; });
    return c;
  }, [places]);

  const visible = useMemo(() => {
    const q = filt.q.trim().toLowerCase();
    const v = places.filter((p) => {
      if (filt.gu && p.gu !== filt.gu) return false;
      if (filt.cat && (KINDS.includes(filt.cat) ? kindOf(p) !== filt.cat : !(p.items || []).includes(filt.cat))) return false;
      if (q && ![p.name, p.address, p.gu, p.memo].join(" ").toLowerCase().includes(q)) return false;
      if (filt.inView && bounds) {
        const pos = posOf(p, tempPos);
        if (!pos || pos.lat < bounds.s || pos.lat > bounds.n || pos.lng < bounds.w || pos.lng > bounds.e) return false;
      }
      return true;
    });
    if (me) {
      const d = (p) => { const pos = posOf(p, tempPos); return pos ? distanceKm(me, pos) : Infinity; };
      return v.sort((a, b) => d(a) - d(b));
    }
    return v.sort((a, b) => a.gu.localeCompare(b.gu, "ko") || a.name.localeCompare(b.name, "ko"));
  }, [places, filt, bounds, me, tempPos]);

  const selected = selectedId ? visible.find((p) => p.id === selectedId) || null : null;

  /* 카카오 지도 이동 (대체 지도일 때는 map이 null이라 아무것도 안 함) */
  const fitTo = useCallback((list) => {
    if (!map) return;
    const K = window.kakao.maps;
    const pts = list.map((p) => posOf(p, tempPos)).filter(Boolean);
    if (!pts.length) return;
    if (pts.length === 1) { map.setLevel(4); map.setCenter(new K.LatLng(pts[0].lat, pts[0].lng)); return; }
    const b = new K.LatLngBounds();
    pts.forEach((q) => b.extend(new K.LatLng(q.lat, q.lng)));
    map.setBounds(b, 40, 40, 40, 40);
  }, [map, tempPos]);

  // 처음 지도가 생기면 전체 장소가 보이게, 구를 바꾸면 그 구로
  useEffect(() => { if (map) fitTo(visible); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [map, filt.gu]);

  useEffect(() => {
    if (!map || !me) return;
    map.setLevel(5);
    map.setCenter(new window.kakao.maps.LatLng(me.lat, me.lng));
  }, [map, me]);

  const select = useCallback((id, from) => {
    setSelectedId(id);
    const p = places.find((x) => x.id === id);
    const pos = p && posOf(p, tempPos);
    if (from === "list" && pos) {
      if (map) {
        if (map.getLevel() > 4) map.setLevel(4);
        map.panTo(new window.kakao.maps.LatLng(pos.lat, pos.lng));
      }
      if (window.innerWidth <= 900) mapBoxRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
    if (from === "map") {
      document.querySelector(`.rm-card[data-id="${CSS.escape(id)}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [places, tempPos, map]);

  const onIdle = useCallback((m) => {
    const b = m.getBounds();
    const sw = b.getSouthWest(), ne = b.getNorthEast();
    setBounds({ s: sw.getLat(), w: sw.getLng(), n: ne.getLat(), e: ne.getLng() });
  }, []);

  /* 카카오 장소 검색 (대략 위치 보정용, 카카오 지도가 떠 있을 때만) */
  const findOnKakao = useCallback((p) => new Promise((resolve) => {
    const K = window.kakao.maps;
    const near = posOf(p, tempPos);
    const opts = near ? { location: new K.LatLng(near.lat, near.lng), radius: 5000 } : {};
    new K.services.Places().keywordSearch(`${p.gu} ${searchName(p)}`, (data, status) => {
      resolve(status === K.services.Status.OK ? data.slice(0, 3) : []);
    }, opts);
  }), [tempPos]);

  const choose = useCallback((id, pos) => {
    setTempPos((t) => ({ ...t, [id]: pos }));
    setSelectedId(id);
    if (map) { map.setLevel(3); map.panTo(new window.kakao.maps.LatLng(pos.lat, pos.lng)); }
  }, [map]);

  /* 제보 */
  const geocode = useCallback((pos) => {
    setSuggest(null);
    const K = window.kakao.maps;
    new K.services.Geocoder().coord2Address(pos.lng, pos.lat, (res, status) => {
      if (status !== K.services.Status.OK || !res[0]) return;
      const r = res[0];
      setSuggest({ address: r.road_address?.address_name || r.address?.address_name || "", gu: r.address?.region_2depth_name || "" });
    });
  }, []);

  const startReport = () => {
    if (!REPORT_READY) { setSoonOpen(true); return; }
    if (!map) { setReportOpen(true); return; }
    setPicking(true);
    if (window.innerWidth <= 900) mapBoxRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };
  const onPick = (pos) => { setPicking(false); setPick(pos); geocode(pos); setReportOpen(true); };
  const onPickMove = (pos) => { setPick(pos); geocode(pos); };
  const closeReport = () => { setReportOpen(false); setPick(null); setSuggest(null); };

  const locMsg = locStatus === "denied" ? "위치 권한이 꺼져 있어요. 브라우저 설정에서 이 사이트의 위치 권한을 허용해 주세요."
    : locStatus === "error" ? "현재 위치를 찾지 못했어요. 잠시 후 다시 시도해 주세요." : "";
  const heading = me ? `내 주변 ${visible.length}곳` : `${filt.gu || "서울"} ${visible.length}곳`;

  /* 대체 지도: 키가 없거나 카카오 지도를 못 불러올 때 */
  const fallback = (note) => (
    <>
      <SeoulSvgMap places={visible} allPlaces={places} tempPos={tempPos} selectedId={selectedId} onSelect={select} me={me} />
      <span className="rm-chipNote rm-noteTop" role="note">{note}</span>
      {selected && (
        <div className="rm-floatCard">
          <button type="button" className="rm-x" aria-label="닫기" onClick={() => setSelectedId(null)}>×</button>
          <b>{selected.name}</b>
          <span>{[selected.gu, kindOf(selected), selected.hours].filter(Boolean).join(" · ")}</span>
          {!isExact(selected, tempPos) && <span className="rm-warnText">대략 위치예요. 카카오맵에서 확인하세요.</span>}
          <div className="rm-links">
            {placeLinks(selected, tempPos).filter((l) => !l.muted).map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="rm">
      <div className="rm-wrap">
        <div className="rm-titleRow">
          <h1>수거함 찾기</h1>
          <button type="button" className="rm-report" onClick={startReport}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" fill="#121614" />
              <path d="M12 7v6M9 10h6" stroke="#CDEB45" strokeWidth="2" strokeLinecap="round" />
            </svg>
            수거함 제보하기
          </button>
        </div>

        <div className="rm-grid">
          <aside className="rm-side">
            <Filters filt={filt} setFilt={setFilt} guCounts={guCounts} />
            <div className="rm-countRow">
              <h2 aria-live="polite">{heading}</h2>
              {map && (
                <label className="rm-inView">
                  <input type="checkbox" checked={filt.inView} onChange={(e) => setFilt((f) => ({ ...f, inView: e.target.checked }))} /> 지도에 보이는 곳만
                </label>
              )}
            </div>
            {locMsg && <p className="rm-locMsg" role="status">{locMsg}</p>}
            <div className="rm-list">
              {visible.length === 0 && (
                <div className="rm-empty">
                  {filt.gu && !guCounts[filt.gu] ? `${filt.gu}는 아직 등록된 곳이 없어요. 아는 곳이 있으면 제보해 주세요.` : "조건에 맞는 곳이 없어요."}
                </div>
              )}
              {visible.slice(0, 300).map((p) => (
                <PlaceCard
                  key={p.id}
                  p={p}
                  me={me}
                  tempPos={tempPos}
                  active={p.id === selectedId}
                  onSelect={select}
                  onFind={map ? findOnKakao : null}
                  onChoose={choose}
                />
              ))}
            </div>
            <p className="rm-foot">투명페트병은 내용물을 비우고 라벨을 떼어 찌그러뜨려 넣어 주세요. 위치는 구청 홈페이지와 언론 보도를 모은 것이라 바뀌었을 수 있어요.</p>
          </aside>

          <section className="rm-mapBox" aria-label="지도" ref={mapBoxRef}>
            {KAKAO_JS_KEY ? (
              <MapView
                places={visible}
                tempPos={tempPos}
                selected={selected}
                onSelect={select}
                onClose={() => setSelectedId(null)}
                me={me}
                picking={picking}
                pick={pick}
                onPick={onPick}
                onPickMove={onPickMove}
                onMapCreate={setMap}
                onIdle={onIdle}
                fallback={fallback}
              />
            ) : fallback("카카오맵을 불러올 수 없어 기본 지도로 표시합니다.")}

            <span className="rm-chipNote rm-legend" aria-hidden={!!picking}>
              <span><i className="rm-lg rm-lgAi" />AI 무인회수기</span>
              <span><i className="rm-lg rm-lgGen" />일반 수거함</span>
              {places.some((p) => p.isSub) && <span><i className="rm-lg rm-lgSub" />이용자 제보</span>}
            </span>

            {map && (
              <span className="rm-zoom">
                <button type="button" aria-label="확대" onClick={() => map.setLevel(map.getLevel() - 1, { animate: true })}>+</button>
                <button type="button" aria-label="축소" onClick={() => map.setLevel(map.getLevel() + 1, { animate: true })}>−</button>
              </span>
            )}

            <button type="button" className="rm-locate" onClick={locate} disabled={locStatus === "loading"} aria-label="내 위치에서 가까운 곳 보기">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#121614" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" fill="#3E9BEA" stroke="#3E9BEA" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
              {locStatus === "loading" ? "찾는 중…" : me ? "내 위치 다시 찾기" : "내 위치"}
            </button>

            {picking && (
              <div className="rm-pickBar">
                지도를 눌러 수거함 위치를 찍어 주세요. 핀은 끌어서 옮길 수 있어요.{" "}
                <button type="button" className="rm-link" onClick={() => setPicking(false)}>취소</button>
              </div>
            )}
          </section>
        </div>
      </div>

      <ReportDialog open={reportOpen} onClose={closeReport} pick={pick} suggest={suggest} submit={submit} mapReady={Boolean(map)} />
      <ComingSoonDialog open={soonOpen} onClose={() => setSoonOpen(false)} message="수거함 제보 기능은 곧 열릴 예정이에요. 조금만 기다려 주세요." />
    </div>
  );
}
