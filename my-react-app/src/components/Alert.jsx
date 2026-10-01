export function Alert({ tone = 'error', title, children, onDismiss }) {
  return (
    <div className={`alert alert--${tone}`} role="alert">
      <div className="alert__body">
        {title ? <strong className="alert__title">{title}</strong> : null}
        <span>{children}</span>
      </div>
      {onDismiss ? (
        <button type="button" className="alert__close" onClick={onDismiss}>
          Dismiss
        </button>
      ) : null}
    </div>
  )
}
