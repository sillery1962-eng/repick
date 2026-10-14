/* v4.5 시안의 아이콘들 (물방울, 포인트 동전, 나무 성장 단계, 화살표) */

export function Drop({ size = 18, color = "#3E9BEA" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill={color} />
      <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function Coin({ size = 20 }) {
  return <span className="ev-coin" style={{ width: size, height: size, fontSize: Math.round(size / 2) }} aria-hidden="true">P</span>;
}

export function Back() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

/** 나무 성장 단계 아바타 */
export function Tree({ stage = "bigTree", size = 52 }) {
  const ground = (
    <>
      <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
      <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
    </>
  );
  const big = (
    <>
      <rect x="55" y="62" width="10" height="44" rx="3" fill="#8A5A3C" />
      <path d="M60 84l-12-10M60 78l12-9" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="44" r="26" fill="#2E8B4E" />
      <circle cx="37" cy="58" r="17" fill="#2E8B4E" />
      <circle cx="83" cy="58" r="17" fill="#2E8B4E" />
      <circle cx="52" cy="36" r="10" fill="#45A862" />
    </>
  );
  const body = {
    fruitTree: (
      <>
        {big}
        {[[46, 44], [70, 34], [64, 58], [36, 62], [84, 56], [56, 24]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="#F08A24" />)}
      </>
    ),
    bigTree: big,
    youngTree: (
      <>
        <rect x="56.5" y="70" width="7" height="36" rx="2.5" fill="#8A5A3C" />
        <circle cx="60" cy="58" r="20" fill="#3FA35A" />
        <circle cx="44" cy="68" r="12" fill="#3FA35A" />
        <circle cx="76" cy="68" r="12" fill="#3FA35A" />
        <circle cx="54" cy="52" r="7" fill="#5DB85A" />
      </>
    ),
    stem: (
      <>
        <path d="M60 106V52" stroke="#3E8E45" strokeWidth="4" strokeLinecap="round" />
        <path d="M60 92c0-9-7-14-16-14 0 9 7 14 16 14z" fill="#6CC25F" />
        <path d="M60 80c0-9 7-14 16-14 0 9-7 14-16 14z" fill="#4EAE52" />
        <path d="M60 68c0-8-6-12-14-12 0 8 6 12 14 12z" fill="#6CC25F" />
        <path d="M60 58c0-7 5-11 12-11 0 7-5 11-12 11z" fill="#4EAE52" />
      </>
    ),
    sapling: (
      <>
        <rect x="57" y="66" width="6" height="40" rx="2" fill="#8A5A3C" />
        <path d="M60 22l22 30H38z" fill="#3FA35A" />
        <path d="M60 38l27 34H33z" fill="#2E8B4E" />
      </>
    ),
  }[stage];
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      {ground}
      {body}
    </svg>
  );
}

export function Sparkle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="#CDEB45" />
    </svg>
  );
}
