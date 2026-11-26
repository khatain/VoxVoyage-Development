import type { EgyptPerformMissionId } from '../../types/game';

export function EgyptPerformMissionEmblemSVG({
  performMissionId,
  className = 'h-12 w-12',
}: {
  performMissionId: EgyptPerformMissionId;
  className?: string;
}) {
  switch (performMissionId) {
    case 'perf_m1_expedition_leader':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="perfM1Bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#0F4C5C" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="url(#perfM1Bg)" />
          <path d="M12 50 L32 18 L52 50 Z" fill="#FDE68A" stroke="#92400E" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M26 50 L32 32 L38 50 Z" fill="#FFFBEB" />
          <circle cx="32" cy="14" r="5" fill="#FBBF24" />
          <path d="M32 14 L46 18 L32 22 Z" fill="#E7B43C" />
        </svg>
      );
    case 'perf_m2_master_navigator':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="perfM2Bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="url(#perfM2Bg)" />
          <circle cx="32" cy="32" r="20" fill="#FFFBEB" stroke="#FBBF24" strokeWidth="2" />
          <polygon points="32,14 38,32 26,32" fill="#0D9488" />
          <polygon points="32,50 38,32 26,32" fill="#94A3B8" />
          <circle cx="32" cy="32" r="4" fill="#E7B43C" stroke="#78350F" strokeWidth="1.5" />
        </svg>
      );
    case 'perf_m3_knowledge_keeper':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="perfM3Bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="url(#perfM3Bg)" />
          <rect x="14" y="18" width="36" height="28" rx="4" fill="#FEF3C7" stroke="#FBBF24" strokeWidth="1.8" />
          <line x1="20" y1="26" x2="44" y2="26" stroke="#92400E" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="20" y1="32" x2="40" y2="32" stroke="#0D9488" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="20" y1="38" x2="35" y2="38" stroke="#B45309" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="46" cy="42" r="6" fill="#0D9488" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M43.5 42 L45.3 43.8 L48.8 40" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'perf_m4_cultural_ambassador':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="perfM4Bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="url(#perfM4Bg)" />
          <rect x="13" y="44" width="38" height="6" rx="2" fill="#E7B43C" />
          <rect x="18" y="24" width="6" height="20" rx="1.5" fill="#FEF3C7" />
          <rect x="29" y="24" width="6" height="20" rx="1.5" fill="#FEF3C7" />
          <rect x="40" y="24" width="6" height="20" rx="1.5" fill="#FEF3C7" />
          <polygon points="10,24 32,12 54,24" fill="#FBBF24" stroke="#92400E" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="32" cy="19" r="3" fill="#0D9488" />
        </svg>
      );
    case 'perf_m5_grand_showcase':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="perfM5Bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E7B43C" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="url(#perfM5Bg)" />
          <path d="M16 50 L16 26 C16 17, 48 17, 48 26 L48 50 Z" fill="#121D36" stroke="#FEF3C7" strokeWidth="2" />
          <line x1="32" y1="19" x2="32" y2="50" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="32" cy="31" r="7" fill="#0D9488" stroke="#FDE68A" strokeWidth="1.8" />
          <rect x="29" y="28" width="6" height="6" rx="1.5" fill="#FDE68A" />
          <text x="32" y="45" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#FDE68A">SEALED</text>
        </svg>
      );
  }
}

export function EgyptShowcaseForecourtSVG({
  isNight,
  className = 'h-28 w-full',
}: {
  isNight: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 420 110" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="egyptForecourtSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? '#0F1B33' : '#FEF3C7'} />
          <stop offset="100%" stopColor={isNight ? '#1E2E4E' : '#FDE68A'} />
        </linearGradient>
      </defs>
      <rect width="420" height="110" rx="16" fill="url(#egyptForecourtSky)" />
      {/* Distant Pyramids */}
      <polygon points="35,92 80,34 125,92" fill={isNight ? '#475569' : '#D97706'} opacity="0.55" />
      <polygon points="295,92 340,38 385,92" fill={isNight ? '#475569' : '#D97706'} opacity="0.55" />
      {/* Forecourt Plaza Floor */}
      <rect x="0" y="88" width="420" height="22" fill={isNight ? '#162340' : '#E7B43C'} opacity="0.45" />
      {/* Sealed Chamber Entrance */}
      <path d="M174 88 L174 34 C174 18, 246 18, 246 34 L246 88 Z" fill="#1E293B" stroke="#E7B43C" strokeWidth="2.5" />
      <line x1="210" y1="22" x2="210" y2="88" stroke="#FBBF24" strokeWidth="1.6" strokeDasharray="3 2" />
      <circle cx="210" cy="50" r="9" fill="#0D9488" stroke="#FDE68A" strokeWidth="2" />
      <rect x="206" y="46" width="8" height="8" rx="1.5" fill="#FDE68A" />
      {/* Banner Ribbon */}
      <rect x="136" y="74" width="148" height="14" rx="7" fill="#0D9488" />
      <text x="210" y="84" textAnchor="middle" fontSize="8" fontWeight="800" fill="#FFFFFF">
        FORECOURT · CHAMBER SEALED
      </text>
    </svg>
  );
}
