import './Card.css'

/**
 * 공통 카드 (흰 둥근 상자)
 * title: 카드 위쪽 제목 (없으면 생략)
 * action: 제목 오른쪽에 둘 요소 (예: '전체 보기' 링크)
 */
export default function Card({ title, action, className = '', children }) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || action) && (
        <div className="card-head">
          {title && <h2 className="card-title">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
