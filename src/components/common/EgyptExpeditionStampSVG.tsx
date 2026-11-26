import type { AppLanguage, ResolvedAppearance } from '../../types/game';

interface EgyptExpeditionStampSVGProps {
  language: AppLanguage;
  appearance: ResolvedAppearance;
  earned: boolean;
  completedAt?: string;
  sizeClass?: string;
}

function formatStampDate(isoDate?: string): string {
  const parsed = isoDate ? new Date(isoDate) : new Date();
  const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const day = safeDate.getDate().toString().padStart(2, '0');
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];
  const month = months[safeDate.getMonth()];
  const year = safeDate.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Custom Giza / Nile Egypt Passport Stamp featuring Great Pyramid silhouettes,
 * the unsealed Chamber of Wisdom sun portal, and sandstone-gold + lapis-teal ink.
 */
export function EgyptExpeditionStampSVG({
  language,
  appearance,
  earned,
  completedAt,
  sizeClass = 'h-32 w-32',
}: EgyptExpeditionStampSVGProps) {
  const isNight = appearance === 'night';
  const dateText = earned
    ? formatStampDate(completedAt)
    : language === 'th'
      ? 'รอปลดล็อก'
      : 'PENDING';

  const inkGold = earned
    ? isNight
      ? '#F2C66D'
      : '#B7791F'
    : isNight
      ? '#5C708F'
      : '#8FA0B8';
  const inkLapis = earned
    ? isNight
      ? '#60A5FA'
      : '#1D4ED8'
    : isNight
      ? '#5C708F'
      : '#8FA0B8';
  const inkTeal = earned
    ? isNight
      ? '#2DD4BF'
      : '#0E7A74'
    : isNight
      ? '#5C708F'
      : '#8FA0B8';

  return (
    <svg
      viewBox="0 0 180 180"
      className={sizeClass}
      role="img"
      aria-label={
        language === 'th'
          ? `ตราประทับพาสปอร์ตอียิปต์ คณะสำรวจหลวง ${earned ? dateText : 'ยังไม่ได้รับ'}`
          : `Egypt Expedition Passport Stamp ${earned ? dateText : 'Locked'}`
      }
    >
      <defs>
        <radialGradient id="egyptStampSunGlow" cx="50%" cy="44%" r="52%">
          <stop
            offset="0%"
            stopColor={earned ? '#FDE68A' : isNight ? '#1E293B' : '#E2E8F0'}
            stopOpacity={earned ? 0.5 : 0.2}
          />
          <stop
            offset="100%"
            stopColor={earned ? (isNight ? '#1A2338' : '#FFF8E8') : isNight ? '#162238' : '#F2F5FA'}
            stopOpacity="0"
          />
        </radialGradient>
      </defs>

      {/* Outer passport seal ring */}
      <circle
        cx="90"
        cy="90"
        r="83"
        fill={earned ? (isNight ? '#1B2338' : '#FFF9EB') : isNight ? '#162238' : '#F2F5FA'}
        stroke={inkGold}
        strokeWidth="4"
      />
      <circle
        cx="90"
        cy="90"
        r="75"
        fill="url(#egyptStampSunGlow)"
        stroke={inkLapis}
        strokeWidth="1.8"
        strokeDasharray="6 4"
      />
      <circle
        cx="90"
        cy="90"
        r="53"
        fill="none"
        stroke={inkTeal}
        strokeWidth="1.2"
        strokeOpacity="0.8"
      />

      {/* Top curved header */}
      <path id="egyptStampTopArc" d="M 30 90 A 60 60 0 0 1 150 90" fill="none" />
      <text
        fill={inkLapis}
        fontSize="10.2"
        fontWeight="800"
        letterSpacing="2.1"
        textAnchor="middle"
      >
        <textPath href="#egyptStampTopArc" startOffset="50%">
          EGYPT · GIZA · NILE
        </textPath>
      </text>

      {/* Sun disk & winged rays above Pyramids */}
      <circle cx="90" cy="54" r="9.5" fill={inkGold} fillOpacity={earned ? 0.9 : 0.4} />
      <path
        d="M72 54 Q81 49 90 54 Q99 49 108 54"
        fill="none"
        stroke={inkLapis}
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Great Pyramids & Chamber Portal Silhouette */}
      <polygon
        points="46,104 74,64 102,104"
        fill={inkGold}
        fillOpacity={earned ? 0.22 : 0.12}
        stroke={inkGold}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <polygon
        points="82,104 108,68 134,104"
        fill={inkLapis}
        fillOpacity={earned ? 0.2 : 0.1}
        stroke={inkLapis}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Unsealed Chamber Portal Archway in Center */}
      <path
        d="M83 104 V87 A7 7 0 0 1 97 87 V104 Z"
        fill={earned ? inkTeal : 'none'}
        fillOpacity={earned ? 0.35 : 0}
        stroke={inkTeal}
        strokeWidth="2"
      />
      {/* Nile wave line */}
      <path
        d="M44 109 Q58 105 72 109 T100 109 T128 109 T136 108"
        fill="none"
        stroke={inkTeal}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Stamp banner */}
      <rect
        x="43"
        y="115"
        width="94"
        height="17"
        rx="4"
        fill={inkGold}
        fillOpacity={earned ? 0.16 : 0.1}
        stroke={inkGold}
        strokeWidth="1.5"
      />
      <text
        x="90"
        y="126.5"
        textAnchor="middle"
        fill={inkLapis}
        fontSize="8.8"
        fontWeight="900"
        letterSpacing="1.2"
      >
        EXPEDITION LEGACY
      </text>

      {/* Date / Pending text */}
      <text
        x="90"
        y="148"
        textAnchor="middle"
        fill={inkGold}
        fontSize="10"
        fontWeight="800"
        letterSpacing="1.2"
      >
        {dateText}
      </text>
    </svg>
  );
}
