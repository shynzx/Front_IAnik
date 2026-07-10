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
        <div className="h-screen flex flex-col items-center justify-center p-6 text-center font-[family-name:var(--font-poppins)] bg-gradient-to-br from-black to-[#3c2850] text-white gap-4">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h2 className="m-0 font-semibold text-xl">
            Algo salió mal
          </h2>
          <p className="text-white/60 max-w-[400px] m-0 text-sm leading-[1.375rem]">
            {this.state.error?.message || "Ocurrió un error inesperado."}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            className="py-2.5 px-6 rounded-[0.625rem] border border-[rgba(130,109,210,0.3)] bg-[rgba(130,109,210,0.15)] text-[#c4b5fd] cursor-pointer font-[family-name:var(--font-poppins)] text-sm mt-2"
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
