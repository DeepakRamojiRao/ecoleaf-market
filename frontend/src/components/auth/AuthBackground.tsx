/**
 * Full-page tropical backdrop used by the auth pages.
 *
 *   - A deep green mesh gradient fills the page (inline style — no Tailwind
 *     layer ordering surprises).
 *   - A field of stylized banana-leaf SVGs animates softly: most sway in
 *     place, a couple drift across the canvas, two large backdrop leaves
 *     rotate very slowly.
 *   - Pure decoration, fully aria-hidden, pointer-events-none.
 */

const MESH: React.CSSProperties = {
  background: [
    "radial-gradient(circle at 12% 18%, rgba(190, 242, 100, 0.25) 0%, transparent 38%)",
    "radial-gradient(circle at 88% 82%, rgba(56, 189, 248, 0.22) 0%, transparent 42%)",
    "radial-gradient(circle at 60% 35%, rgba(253, 224, 71, 0.18) 0%, transparent 36%)",
    "linear-gradient(135deg, #052e16 0%, #14532d 35%, #166534 65%, #047857 100%)",
  ].join(", "),
  backgroundSize: "200% 200%, 200% 200%, 200% 200%, 100% 100%",
  animation: "mesh-pan 18s ease-in-out infinite",
};

type LeafSpec = {
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  rotate: number;
  opacity: number;
  animation: string;
  duration: string;
  delay?: string;
};

// Hand-tuned positions to surround the centered card without occluding it.
const LEAVES: LeafSpec[] = [
  // Big backdrop leaves — slow rotation, way out at the edges
  { size: 520, top: "-160px", left: "-200px", rotate: -18, opacity: 0.16, animation: "leaf-spin-slow", duration: "120s" },
  { size: 600, bottom: "-220px", right: "-260px", rotate: 22, opacity: 0.14, animation: "leaf-spin-slow", duration: "150s", delay: "-40s" },

  // Mid-layer leaves — sway gently
  { size: 230, top: "8%", right: "10%", rotate: 28, opacity: 0.42, animation: "leaf-sway", duration: "7s" },
  { size: 200, bottom: "12%", left: "8%", rotate: -42, opacity: 0.4, animation: "leaf-sway", duration: "8.5s", delay: "-2s" },
  { size: 180, top: "14%", left: "6%", rotate: -22, opacity: 0.38, animation: "leaf-sway", duration: "6.5s", delay: "-1s" },
  { size: 160, bottom: "10%", right: "12%", rotate: 38, opacity: 0.36, animation: "leaf-sway", duration: "9s", delay: "-3s" },

  // Foreground accents — float vertically
  { size: 110, top: "30%", left: "18%", rotate: -55, opacity: 0.5, animation: "leaf-float", duration: "5s" },
  { size: 95, top: "70%", right: "22%", rotate: 35, opacity: 0.5, animation: "leaf-float", duration: "6s", delay: "-2s" },
  { size: 80, top: "20%", right: "28%", rotate: 12, opacity: 0.55, animation: "leaf-float", duration: "4.5s", delay: "-1s" },

  // Drifting travelers
  { size: 70, top: "55%", left: "4%", rotate: -10, opacity: 0.45, animation: "leaf-drift-x", duration: "16s" },
  { size: 60, top: "78%", left: "30%", rotate: 24, opacity: 0.45, animation: "leaf-drift-x", duration: "20s", delay: "-6s" },
];

export function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Mesh gradient fill */}
      <div className="absolute inset-0" style={MESH} />

      {/* Subtle veined-leaf texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'><g fill='none' stroke='%23ffffff' stroke-width='1'><path d='M30 210 Q 100 110 220 30'/><path d='M30 210 Q 70 170 110 150'/><path d='M70 170 Q 100 150 130 135'/><path d='M100 140 Q 130 125 160 110'/><path d='M130 110 Q 155 95 175 85'/><path d='M50 190 Q 80 140 120 110'/></g></svg>\")",
          backgroundSize: "280px 280px",
        }}
      />

      {/* Animated banana-leaf glyphs */}
      {LEAVES.map((spec, i) => (
        <BananaLeaf key={i} spec={spec} index={i} />
      ))}

      {/* Subtle bottom vignette so the centered card sits a touch lighter on the canvas. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(2, 44, 34, 0.35) 100%)",
        }}
      />
    </div>
  );
}

function BananaLeaf({ spec, index }: { spec: LeafSpec; index: number }) {
  const { size, top, left, right, bottom, rotate, opacity, animation, duration, delay } = spec;
  const id = `leaf-grad-${index}`;
  return (
    <svg
      viewBox="0 0 200 240"
      width={size}
      height={size * 1.2}
      className="leaf-anim absolute"
      style={{
        top,
        left,
        right,
        bottom,
        // The animations consume `--leaf-rot` so the resting rotation is stable.
        ["--leaf-rot" as string]: `${rotate}deg`,
        transform: `rotate(${rotate}deg)`,
        opacity,
        animation: `${animation} ${duration} ease-in-out infinite`,
        animationDelay: delay,
        transformOrigin: "50% 30%",
        willChange: "transform",
      } as React.CSSProperties}
    >
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#bbf7d0" />
          <stop offset="55%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      {/* Stylized banana-leaf silhouette */}
      <path
        d="M100 6 C 32 70, 18 162, 100 234 C 182 162, 168 70, 100 6 Z"
        fill={`url(#${id})`}
      />
      {/* Central vein */}
      <path
        d="M100 14 L 100 230"
        stroke="#022c22"
        strokeOpacity="0.45"
        strokeWidth="2.4"
        fill="none"
      />
      {/* Side veins */}
      {[36, 66, 96, 126, 156, 186].map((y) => (
        <g key={y}>
          <path
            d={`M100 ${y} Q 70 ${y + 14} 44 ${y + 32}`}
            stroke="#022c22"
            strokeOpacity="0.32"
            strokeWidth="1.6"
            fill="none"
          />
          <path
            d={`M100 ${y} Q 130 ${y + 14} 156 ${y + 32}`}
            stroke="#022c22"
            strokeOpacity="0.32"
            strokeWidth="1.6"
            fill="none"
          />
        </g>
      ))}
    </svg>
  );
}
