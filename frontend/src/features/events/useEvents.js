import { createContext, useContext } from "react";

export const EventsContext = createContext(null);

/** 이벤트 화면 공용 상태 (포인트, 출석, 퀴즈). <EventsProvider> 안에서만 쓸 수 있습니다. */
export function useEvents() {
  const v = useContext(EventsContext);
  if (!v) throw new Error("useEvents는 <EventsProvider> 안에서만 쓸 수 있어요.");
  return v;
}
