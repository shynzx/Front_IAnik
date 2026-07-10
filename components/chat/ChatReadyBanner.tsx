import type { CSSProperties } from "react";

const gradText: CSSProperties = {
  background: "linear-gradient(90deg, #ffffff 0%, #a5a5a5 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

export default function ChatReadyBanner() {
  return (
    <div className="mt-6 mb-8">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 overflow-hidden text-[rgb(130,109,210)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 3c4.97 0 9 3.582 9 8s-4.03 8-9 8-9-3.582-9-8 4.03-8 9-8"></path><path d="M3 12c0-1.333.536-2.583 1.5-3.5"></path></svg>
        </div>
        <h1
          className="font-normal text-2xl m-0 font-[family-name:var(--font-poppins)]"
          style={gradText}
        >
          ¡Listo!
        </h1>
      </div>
      <p
        className="text-base leading-8 max-w-[520px] font-[family-name:var(--font-poppins)] font-light"
        style={gradText}
      >
        Tus apuntes y documentos están guardados de manera segura. Ahora
        puedo usarlos para darte respuestas claras y útiles cada vez que lo
        necesites.
      </p>
    </div>
  );
}