interface CloseButtonProps { onClick: () => void; label?: string }

export default function CloseButton({ onClick, label = "Cerrar" }: CloseButtonProps) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="ui-icon-button shrink-0">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </button>
  );
}
