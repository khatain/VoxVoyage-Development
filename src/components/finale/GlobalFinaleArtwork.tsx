import type { ResolvedAppearance } from '../../types/game';

interface ChamberUnsealingIllustrationSVGProps {
  stage: 'sealed' | 'glowing' | 'unsealed';
  appearance: ResolvedAppearance;
  reducedMotion?: boolean;
  className?: string;
}

/**
 * Architectural sandstone pylon & basalt double doors of the Chamber of Wisdom.
 * Animates or jumps directly from sealed -> glowing seal -> parted sanctuary doors.
 */
export function ChamberUnsealingIllustrationSVG({
  stage,
  appearance,
  reducedMotion = false,
  className = 'h-48 w-full max-w-[340px]',
}: ChamberUnsealingIllustrationSVGProps) {
  const isNight = appearance === 'night';
  const doorOffset = stage === 'unsealed' ? 28 : 0;
  const sealGlowOpacity = stage === 'sealed' ? 0.25 : stage === 'glowing' ? 0.95 : 0.65;
  const innerLightOpacity = stage === 'unsealed' ? 0.98 : stage === 'glowing' ? 0.5 : 0.08;
  const transitionClass = reducedMotion ? '' : 'transition-all duration-700 ease-out';

  return (
    <svg
      viewBox="0 0 320 200"
      className={className}
      role="img"
      aria-label={
        stage === 'unsealed'
          ? 'Chamber of Wisdom unsealed sandstone portal with golden inner glow'
          : stage === 'glowing'
            ? 'Chamber of Wisdom medallion seal awakening'
            : 'Chamber of Wisdom sealed basalt doors'
      }
    >
      <defs>
        <linearGradient id="chamberSkyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? '#0E172B' : '#1E3A5F'} />
          <stop offset="100%" stopColor={isNight ? '#1D2B4A' : '#325378'} />
        </linearGradient>
        <radialGradient id="sanctuaryPortalGlow" cx="50%" cy="56%" r="54%">
          <stop offset="0%" stopColor="#FFF7CC" />
          <stop offset="45%" stopColor="#F2C66D" />
          <stop offset="100%" stopColor="#24B8B0" stopOpacity="0.15" />
        </radialGradient>
      </defs>

      {/* Backdrop frame */}
      <rect width="320" height="200" rx="18" fill="url(#chamberSkyGrad)" />

      {/* Distant Giza silhouettes */}
      <polygon
        points="16,170 64,108 112,170"
        fill={isNight ? '#192642' : '#2C496B'}
        opacity="0.7"
      />
      <polygon
        points="210,170 258,112 306,170"
        fill={isNight ? '#192642' : '#2C496B'}
        opacity="0.7"
      />

      {/* Sandstone floor courtyard */}
      <rect x="0" y="168" width="320" height="32" fill={isNight ? '#3A3123' : '#C9A15E'} />
      <rect x="64" y="166" width="192" height="8" rx="3" fill={isNight ? '#5C4B33' : '#E2BA78'} />

      {/* Outer Temple Pylon Frame */}
      <polygon
        points="68,168 82,34 238,34 252,168"
        fill={isNight ? '#4A3C2A' : '#D9B16C'}
        stroke="#F2C66D"
        strokeWidth="2.5"
      />
      {/* Cornice Crown */}
      <rect
        x="76"
        y="24"
        width="168"
        height="14"
        rx="4"
        fill={isNight ? '#1E3A5F' : '#1E40AF'}
        stroke="#F2C66D"
        strokeWidth="2"
      />
      {/* Winged Sun Crest */}
      <circle cx="160" cy="31" r="7" fill="#F2C66D" />
      <path d="M122 31 H150 M170 31 H198" stroke="#24B8B0" strokeWidth="2.5" strokeLinecap="round" />

      {/* Carved columns */}
      <rect x="92" y="54" width="16" height="114" rx="2" fill={isNight ? '#604D36' : '#E7C582'} />
      <rect x="212" y="54" width="16" height="114" rx="2" fill={isNight ? '#604D36' : '#E7C582'} />

      {/* Sanctuary Portal Opening (visible behind parting doors) */}
      <rect
        x="114"
        y="62"
        width="92"
        height="106"
        rx="4"
        fill={stage === 'unsealed' ? 'url(#sanctuaryPortalGlow)' : '#101828'}
        className={transitionClass}
      />

      {/* Radiant rays when glowing/unsealed */}
      <g opacity={innerLightOpacity} className={transitionClass}>
        <polygon points="160,115 116,66 204,66" fill="#FDE68A" opacity="0.45" />
        <circle cx="160" cy="112" r="24" fill="#FFFBEB" opacity="0.72" />
        <polygon points="160,92 172,112 160,132 148,112" fill="#24B8B0" opacity="0.9" />
      </g>

      {/* Left & Right Basalt Double Doors */}
      <g style={{ transform: `translateX(${-doorOffset}px)` }} className={transitionClass}>
        <rect
          x="114"
          y="62"
          width="46"
          height="106"
          fill="#242C3D"
          stroke="#D4A14A"
          strokeWidth="2"
        />
        <line x1="122" y1="84" x2="152" y2="84" stroke="#F2C66D" strokeWidth="1.5" strokeOpacity="0.65" />
        <line x1="122" y1="146" x2="152" y2="146" stroke="#F2C66D" strokeWidth="1.5" strokeOpacity="0.65" />
      </g>
      <g style={{ transform: `translateX(${doorOffset}px)` }} className={transitionClass}>
        <rect
          x="160"
          y="62"
          width="46"
          height="106"
          fill="#242C3D"
          stroke="#D4A14A"
          strokeWidth="2"
        />
        <line x1="168" y1="84" x2="198" y2="84" stroke="#F2C66D" strokeWidth="1.5" strokeOpacity="0.65" />
        <line x1="168" y1="146" x2="198" y2="146" stroke="#F2C66D" strokeWidth="1.5" strokeOpacity="0.65" />
      </g>

      {/* Center Medallion Lock (fades away once unsealed) */}
      <g
        opacity={stage === 'unsealed' ? 0 : 1}
        className={transitionClass}
      >
        <circle
          cx="160"
          cy="115"
          r="16"
          fill="#1B2845"
          stroke="#F2C66D"
          strokeWidth="2.5"
        />
        <circle
          cx="160"
          cy="115"
          r="9"
          fill="#24B8B0"
          fillOpacity={sealGlowOpacity}
        />
      </g>
    </svg>
  );
}

