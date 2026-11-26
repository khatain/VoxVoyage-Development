import type {
  AppLanguage,
  EgyptPracticeGameId,
} from '../../types/game';
import type { RouteDirectionKind } from '../../data/egyptBuildTypes';
import type {
  BriefingSupplyId,
  PapyrusLabStepSpec,
  RescueBoardLandmark,
  RescueBoardLandmarkIcon,
  RescueSimulationStep,
  TempleGuardianVariant,
} from '../../data/egyptPracticeTypes';
import {
  RESCUE_BOARD_COLS,
  RESCUE_BOARD_LANDMARKS,
  RESCUE_BOARD_ROWS,
} from '../../data/egyptPracticeGames1to3';

export function EgyptPracticeStationEmblemSVG({
  gameId,
  className = 'h-12 w-12',
}: {
  gameId: EgyptPracticeGameId;
  className?: string;
}) {
  if (gameId === 'expedition_briefing_simulator') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <rect x="4" y="4" width="56" height="56" rx="16" fill="#0F766E" />
        <rect x="13" y="18" width="38" height="28" rx="6" fill="#FEF3C7" />
        <circle cx="26" cy="32" r="7" fill="#0D9488" />
        <path
          d="M36 25 C41 28 41 36 36 39 M41 22 C48 27 48 37 41 42"
          fill="none"
          stroke="#D97706"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (gameId === 'lost_tourist_rescue') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <rect
          x="4"
          y="4"
          width="56"
          height="56"
          rx="16"
          fill="#FEF3C7"
          stroke="#D97706"
          strokeWidth="2.5"
        />
        <polygon points="10,48 26,24 42,48" fill="#E7B43C" />
        <path
          d="M14 50 C24 38, 36 42, 48 24"
          fill="none"
          stroke="#0D9488"
          strokeWidth="3.5"
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
        <circle cx="48" cy="24" r="6" fill="#EF4444" stroke="#FFF" strokeWidth="2" />
      </svg>
    );
  }
  if (gameId === 'papyrus_restoration_lab') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <rect
          x="4"
          y="4"
          width="56"
          height="56"
          rx="16"
          fill="#CCFBF1"
          stroke="#0D9488"
          strokeWidth="2.5"
        />
        <rect
          x="16"
          y="14"
          width="32"
          height="36"
          rx="4"
          fill="#FFFBEB"
          stroke="#B45309"
          strokeWidth="2"
        />
        <line x1="22" y1="24" x2="42" y2="24" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="32" x2="40" y2="32" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="40" x2="36" y2="40" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="44" cy="44" r="8" fill="#0D9488" />
        <path d="M40 44 L43 47 L49 41" fill="none" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (gameId === 'temple_guardian_simulator') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <rect
          x="4"
          y="4"
          width="56"
          height="56"
          rx="16"
          fill="#E0E7FF"
          stroke="#254EAC"
          strokeWidth="2.5"
        />
        <path
          d="M32 13 L48 20 V33 C48 43 40 50 32 53 C24 50 16 43 16 33 V20 Z"
          fill="#FDE68A"
          stroke="#B45309"
          strokeWidth="2.5"
        />
        <circle cx="32" cy="31" r="7" fill="#F59E0B" />
        <path d="M27 31 L31 35 L38 27" fill="none" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="16" fill="#1E3A8A" />
      <rect
        x="14"
        y="14"
        width="36"
        height="36"
        rx="6"
        fill="none"
        stroke="#FDE68A"
        strokeWidth="2.2"
        strokeDasharray="4 2"
      />
      <circle cx="32" cy="32" r="10" fill="#0D9488" stroke="#FCD34D" strokeWidth="2.2" />
      <polygon points="32,24 35,32 32,40 29,32" fill="#FCD34D" />
    </svg>
  );
}

