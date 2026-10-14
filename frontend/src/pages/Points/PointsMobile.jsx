/* 자동 변환: claude.ai 캔버스 "POTEN 앱 첫 화면 시안" v4.5 실사 비교 → v45pm_Points.dc.html
   화면 모양은 시안 그대로입니다. 문구·데이터를 바꿀 때는 아래 JSX와 Component.renderVals()를 고치세요. */
import { Link } from 'react-router-dom'
import { DCLogic, useDcLogic } from '../../lib/dc'

// 시안의 화면 로직 (상태·버튼 동작). renderVals()가 돌려준 값을 V.이름 으로 씁니다.
// eslint-disable-next-line
class Component extends DCLogic {
renderVals() { return {}; }
}

export default function PointsMobile() {
  useDcLogic(Component)
  return (
    <div style={{ boxSizing: "border-box", position: "relative", background: "#F7F8F4", color: "#121614", fontFamily: "'Gothic A1', sans-serif", letterSpacing: "-0.3px", width: "100%", maxWidth: "560px", margin: "0 auto", minHeight: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 12px 4px 6px" }}>
        <Link to="/" aria-label="뒤로가기" style={{ width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#121614" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <span style={{ fontSize: "17px", fontWeight: "800" }}>
          포인트 적립 현황
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          <Link to="/forest" title="물방울" style={{ height: "34px", padding: "0 10px 0 6px", borderRadius: "999px", background: "#E3F1FC", display: "flex", alignItems: "center", gap: "4px", fontSize: "14px", fontWeight: "800", color: "#17507F" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
              <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
            </svg>
            12
          </Link>
        </div>
      </div>
      <main style={{ padding: "8px 20px 130px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: "#121614", borderRadius: "22px", padding: "20px", boxSizing: "border-box", color: "#FFFFFF", position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: "14px", color: "#C9CEC9" }}>
              보유 포인트
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "6px" }}>
              <span style={{ fontSize: "40px", fontWeight: "800", letterSpacing: "-1px", color: "#CDEB45" }}>
                6,170
              </span>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                P
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px", marginTop: "18px" }}>
              <Link to="/forest" style={{ padding: "14px 12px", borderRadius: "18px", background: "#17507F", color: "#FFFFFF" }}>
                <div style={{ fontSize: "12px", color: "#CFE6F8", display: "flex", alignItems: "center", gap: "4px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#7CC4FF" />
                    <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                  </svg>
                  물방울
                </div>
                <div style={{ fontSize: "20px", fontWeight: "800", marginTop: "4px" }}>
                  12개
                </div>
              </Link>
              <div style={{ padding: "14px 12px", borderRadius: "18px", background: "#2E3632" }}>
                <div style={{ fontSize: "12px", color: "#C9CEC9" }}>
                  누적 배출
                </div>
                <div style={{ fontSize: "20px", fontWeight: "800", marginTop: "4px" }}>
                  320개
                </div>
              </div>
              <div style={{ padding: "14px 12px", borderRadius: "18px", background: "#2E3632" }}>
                <div style={{ fontSize: "12px", color: "#C9CEC9" }}>
                  탄소 절감
                </div>
                <div style={{ fontSize: "20px", fontWeight: "800", marginTop: "4px" }}>
                  32.6
                  <span style={{ fontSize: "12px" }}>
                    {" kg"}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "10px" }}>
              <Link to="/donate" style={{ height: "48px", borderRadius: "14px", background: "#CDEB45", color: "#121614", fontSize: "15px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center" }}>
                기부하기
              </Link>
              <a href="#shop" style={{ height: "48px", borderRadius: "14px", border: "1.5px solid #5E645F", color: "#FFFFFF", fontSize: "15px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>
                저탄소 제품 구매
              </a>
            </div>
          </div>
          <div style={{ background: "#EAF7EE", borderRadius: "22px", padding: "20px", boxSizing: "border-box", display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <span style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
              <svg width="38" height="38" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <path d="M20 10V5.5" stroke="#2A9C52" strokeWidth="2" strokeLinecap="round" />
                <path d="M20 6.5c0-2.6-1.8-4-4.3-4 0 2.5 1.8 4 4.3 4z" fill="#5BCB6E" />
                <path d="M20 6.5c0-2.6 1.8-4 4.3-4 0 2.5-1.8 4-4.3 4z" fill="#3FB35A" />
                <rect x="4" y="18" width="4" height="8" rx="2" fill="#2A9C52" />
                <rect x="32" y="18" width="4" height="8" rx="2" fill="#2A9C52" />
                <rect x="6.5" y="9.5" width="27" height="25" rx="11.5" fill="#3DBB62" />
                <rect x="10.5" y="15" width="19" height="13" rx="6.5" fill="#1E2B3A" />
                <circle cx="16" cy="21.5" r="2.3" fill="#8FF0B0" />
                <circle cx="24" cy="21.5" r="2.3" fill="#8FF0B0" />
              </svg>
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: "800", color: "#1F7A3A" }}>
                AI 배출 브리핑
              </span>
              <span style={{ fontSize: "16px", fontWeight: "700", lineHeight: "1.5" }}>
                플라스틱을 분해하는데 100년. 이번주 플라스틱 제품을 많이 사용하셨어요. 플라스틱을 줄여볼까요?
              </span>
            </span>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                월별 포인트 적립
              </span>
              <span style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "999px", background: "#F2F3EE" }}>
                <span style={{ height: "30px", padding: "0 12px", borderRadius: "999px", fontSize: "13px", display: "flex", alignItems: "center", color: "#454B47" }}>
                  일별
                </span>
                <span style={{ height: "30px", padding: "0 12px", borderRadius: "999px", fontSize: "13px", display: "flex", alignItems: "center", color: "#454B47" }}>
                  주별
                </span>
                <span style={{ height: "30px", padding: "0 12px", borderRadius: "999px", fontSize: "13px", display: "flex", alignItems: "center", background: "#121614", color: "#FFFFFF", fontWeight: "700" }}>
                  월별
                </span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "174px" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "#5E645F" }}>
                  620
                </span>
                <span style={{ width: "100%", height: "87px", borderRadius: "10px", background: "#E4E6E0" }} />
                <span style={{ fontSize: "12px", color: "#5E645F" }}>
                  4월
                </span>
              </div>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "#5E645F" }}>
                  820
                </span>
                <span style={{ width: "100%", height: "116px", borderRadius: "10px", background: "#E4E6E0" }} />
                <span style={{ fontSize: "12px", color: "#5E645F" }}>
                  5월
                </span>
              </div>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: "800" }}>
                  1,060
                </span>
                <span style={{ width: "100%", height: "150px", borderRadius: "10px", background: "#121614" }} />
                <span style={{ fontSize: "12px", color: "#5E645F" }}>
                  6월
                </span>
              </div>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "#5E645F" }}>
                  680
                </span>
                <span style={{ width: "100%", height: "96px", borderRadius: "10px", background: "#E4E6E0" }} />
                <span style={{ fontSize: "12px", color: "#5E645F" }}>
                  7월
                </span>
              </div>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "#5E645F" }}>
                  710
                </span>
                <span style={{ width: "100%", height: "100px", borderRadius: "10px", background: "#E4E6E0" }} />
                <span style={{ fontSize: "12px", color: "#5E645F" }}>
                  8월
                </span>
              </div>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: "800" }}>
                  190
                </span>
                <span style={{ width: "100%", height: "26px", borderRadius: "10px", background: "#CDEB45", border: "1.5px dashed #121614", boxSizing: "border-box" }} />
                <span style={{ fontSize: "12px", color: "#5E645F" }}>
                  9월
                </span>
              </div>
            </div>
            <div style={{ fontSize: "13px", color: "#454B47", marginTop: "12px" }}>
              6월에 가장 많이 모았어요 · 10월은 진행 중
            </div>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                내가 분리배출한 품목
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <b>
                    플라스틱
                  </b>
                  <span style={{ color: "#454B47" }}>
                    144개
                  </span>
                </div>
                <div style={{ height: "10px", borderRadius: "999px", background: "#F2F3EE", marginTop: "6px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "100%", borderRadius: "999px", background: "#3E9BEA" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <b>
                    캔 · 금속
                  </b>
                  <span style={{ color: "#454B47" }}>
                    80개
                  </span>
                </div>
                <div style={{ height: "10px", borderRadius: "999px", background: "#F2F3EE", marginTop: "6px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "55%", borderRadius: "999px", background: "#8B918C" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <b>
                    종이
                  </b>
                  <span style={{ color: "#454B47" }}>
                    64개
                  </span>
                </div>
                <div style={{ height: "10px", borderRadius: "999px", background: "#F2F3EE", marginTop: "6px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "44%", borderRadius: "999px", background: "#C9A36B" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <b>
                    유리
                  </b>
                  <span style={{ color: "#454B47" }}>
                    32개
                  </span>
                </div>
                <div style={{ height: "10px", borderRadius: "999px", background: "#F2F3EE", marginTop: "6px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "22%", borderRadius: "999px", background: "#3FA35A" }} />
                </div>
              </div>
            </div>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                최근 적립 내역
              </span>
              <a href="#history" style={{ fontSize: "14px", color: "#454B47", padding: "8px 0" }}>
                전체보기 ›
              </a>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F0F1EC" }}>
              <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "14px", fontWeight: "700" }}>
                  친구초대 · 오*원님
                </span>
                <span style={{ fontSize: "12px", color: "#6B716D" }}>
                  오늘 10:20
                </span>
              </span>
              <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                <b style={{ fontSize: "15px" }}>
                  +[N]P
                </b>
                <span style={{ fontSize: "11px", color: "#17507F" }} />
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F0F1EC" }}>
              <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "14px", fontWeight: "700" }}>
                  AI 인식 · 투명 페트병
                </span>
                <span style={{ fontSize: "12px", color: "#6B716D" }}>
                  오늘 09:12
                </span>
              </span>
              <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                <b style={{ fontSize: "15px" }}>
                  +1P
                </b>
                <span style={{ fontSize: "11px", color: "#17507F" }}>
                  물방울 +1
                </span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F0F1EC" }}>
              <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "14px", fontWeight: "700" }}>
                  실천 인증 게시
                </span>
                <span style={{ fontSize: "12px", color: "#6B716D" }}>
                  10.05
                </span>
              </span>
              <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                <b style={{ fontSize: "15px" }}>
                  +5P
                </b>
                <span style={{ fontSize: "11px", color: "#17507F" }}>
                  물방울 +5
                </span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F0F1EC" }}>
              <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "14px", fontWeight: "700" }}>
                  오늘의 퀴즈 정답
                </span>
                <span style={{ fontSize: "12px", color: "#6B716D" }}>
                  10.04
                </span>
              </span>
              <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                <b style={{ fontSize: "15px" }}>
                  +50P
                </b>
                <span style={{ fontSize: "11px", color: "#17507F" }} />
              </span>
            </div>
          </div>
          <div id="shop" style={{ background: "#EEF0EA", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <span style={{ height: "26px", padding: "0 10px", borderRadius: "999px", background: "#CDEB45", fontSize: "12px", fontWeight: "800", display: "inline-flex", alignItems: "center" }}>
              참여기업 제품은 포인트 2배
            </span>
            <div style={{ fontSize: "20px", fontWeight: "800", lineHeight: "1.35", marginTop: "12px" }}>
              모은 포인트로 저탄소 제품과 함께해요
            </div>
            <div style={{ fontSize: "14px", color: "#454B47", marginTop: "6px" }}>
              포인트로 결제하고, 다 쓴 용기는 다시 분리배출하면 또 적립돼요.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", marginTop: "18px" }}>
              <a href="#product" style={{ borderRadius: "22px", background: "#FFFFFF", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <span style={{ height: "120px", background: "#E8F3E4", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", isolation: "isolate" }}>
                  <img src="/design/3751b0f61bc5806919065836a8b923f2.jpg" alt="바구니에 담긴 채소 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                </span>
                <span style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "12px", color: "#5E645F" }}>
                    자연상점 · 친환경인증
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>
                    [제품명]
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: "800" }}>
                    [가격]원
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#1F5C3F" }}>
                    구매 시 포인트 2배
                  </span>
                </span>
              </a>
              <a href="#product" style={{ borderRadius: "22px", background: "#FFFFFF", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <span style={{ height: "120px", background: "#E6F0FB", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", isolation: "isolate" }}>
                  <img src="/design/4fd29259087713176c80dcc3fb3c4e43.jpg" alt="초록 텀블러 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                </span>
                <span style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "12px", color: "#5E645F" }}>
                    올가홀푸드 · 환경표지
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>
                    [제품명]
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: "800" }}>
                    [가격]원
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#1F5C3F" }}>
                    구매 시 포인트 2배
                  </span>
                </span>
              </a>
              <a href="#product" style={{ borderRadius: "22px", background: "#FFFFFF", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <span style={{ height: "120px", background: "#FFF3D6", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", isolation: "isolate" }}>
                  <img src="/design/168a7e44e8a1d376f6292f58ccc86bac.jpg" alt="제철 채소와 과일 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                </span>
                <span style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "12px", color: "#5E645F" }}>
                    두레생협 · 리필
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>
                    [제품명]
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: "800" }}>
                    [가격]원
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#1F5C3F" }}>
                    구매 시 포인트 2배
                  </span>
                </span>
              </a>
              <a href="#product" style={{ borderRadius: "22px", background: "#FFFFFF", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <span style={{ height: "120px", background: "#FFEEE6", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", isolation: "isolate" }}>
                  <img src="/design/6533f2ecb04c60d2eadd60301f7d8bac.jpg" alt="채소 진열대 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                </span>
                <span style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "12px", color: "#5E645F" }}>
                    농협하나로유통 · 무포장
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>
                    [제품명]
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: "800" }}>
                    [가격]원
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#1F5C3F" }}>
                    구매 시 포인트 2배
                  </span>
                </span>
              </a>
            </div>
            <a href="#shop-home" style={{ marginTop: "18px", height: "58px", borderRadius: "18px", background: "#121614", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", fontSize: "16px", fontWeight: "800" }}>
              저탄소샵 둘러보기
              <span>
                ›
              </span>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
