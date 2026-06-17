import { pp, gradText } from "./tokens";

export default function ChatReadyBanner() {
  return (
    <div style={{ marginTop: 24, marginBottom: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
<<<<<<< HEAD
        <div style={{ marginTop: 2, color: "#826dd2", flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 3c4.97 0 9 3.582 9 8s-4.03 8-9 8-9-3.582-9-8 4.03-8 9-8" />
                <path d="M3 12c0-1.333.536-2.583 1.5-3.5" />
              </svg>
            </div>
=======
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
            color: "rgb(130,109,210)",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 3c4.97 0 9 3.582 9 8s-4.03 8-9 8-9-3.582-9-8 4.03-8 9-8"></path><path d="M3 12c0-1.333.536-2.583 1.5-3.5"></path></svg>
        </div>
>>>>>>> main
        <h1
          style={{
            fontWeight: 400,
            fontSize: 24,
            ...gradText,
            margin: 0,
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          ¡Listo!
        </h1>
      </div>
      <p
        style={{
          ...pp,
          fontSize: 17,
          lineHeight: "30px",
          maxWidth: 520,
          ...gradText,
        }}
      >
        Tus apuntes y documentos están guardados de manera segura. Ahora
        puedo usarlos para darte respuestas claras y útiles cada vez que lo
        necesites.
      </p>
    </div>
  );
}