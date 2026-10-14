import { useCallback, useEffect, useRef, useState } from "react";
import { Drop } from "./Icons";

/** 화면 아래에 2초 동안 뜨는 알림. const [toast, say] = useToast(); */
export function useToast() {
  const [msg, setMsg] = useState("");
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const say = useCallback((text) => {
    clearTimeout(timer.current);
    setMsg(text);
    timer.current = setTimeout(() => setMsg(""), 2000);
  }, []);
  const node = msg ? (
    <div className="ev-toast" role="status">
      <span><Drop color="#7CC4FF" />{msg}</span>
    </div>
  ) : null;
  return [node, say];
}
