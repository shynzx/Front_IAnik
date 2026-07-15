import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> { label: string; error?: string; hint?: string; }

export default function FormField({ label, error, hint, id, ...props }: FormFieldProps) {
  const fieldId = id ?? props.name;
  return <label className="ui-field" htmlFor={fieldId}><span>{label}</span><input id={fieldId} className="ui-input" aria-invalid={!!error} aria-describedby={error ? `${fieldId}-error` : undefined} {...props} />{error ? <small id={`${fieldId}-error`} role="alert">{error}</small> : hint ? <small>{hint}</small> : null}</label>;
}
