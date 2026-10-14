
const BASE = import.meta.env.VITE_CHATBOT_API_URL || "http://localhost:8000";

export async function askChat(message, district) {
  const res = await fetch(`${BASE}/api/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      district: district || null,
    }),
  });

  if (!res.ok) {
    throw new Error(`챗봇 서버 오류: ${res.status}`);
  }

  return res.json();
}

export async function getDistricts() {
  const res = await fetch(`${BASE}/api/districts`);

  if (!res.ok) {
    throw new Error(`자치구 목록 오류: ${res.status}`);
  }

  const data = await res.json();
  return data.districts || [];
}