interface GlobalExplorerCrestSVGProps {
  appearance: ResolvedAppearance;
  className?: string;
}

/**
 * Five-nation compass medallion representing India, Kenya, Scotland, Australia, and Egypt.
 */
export function GlobalExplorerCrestSVG({
  appearance,
  className = 'h-24 w-24',
}: GlobalExplorerCrestSVGProps) {
  const isNight = appearance === 'night';

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Global Explorer 5-Nation Compass Crest"
    >
      <circle
        cx="60"
        cy="60"
        r="54"
        fill={isNight ? '#162238' : '#FFFDF5'}
        stroke="#D4A14A"
        strokeWidth="3.5"
      />
      <circle
        cx="60"
        cy="60"
        r="46"
        fill="none"
        stroke="#24B8B0"
        strokeWidth="1.5"
        strokeDasharray="5 4"
      />
      {/* Compass Star */}
      <polygon points="60,14 69,48 104,60 69,72 60,106 51,72 16,60 51,48" fill="#F2C66D" opacity="0.28" />
      <polygon points="60,20 66,52 98,60 66,68 60,100 54,68 22,60 54,52" fill="#D4A14A" />
      {/* 5 Nation Jewels arranged harmoniously */}
      <circle cx="60" cy="24" r="5" fill="#D97B66" stroke="#FFFDF8" strokeWidth="1.2" />
      <circle cx="94" cy="49" r="5" fill="#2E7D32" stroke="#FFFDF8" strokeWidth="1.2" />
      <circle cx="81" cy="89" r="5" fill="#2563EB" stroke="#FFFDF8" strokeWidth="1.2" />
      <circle cx="39" cy="89" r="5" fill="#00A896" stroke="#FFFDF8" strokeWidth="1.2" />
      <circle cx="26" cy="49" r="5" fill="#F59E0B" stroke="#FFFDF8" strokeWidth="1.2" />
      <circle cx="60" cy="60" r="10" fill={isNight ? '#0F1B2E' : '#1E3A5F'} stroke="#F2C66D" strokeWidth="2.5" />
      <text
        x="60"
        y="63.5"
        textAnchor="middle"
        fill="#F2C66D"
        fontSize="9"
        fontWeight="900"
        letterSpacing="0.8"
      >
        5/5
      </text>
    </svg>
  );
}
