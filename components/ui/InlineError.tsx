interface InlineErrorProps { message: string; onRetry?: () => void; }

export default function InlineError({ message, onRetry }: InlineErrorProps) {
  return <div className="ui-inline-error" role="alert"><span>{message}</span>{onRetry && <button type="button" onClick={onRetry}>Reintentar</button>}</div>;
}
