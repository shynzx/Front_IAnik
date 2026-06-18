"use client";

import { Component } from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
            fontFamily: "var(--font-poppins), sans-serif",
            background: "linear-gradient(135deg, #000000 0%, #3c2850 100%)",
            color: "#fff",
            gap: 16,
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h2 style={{ margin: 0, fontWeight: 600, fontSize: 20 }}>
            Algo salió mal
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 400, margin: 0, fontSize: 14, lineHeight: "22px" }}>
            {this.state.error?.message || "Ocurrió un error inesperado."}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            style={{
              padding: "10px 24px", borderRadius: 10, border: "1px solid rgba(130,109,210,0.3)",
              background: "rgba(130,109,210,0.15)", color: "#c4b5fd", cursor: "pointer",
              fontFamily: "var(--font-poppins), sans-serif", fontSize: 14, marginTop: 8,
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