export function BriefingSupplyIconSVG({
  supplyId,
  className = 'h-9 w-9',
}: {
  supplyId: BriefingSupplyId;
  className?: string;
}) {
  switch (supplyId) {
    case 'water_bottle':
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
          <rect x="16" y="5" width="8" height="4" rx="1.5" fill="#0F766E" />
          <rect x="13" y="10" width="14" height="24" rx="4" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
          <line x1="15" y1="20" x2="25" y2="20" stroke="#E0F2FE" strokeWidth="2" />
        </svg>
      );
    case 'sun_hat':
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
          <ellipse cx="20" cy="25" rx="16" ry="5" fill="#F59E0B" />
          <path d="M11 24 C12 13 28 13 29 24 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.8" />
          <rect x="12" y="21" width="16" height="3" fill="#0D9488" />
        </svg>
      );
    case 'compass':
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
          <circle cx="20" cy="20" r="14" fill="#FDE68A" stroke="#B45309" strokeWidth="2.2" />
          <circle cx="20" cy="20" r="10" fill="#FFFBEB" />
          <polygon points="20,11 23,20 20,29 17,20" fill="#DC2626" />
        </svg>
      );
    case 'notebook':
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
          <rect x="9" y="7" width="22" height="26" rx="3" fill="#254EAC" />
          <rect x="13" y="11" width="15" height="18" rx="1.5" fill="#FFFBEB" />
          <line x1="16" y1="16" x2="25" y2="16" stroke="#94A3B8" strokeWidth="1.6" />
          <line x1="16" y1="21" x2="24" y2="21" stroke="#94A3B8" strokeWidth="1.6" />
        </svg>
      );
    case 'pencil':
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
          <polygon points="9,31 13,22 27,8 32,13 18,27" fill="#FBBF24" stroke="#B45309" strokeWidth="1.6" />
          <polygon points="9,31 12,24 16,28" fill="#1E293B" />
        </svg>
      );
    case 'route_map':
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
          <rect x="6" y="9" width="28" height="22" rx="3" fill="#FFFBEB" stroke="#B45309" strokeWidth="2" />
          <path d="M11 24 L18 16 L24 22 L29 14" fill="none" stroke="#0D9488" strokeWidth="2.2" strokeDasharray="3 2" />
          <circle cx="29" cy="14" r="2.5" fill="#DC2626" />
        </svg>
      );
    case 'first_aid_kit':
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
          <rect x="7" y="11" width="26" height="21" rx="4" fill="#FEE2E2" stroke="#DC2626" strokeWidth="2" />
          <path d="M15 11 V8 C15 7 25 7 25 8 V11" fill="none" stroke="#991B1B" strokeWidth="2.2" />
          <rect x="18" y="16" width="4" height="11" rx="1" fill="#DC2626" />
          <rect x="14.5" y="19.5" width="11" height="4" rx="1" fill="#DC2626" />
        </svg>
      );
    case 'sunscreen':
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
          <rect x="14" y="8" width="12" height="5" rx="2" fill="#F97316" />
          <path d="M11 14 H29 L26 32 H14 Z" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2" />
          <circle cx="20" cy="22" r="4" fill="#F59E0B" />
        </svg>
      );
    case 'megaphone':
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
          <polygon points="10,18 28,11 28,27 10,21" fill="#F59E0B" stroke="#92400E" strokeWidth="1.8" />
          <rect x="12" y="21" width="4" height="9" rx="1.5" fill="#475569" />
        </svg>
      );
    case 'flash_camera':
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
          <rect x="7" y="14" width="26" height="18" rx="4" fill="#334155" />
          <circle cx="20" cy="23" r="6" fill="#0EA5E9" stroke="#E2E8F0" strokeWidth="2" />
          <polygon points="27,7 24,13 29,13 26,18" fill="#FACC15" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
          <rect x="12" y="13" width="16" height="19" rx="4" fill="#92400E" stroke="#FDE68A" strokeWidth="2" />
          <circle cx="20" cy="22" r="4.5" fill="#FBBF24" />
        </svg>
      );
  }
}

