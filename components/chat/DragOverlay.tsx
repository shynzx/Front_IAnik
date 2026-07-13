interface DragOverlayProps {
  onDrop: (files: FileList) => void;
  onLeave: () => void;
}

export default function DragOverlay({ onDrop, onLeave }: DragOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[70] bg-black/72 backdrop-blur-[8px] flex items-center justify-center"
      onDragLeave={(e) => !e.relatedTarget && onLeave()}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(e.dataTransfer.files);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <div
        className="border-2 border-dashed border-[#826dd2] rounded-3xl py-16 px-20 bg-[rgba(130,109,210,0.07)] backdrop-blur-[20px] text-center"
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mb-5 block"
        >
          <path d="M7 18a4.6 4.4 0 010-9 5 4.5 0 0111 2h1a3.5 3.5 0 010 7H8.5" />
          <polyline points="9 15 12 12 15 15" />
          <line x1="12" y1="12" x2="12" y2="21" />
        </svg>
        <h3
          className="font-normal text-xl bg-gradient-to-r from-white to-[#a5a5a5] bg-clip-text text-transparent mb-2"
        >
          Suelta tu archivo aquí
        </h3>
        <p className="font-light text-sm text-white/40">
          Lo procesaremos automáticamente
        </p>
      </div>
    </div>
  );
}
