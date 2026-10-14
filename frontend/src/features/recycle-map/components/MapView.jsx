import { CustomOverlayMap, Map, MapMarker, MarkerClusterer, useKakaoLoader } from "react-kakao-maps-sdk";
import { KAKAO_JS_KEY, SEOUL_CENTER } from "../lib/constants";
import { markerImage } from "../lib/markerImage";
import { isExact, kindOf, placeLinks, posOf } from "../lib/place";

/**
 * 카카오 지도. KAKAO_JS_KEY가 있을 때만 렌더링하세요 (useKakaoLoader는 키가 비어 있어도 스크립트를 불러오려고 함).
 * 스크립트를 못 불러오면 `fallback`(서울 구 경계 대체 지도)을 대신 보여 줍니다.
 */
export default function MapView({ places, tempPos, selected, onSelect, onClose, me, picking, pick, onPick, onPickMove, onMapCreate, onIdle, fallback }) {
  const [loading, error] = useKakaoLoader({ appkey: KAKAO_JS_KEY, libraries: ["clusterer", "services"] });

  if (error) {
    // 화면에는 짧은 안내만 보이고, 개발자용 원인 힌트는 콘솔에 남깁니다.
    console.warn("[recycle-map] 카카오 지도 로드 실패: JavaScript 키, JavaScript SDK 도메인 등록(" + location.origin + "), 카카오맵 사용 설정을 확인하세요.", error);
    return fallback("카카오맵을 불러올 수 없어 기본 지도로 표시합니다.");
  }
  if (loading) return <div className="rm-mapMsg"><span>지도를 불러오는 중…</span></div>;

  const sel = selected && posOf(selected, tempPos);

  return (
    <Map
      center={SEOUL_CENTER}
      level={8}
      className="rm-map"
      onCreate={onMapCreate}
      onIdle={onIdle}
      onClick={(_, e) => picking && onPick({ lat: e.latLng.getLat(), lng: e.latLng.getLng() })}
    >
      <MarkerClusterer averageCenter minLevel={7} gridSize={50}>
        {places.map((p) => {
          const pos = posOf(p, tempPos);
          if (!pos) return null;
          return <MapMarker key={p.id} position={pos} image={markerImage(p)} title={p.name} onClick={() => onSelect(p.id, "map")} />;
        })}
      </MarkerClusterer>

      {sel && (
        <CustomOverlayMap position={sel} yAnchor={1} zIndex={5} clickable>
          <div className="rm-bubble">
            <button type="button" className="rm-x" aria-label="닫기" onClick={onClose}>×</button>
            <b>{selected.name}</b>
            <div>{[kindOf(selected), (selected.items || []).join("·"), selected.hours].filter(Boolean).join(" · ")}</div>
            {!isExact(selected, tempPos) && <div className="rm-warnText">대략 위치입니다. 카카오맵에서 확인하세요.</div>}
            <div className="rm-links">
              {placeLinks(selected, tempPos).map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={l.muted ? "rm-src" : undefined}>{l.label}</a>
              ))}
            </div>
          </div>
        </CustomOverlayMap>
      )}

      {me && (
        <CustomOverlayMap position={me} xAnchor={0.5} yAnchor={0.5} zIndex={4}>
          <div className="rm-me" title="내 위치" />
        </CustomOverlayMap>
      )}

      {pick && (
        <MapMarker
          position={pick}
          draggable
          zIndex={6}
          onDragEnd={(m) => onPickMove({ lat: m.getPosition().getLat(), lng: m.getPosition().getLng() })}
        />
      )}
    </Map>
  );
}