function RescueLandmarkPin({ iconKey, color }: { iconKey: RescueBoardLandmarkIcon; color: string }) {
  return (
    <g>
      <circle cx="0" cy="0" r="14" fill={color} opacity="0.22" />
      <circle cx="0" cy="0" r="10.5" fill={color} stroke="#FFFBEB" strokeWidth="2" />
      {iconKey === 'water_station' && (
        <path d="M0 -5 C3 -1 4 2 4 4 A4 4 0 1 1 -4 4 C-4 2 -3 -1 0 -5 Z" fill="#FFF" />
      )}
      {iconKey === 'shade_pavilion' && (
        <path d="M-5 2 L0 -5 L5 2 Z M-4 2 V5 M4 2 V5" stroke="#FFF" strokeWidth="1.8" fill="none" />
      )}
      {iconKey === 'sphinx_plaza' && (
        <polygon points="0,-5 5,4 -5,4" fill="#FFF" />
      )}
      {iconKey === 'sun_arch' && (
        <path d="M-5 5 V-1 A5 5 0 0 1 5 -1 V5" stroke="#FFF" strokeWidth="2" fill="none" />
      )}
      {iconKey !== 'water_station' &&
        iconKey !== 'shade_pavilion' &&
        iconKey !== 'sphinx_plaza' &&
        iconKey !== 'sun_arch' && (
          <rect x="-4" y="-4" width="8" height="8" rx="1.5" fill="#FFF" />
        )}
    </g>
  );
}

const FACING_ARROW_DEG: Record<RouteDirectionKind, number> = {
  N: 0,
  E: 90,
  S: 180,
  W: 270,
};

