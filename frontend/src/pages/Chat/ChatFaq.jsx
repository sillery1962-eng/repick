import { useState } from 'react';

// 챗봇 화면 오른쪽(모바일은 아래) "자주 묻는 질문" 카드 — 전에 있던 "헷갈리는 분류 사전" 자리
// 질문을 누르면 답이 펼쳐짐. 답은 서버 없이 아래 배열 (숫자·규칙은 docs/api-spec.md 2·3·5·6·8번과 같게)
// PC 푸터·마이페이지의 "자주 묻는 질문"이 이 화면(/chat)으로 옴
const FAQ = [
  {
    q: '물방울과 포인트는 뭐가 달라요?',
    a: '💧물방울은 나의 숲 나무를 키우는 데 쓰고, ⭐포인트는 기부에 써요. AI 인증에 성공하면 둘 다 함께 받아요.',
  },
  {
    q: 'AI 인증 적립은 하루 몇 번이에요?',
    a: '판별은 몇 번이든 할 수 있지만, 적립은 품목 상관없이 하루 5회까지예요 (한국 시간 0시 기준). 캔은 💧3·⭐30, 건전지는 💧4·⭐40, 종이·페트병·플라스틱·비닐은 💧1·⭐10이에요.',
  },
  {
    q: '나무는 어떻게 키워요?',
    a: '나의 숲에서 모은 물방울을 나무에 주면 자라요. 새싹부터 열매 나무까지 7단계, 모두 55개를 주면 수확하고 새 나무를 키워요.',
  },
  {
    q: '사은품은 어떻게 받아요?',
    a: '수확한 나무를 모아 친환경 쿠폰(1그루)·재활용 노트(2그루)·에코백(3그루)으로 바꿀 수 있어요. 5그루째를 수확하면 텀블러를 자동으로 드려요. 받은 사은품은 마이페이지 쿠폰함에 있어요.',
  },
  {
    q: '포인트는 어디에 써요?',
    a: '기부하기 화면에서 환경 단체에 1P부터 기부할 수 있어요. 포인트로 물건을 사는 기능은 없어요.',
  },
  {
    q: '친구 초대 코드는 어디서 입력해요?',
    a: '가입 화면의 추천인 코드 칸에 입력하면 첫 로그인 때 등록돼요. 초대한 친구에게 💧2를 드리고, 5명마다 ⭐1000을 더 드려요.',
  },
  {
    q: '포인트는 더 받을 수 없나요?',
    a: '출석 체크(💧1, 월~일 모두 출석하면 💧7 더), 하루 퀴즈(정답마다 ⭐10, 모두 맞히면 ⭐50 더), 커뮤니티 인증글(💧1·⭐1)로도 받을 수 있어요.',
  },
];

export default function ChatFaq({ mobile }) {
  const [open, setOpen] = useState(null); // 펼친 질문 번호
  const size = mobile ? { title: '20px', q: '14px', pad: '11px 0' } : { title: '17px', q: '13px', pad: '8px 0' };

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '22px', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ fontSize: size.title, fontWeight: '800', marginBottom: '10px' }}>자주 묻는 질문</div>
      {FAQ.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} style={{ borderBottom: i < FAQ.length - 1 ? '1px solid #F0F1EC' : 'none' }}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: size.pad, border: 'none', background: 'none', textAlign: 'left', fontSize: size.q, fontWeight: isOpen ? '800' : '600', color: isOpen ? '#1F7A3A' : '#121614', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <b style={{ color: '#1F7A3A' }}>Q</b>
              <span style={{ flexGrow: 1 }}>{item.q}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B918C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {isOpen ? (
              <p style={{ margin: '0 0 10px', padding: '10px 12px', borderRadius: '12px', background: '#F7F8F4', fontSize: size.q, lineHeight: '1.6', color: '#454B47', wordBreak: 'keep-all' }}>
                {item.a}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
