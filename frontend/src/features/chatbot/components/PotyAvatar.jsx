// 포티 캐릭터 그림 (기존 index.html 의 <template id="poty"> 를 컴포넌트로 옮김)
export default function PotyAvatar() {
  return (
    <svg className="avatar" viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="poty-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0F5A32" />
          <stop offset="1" stopColor="#8CD03F" />
        </linearGradient>
      </defs>
      <path d="M20 9 C17 4 12 4 11 6 C14 8 17 8 20 9 Z" fill="#8CD03F" />
      <path d="M20 9 C23 4 28 4 29 6 C26 8 23 8 20 9 Z" fill="#8CD03F" />
      <line x1="20" y1="9" x2="20" y2="13" stroke="#1F8A4C" strokeWidth="2" />
      <ellipse cx="20" cy="25" rx="15" ry="13" fill="url(#poty-g)" />
      <rect x="10" y="17" width="20" height="12" rx="5" fill="#0B2A1A" />
      <rect x="14" y="21" width="3" height="4" rx="1" fill="#7CF2C1" />
      <rect x="23" y="21" width="3" height="4" rx="1" fill="#7CF2C1" />
    </svg>
  );
}