export function LostTouristRescueBoardArtwork({
  language,
  isNight,
  startPos,
  targetPos,
  blockedCells,
  currentStep,
  pathHistory,
  goalLandmark,
  hitBlocked,
  className = 'w-full h-auto',
}: {
  language: AppLanguage;
  isNight: boolean;
  startPos: { x: number; y: number; facing: RouteDirectionKind };
  targetPos: { x: number; y: number };
  blockedCells: Array<{ x: number; y: number }>;
  currentStep: RescueSimulationStep;
  pathHistory: RescueSimulationStep[];
  goalLandmark?: RescueBoardLandmark;
  hitBlocked?: boolean;
  className?: string;
}) {
  const cellW = 72;
  const cellH = 64;
  const padX = 28;
  const padY = 24;
  const boardW = padX * 2 + RESCUE_BOARD_COLS * cellW;
  const boardH = padY * 2 + RESCUE_BOARD_ROWS * cellH;

  const cellCenter = (x: number, y: number) => ({
    cx: padX + x * cellW + cellW / 2,
    cy: padY + y * cellH + cellH / 2,
  });

  const blockedSet = new Set(blockedCells.map((c) => `${c.x},${c.y}`));
  const polylinePts = pathHistory
    .filter((s) => s.x >= 0 && s.x < RESCUE_BOARD_COLS && s.y >= 0 && s.y < RESCUE_BOARD_ROWS)
    .map((s) => {
      const { cx, cy } = cellCenter(s.x, s.y);
      return `${cx},${cy}`;
    })
    .join(' ');

  const clampedX = Math.max(0, Math.min(RESCUE_BOARD_COLS - 1, currentStep.x));
  const clampedY = Math.max(0, Math.min(RESCUE_BOARD_ROWS - 1, currentStep.y));
  const spritePt = cellCenter(clampedX, clampedY);
  const startPt = cellCenter(startPos.x, startPos.y);
  const goalPt = cellCenter(targetPos.x, targetPos.y);

  return (
    <svg
      viewBox={`0 0 ${boardW} ${boardH}`}
      className={className}
      role="img"
      aria-label={
        language === 'th'
          ? 'แผนที่จำลองช่วยเหลือผู้มาเยือนลานกีซา'
          : 'Giza Visitor Plaza Interactive Rescue Map'
      }
    >
      {/* Frame */}
      <rect
        x="4"
        y="4"
        width={boardW - 8}
        height={boardH - 8}
        rx="18"
        fill={isNight ? '#15223D' : '#FEF3C7'}
        stroke="#D97706"
        strokeWidth="2.5"
      />

      {/* Compass Rose top-right */}
      <g transform={`translate(${boardW - 30}, 28)`}>
        <circle r="16" fill={isNight ? '#1E293B' : '#FFFBEB'} stroke="#D97706" strokeWidth="1.5" />
        <text x="0" y="-7" textAnchor="middle" fontSize="8" fontWeight="800" fill="#DC2626">
          N
        </text>
        <text x="9" y="3" textAnchor="middle" fontSize="7" fontWeight="700" fill={isNight ? '#CBD5E1' : '#475569'}>
          E
        </text>
        <text x="-9" y="3" textAnchor="middle" fontSize="7" fontWeight="700" fill={isNight ? '#CBD5E1' : '#475569'}>
          W
        </text>
        <text x="0" y="12" textAnchor="middle" fontSize="7" fontWeight="700" fill={isNight ? '#CBD5E1' : '#475569'}>
          S
        </text>
      </g>

      {/* Grid Cells */}
      {Array.from({ length: RESCUE_BOARD_ROWS }).map((_, rowIdx) =>
        Array.from({ length: RESCUE_BOARD_COLS }).map((__, colIdx) => {
          const x = padX + colIdx * cellW;
          const y = padY + rowIdx * cellH;
          const isBlocked = blockedSet.has(`${colIdx},${rowIdx}`);
          const isGoal = colIdx === targetPos.x && rowIdx === targetPos.y;
          const isStart = colIdx === startPos.x && rowIdx === startPos.y;

          return (
            <g key={`${colIdx}-${rowIdx}`}>
              <rect
                x={x + 2}
                y={y + 2}
                width={cellW - 4}
                height={cellH - 4}
                rx="10"
                fill={
                  isBlocked
                    ? isNight
                      ? '#451A03'
                      : '#FDE68A'
                    : isGoal
                      ? isNight
                        ? '#134E4A'
                        : '#CCFBF1'
                      : isStart
                        ? isNight
                          ? '#1E3A8A'
                          : '#DBEAFE'
                        : isNight
                          ? '#1D2B4C'
                          : '#FFFDF7'
                }
                stroke={
                  isGoal
                    ? '#0D9488'
                    : isBlocked
                      ? '#D97706'
                      : isNight
                        ? 'rgba(255,255,255,0.14)'
                        : '#E2E8F0'
                }
                strokeWidth={isGoal ? 2.5 : 1.3}
              />
              {isBlocked && (
                <g transform={`translate(${x + cellW / 2}, ${y + cellH / 2})`}>
                  <path
                    d="M-18 8 Q-9 -4 0 4 T18 2"
                    fill="none"
                    stroke="#B45309"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <text
                    x="0"
                    y="-8"
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="800"
                    fill="#B45309"
                  >
                    SAND HAZARD
                  </text>
                </g>
              )}
            </g>
          );
        }),
      )}

      {/* Board Landmarks */}
      {RESCUE_BOARD_LANDMARKS.map((lm) => {
        const { cx, cy } = cellCenter(lm.x, lm.y);
        return (
          <g key={lm.id} transform={`translate(${cx}, ${cy - 4})`}>
            <RescueLandmarkPin iconKey={lm.iconKey} color={lm.color} />
            <text
              x="0"
              y="22"
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="800"
              fill={isNight ? '#F8FAFC' : '#1E293B'}
            >
              {lm.label[language].slice(0, 18)}
            </text>
          </g>
        );
      })}

      {/* Start & Goal Tags */}
      <g transform={`translate(${startPt.cx - 18}, ${startPt.cy - 22})`}>
        <rect width="36" height="14" rx="4" fill="#2563EB" />
        <text x="18" y="10" textAnchor="middle" fontSize="8" fontWeight="800" fill="#FFF">
          START
        </text>
      </g>
      <g transform={`translate(${goalPt.cx - 18}, ${goalPt.cy - 22})`}>
        <rect width="36" height="14" rx="4" fill="#0D9488" />
        <text x="18" y="10" textAnchor="middle" fontSize="8" fontWeight="800" fill="#FFF">
          GOAL
        </text>
      </g>

      {/* Path Breadcrumb */}
      {pathHistory.length > 1 && (
        <polyline
          points={polylinePts}
          fill="none"
          stroke={hitBlocked ? '#EF4444' : '#0D9488'}
          strokeWidth="4"
          strokeDasharray="6 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Animated Tourist Sprite */}
      <g
        transform={`translate(${spritePt.cx}, ${spritePt.cy})`}
        style={{ transition: 'transform 220ms ease-out' }}
      >
        <circle
          r="15"
          fill={hitBlocked ? '#EF4444' : '#F59E0B'}
          stroke="#FFF"
          strokeWidth="2.5"
        />
        <g transform={`rotate(${FACING_ARROW_DEG[currentStep.facing]})`}>
          <polygon points="0,-10 5,5 0,2 -5,5" fill="#131E31" />
        </g>
      </g>

      {goalLandmark && (
        <text
          x={padX}
          y={boardH - 7}
          fontSize="9"
          fontWeight="700"
          fill={isNight ? '#CBD5E1' : '#64748B'}
        >
          {language === 'th'
            ? `ปลายทาง: ${goalLandmark.label.th}`
            : `Destination: ${goalLandmark.label.en}`}
        </text>
      )}
    </svg>
  );
}

export function PapyrusReplicaSceneSVG({
  sceneKey,
  className = 'h-12 w-12',
}: {
  sceneKey: PapyrusLabStepSpec['sceneKey'];
  className?: string;
}) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="2" y="2" width="44" height="44" rx="12" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.8" />
      {sceneKey === 'trim_reeds' && (
        <>
          <line x1="10" y1="30" x2="36" y2="18" stroke="#15803D" strokeWidth="3.2" strokeLinecap="round" />
          <line x1="12" y1="34" x2="38" y2="24" stroke="#65A30D" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="17" cy="17" r="4" fill="none" stroke="#334155" strokeWidth="2" />
        </>
      )}
      {sceneKey === 'soak_fibers' && (
        <>
          <rect x="8" y="20" width="32" height="16" rx="4" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.8" />
          <line x1="12" y1="26" x2="34" y2="26" stroke="#FEF08A" strokeWidth="2.5" />
          <line x1="14" y1="31" x2="35" y2="31" stroke="#FDE047" strokeWidth="2.5" />
        </>
      )}
      {sceneKey === 'layer_grid' && (
        <>
          <line x1="12" y1="16" x2="36" y2="16" stroke="#B45309" strokeWidth="2.5" />
          <line x1="12" y1="24" x2="36" y2="24" stroke="#B45309" strokeWidth="2.5" />
          <line x1="12" y1="32" x2="36" y2="32" stroke="#B45309" strokeWidth="2.5" />
          <line x1="16" y1="12" x2="16" y2="36" stroke="#D97706" strokeWidth="2.5" />
          <line x1="24" y1="12" x2="24" y2="36" stroke="#D97706" strokeWidth="2.5" />
          <line x1="32" y1="12" x2="32" y2="36" stroke="#D97706" strokeWidth="2.5" />
        </>
      )}
      {sceneKey === 'press_weight' && (
        <>
          <rect x="9" y="29" width="30" height="6" rx="2" fill="#FFFBEB" stroke="#B45309" strokeWidth="1.5" />
          <rect x="13" y="16" width="22" height="13" rx="3" fill="#78350F" />
        </>
      )}
      {sceneKey === 'dry_rack' && (
        <>
          <path d="M10 15 Q24 22 38 15" fill="none" stroke="#0D9488" strokeWidth="2.4" />
          <rect x="12" y="23" width="24" height="12" rx="2" fill="#FFFBEB" stroke="#B45309" strokeWidth="1.8" />
        </>
      )}
      {sceneKey === 'brush_dust' && (
        <>
          <rect x="10" y="26" width="28" height="10" rx="2" fill="#FFFBEB" stroke="#B45309" strokeWidth="1.6" />
          <line x1="34" y1="10" x2="20" y2="26" stroke="#0F766E" strokeWidth="3.2" strokeLinecap="round" />
        </>
      )}
      {sceneKey === 'mix_gum' && (
        <>
          <path d="M12 24 H36 C36 33 12 33 12 24 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="1.8" />
          <circle cx="24" cy="18" r="3" fill="#FDE047" />
        </>
      )}
      {sceneKey === 'seal_edge' && (
        <>
          <rect x="10" y="14" width="28" height="20" rx="3" fill="#FFFBEB" stroke="#B45309" strokeWidth="1.6" />
          <path d="M22 14 L26 24 L21 34" fill="none" stroke="#0D9488" strokeWidth="2.2" />
        </>
      )}
      {sceneKey === 'check_label' && (
        <>
          <rect x="12" y="16" width="24" height="16" rx="3" fill="#FFF" stroke="#0D9488" strokeWidth="2" />
          <line x1="16" y1="22" x2="32" y2="22" stroke="#1E3A8A" strokeWidth="2" />
          <line x1="16" y1="27" x2="26" y2="27" stroke="#64748B" strokeWidth="2" />
        </>
      )}
      {sceneKey === 'archive_tray' && (
        <>
          <rect x="9" y="18" width="30" height="18" rx="3" fill="#0F766E" />
          <rect x="13" y="13" width="22" height="10" rx="2" fill="#FFFBEB" stroke="#B45309" strokeWidth="1.6" />
        </>
      )}
    </svg>
  );
}

