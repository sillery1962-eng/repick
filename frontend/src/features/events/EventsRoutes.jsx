import { Navigate, Route, Routes } from "react-router-dom";
import { EventsProvider } from "./EventsContext";
import EventsPage from "./pages/EventsPage";
import InvitePage from "./pages/InvitePage";
import MissionPage from "./pages/MissionPage";
import "./events.css";

/**
 * 이벤트 · 챌린지 기능의 모든 화면. 팀 앱 라우터에 이렇게 붙이면 됩니다:
 *   <Route path="/events/*" element={<EventsRoutes />} />
 *
 *   /events          이벤트 · 챌린지 (시안 첫 화면)
 *   /events/mission  오늘의 포인트 미션 (퀴즈 풀기)
 *   /events/invite   진행중인 이벤트: 친구 초대
 */
export default function EventsRoutes() {
  return (
    <EventsProvider>
      <Routes>
        <Route index element={<EventsPage />} />
        <Route path="mission" element={<MissionPage />} />
        <Route path="invite" element={<InvitePage />} />
        <Route path="*" element={<Navigate to="/events" replace />} />
      </Routes>
    </EventsProvider>
  );
}
