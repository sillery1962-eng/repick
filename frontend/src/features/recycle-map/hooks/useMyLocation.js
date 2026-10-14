import { useCallback, useState } from "react";

/** 버튼을 눌렀을 때만 위치를 요청합니다 (페이지 열자마자 권한 창을 띄우지 않음). */
export function useMyLocation() {
  const [me, setMe] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ok | denied | error
  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("ok");
      },
      (err) => setStatus(err.code === 1 ? "denied" : "error"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);
  return { me, status, locate };
}
