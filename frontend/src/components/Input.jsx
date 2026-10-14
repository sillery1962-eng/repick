import { useId } from 'react'
import './Input.css'

/**
 * 공통 입력칸 (이름표 + 입력 + 안내/오류 문구)
 * label: 이름표 (필수, 화면 읽기 프로그램용으로도 쓰임)
 * hint: 아래 안내 문구
 * error: 오류 문구 (있으면 빨간 테두리)
 * 나머지(value, onChange, type, placeholder …)는 <input>에 그대로 전달됩니다.
 */
export default function Input({ label, hint, error, id, className = '', ...rest }) {
  const autoId = useId()
  const inputId = id || autoId
  const noteId = `${inputId}-note`
  const note = error || hint

  return (
    <div className={`field ${className}`.trim()}>
      <label htmlFor={inputId} className="field-label">{label}</label>
      <input
        id={inputId}
        className={error ? 'field-input field-input-error' : 'field-input'}
        aria-invalid={error ? true : undefined}
        aria-describedby={note ? noteId : undefined}
        {...rest}
      />
      {note && (
        <p id={noteId} className={error ? 'field-note field-note-error' : 'field-note'}>
          {note}
        </p>
      )}
    </div>
  )
}