export function TempleVisitorScenarioSVG({
  scenarioKey,
  className = 'w-full h-auto',
}: {
  scenarioKey: TempleGuardianVariant['scenarioKey'];
  className?: string;
}) {
  return (
    <svg viewBox="0 0 360 120" className={className} role="img" aria-label="Temple heritage visitor scenario">
      <rect x="4" y="4" width="352" height="112" rx="16" fill="#EEF2FF" stroke="#4338CA" strokeWidth="2" />
      <rect x="20" y="24" width="44" height="76" rx="4" fill="#FDE68A" stroke="#B45309" strokeWidth="1.8" />
      <rect x="296" y="24" width="44" height="76" rx="4" fill="#FDE68A" stroke="#B45309" strokeWidth="1.8" />
      <rect x="112" y="20" width="136" height="80" rx="12" fill="#FFFBEB" stroke="#D97706" strokeWidth="2" />
      <text x="180" y="42" textAnchor="middle" fontSize="11" fontWeight="800" fill="#92400E">
        HERITAGE CENTER SIGN
      </text>
      {scenarioKey === 'no_flash_photo' && (
        <text x="180" y="72" textAnchor="middle" fontSize="14" fontWeight="800" fill="#DC2626">
          NO FLASH CAMERAS
        </text>
      )}
      {scenarioKey === 'stay_walkway' && (
        <text x="180" y="72" textAnchor="middle" fontSize="13.5" fontWeight="800" fill="#0F766E">
          MARKED WALKWAY ONLY
        </text>
      )}
      {scenarioKey === 'shade_water' && (
        <text x="180" y="72" textAnchor="middle" fontSize="13.5" fontWeight="800" fill="#0284C7">
          SHADE & HYDRATION CARE
        </text>
      )}
      {scenarioKey === 'quiet_courtyard' && (
        <text x="180" y="72" textAnchor="middle" fontSize="13.5" fontWeight="800" fill="#4338CA">
          QUIET COURTYARD ZONE
        </text>
      )}
      {scenarioKey === 'ask_docent' && (
        <text x="180" y="72" textAnchor="middle" fontSize="13.5" fontWeight="800" fill="#0D9488">
          SKETCH TERRACE ACCESS
        </text>
      )}
      {scenarioKey === 'fragile_relief' && (
        <text x="180" y="72" textAnchor="middle" fontSize="13.5" fontWeight="800" fill="#DC2626">
          FRAGILE CARVED RELIEFS
        </text>
      )}
    </svg>
  );
}

export function EgyptAcademySealSVG({
  className = 'h-24 w-24',
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Decorative Stage 3 Academy Seal">
      <defs>
        <linearGradient id="academySealGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="54" fill="url(#academySealGold)" stroke="#78350F" strokeWidth="3" />
      <circle cx="60" cy="60" r="45" fill="#0F766E" stroke="#FEF3C7" strokeWidth="2.5" strokeDasharray="5 3" />
      <polygon points="60,26 84,74 36,74" fill="#FDE68A" stroke="#78350F" strokeWidth="2" />
      <circle cx="60" cy="56" r="7" fill="#0F766E" />
      <text x="60" y="90" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#FEF3C7">
        ACADEMY SEAL
      </text>
    </svg>
  );
}
