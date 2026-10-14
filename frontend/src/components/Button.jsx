import './Button.css'

/**
 * 공통 버튼
 * variant: 'primary'(검정, 기본) | 'accent'(연두) | 'ghost'(회색)
 * size: 'md'(기본) | 'lg'
 * fullWidth: true면 가로로 꽉 차게
 * 나머지(onClick, disabled, type …)는 <button>에 그대로 전달됩니다.
 */
export default function Button({ variant = 'primary', size = 'md', fullWidth = false, type = 'button', className = '', children, ...rest }) {
  const classes = ['btn', `btn-${variant}`, `btn-${size}`, fullWidth ? 'btn-full' : '', className].filter(Boolean).join(' ')
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}
