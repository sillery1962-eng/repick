export const GU_LIST = [
  "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구",
  "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구",
  "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구",
];

/** [표시 이름, CSS 클래스 접미사] */
export const ITEMS = [["투명페트", "pet"], ["캔", "can"], ["종이팩", "pack"], ["플라스틱병", "plastic"]];

export const KINDS = ["AI 무인회수기", "일반 수거함"];

/** 상단 필터 칩 (v4.5 시안). 종류(KINDS)이거나 품목(ITEMS) 이름입니다. */
export const CATEGORIES = [["", "전체"], ["AI 무인회수기", "AI 무인회수기"], ["일반 수거함", "일반 수거함"], ["투명페트", "투명 페트병"], ["캔", "캔"], ["종이팩", "종이팩"]];

export const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };

/** 서울 대략 경계. 제보 좌표 검증에 씁니다 (firestore.rules와 같은 값). */
export const SEOUL_BOUNDS = { minLat: 37.4, maxLat: 37.72, minLng: 126.75, maxLng: 127.2 };

export const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY || "";

export const REPORT_CONTACT = import.meta.env.VITE_REPORT_CONTACT || "";

// 수거함 제보 기능을 열지 여부. false면 제보 버튼을 눌렀을 때 "준비 중인 서비스입니다" 창만 뜹니다.
export const REPORT_READY = false;
