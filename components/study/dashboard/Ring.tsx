export default function Ring({ percent, size = 44, stroke = 3.5, color = "#826dd2" }: { percent: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r, dash = (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={circ/4} strokeLinecap="round"
        style={{ transition: "stroke-dasharray .5s ease" }}/>
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="#fff"
        fontSize={size/4} fontFamily="var(--font-poppins),sans-serif" fontWeight={600}>{percent}%</text>
    </svg>
  );
}
