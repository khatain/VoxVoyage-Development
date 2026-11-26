import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  Bug,
  EyeOff,
  GripHorizontal,
  LogOut,
  Minimize2,
  Move,
  SlidersHorizontal,
} from 'lucide-react';
import type { AppLanguage, CountryId, ScreenRoute } from '../../types/game';
import type { QaSessionState } from '../../qa/qaSessionStorage';
import {
  QA_EXPANDED_PANEL_SIZE,
  QA_MINIMIZED_CHIP_SIZE,
  clampQaControllerPosition,
  computePresetAnchorPosition,
  formatQaStageActivitySummary,
  getDefaultQaControllerPosition,
  isDragExceededThreshold,
  nudgeQaControllerPosition,
  type QaControllerAnchorPreset,
  type QaControllerPosition,
  type QaSafeAreaInsets,
  type QaViewportBounds,
} from '../../qa/qaOverlayController';
import { GAME_COPY } from '../../data/i18n';

interface DeveloperQaControllerProps {
  language: AppLanguage;
  session: QaSessionState;
  currentRoute: ScreenRoute;
  selectedCountryId: CountryId;
  expanded: boolean;
  position: QaControllerPosition | null;
  reducedMotion?: boolean;
  onExpandedChange: (nextExpanded: boolean) => void;
  onPositionChange: (nextPos: QaControllerPosition, commitPersist: boolean) => void;
  onOpenConsole: () => void;
  onHideOverlay: () => void;
  onExitQaMode: () => void;
}

function readViewportBounds(): QaViewportBounds {
  if (typeof window === 'undefined') {
    return { width: 1280, height: 720 };
  }
  return {
    width: Math.max(240, window.innerWidth),
    height: Math.max(240, window.innerHeight),
  };
}

function readSafeAreaInsets(): QaSafeAreaInsets {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  const style = window.getComputedStyle(document.documentElement);
  const parsePx = (val: string) => {
    const n = Number.parseFloat(val);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  return {
    top: parsePx(style.getPropertyValue('--vv-safe-top')),
    right: parsePx(style.getPropertyValue('--vv-safe-right')),
    bottom: parsePx(style.getPropertyValue('--vv-safe-bottom')),
    left: parsePx(style.getPropertyValue('--vv-safe-left')),
  };
}

export function DeveloperQaController({
  language,
  session,
  currentRoute,
  selectedCountryId,
  expanded,
  position,
  reducedMotion = false,
  onExpandedChange,
  onPositionChange,
  onOpenConsole,
  onHideOverlay,
  onExitQaMode,
}: DeveloperQaControllerProps) {
  const copy = GAME_COPY[language];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragSessionRef = useRef<{
    pointerId: number;
    startPointer: QaControllerPosition;
    startElement: QaControllerPosition;
    exceededThreshold: boolean;
  } | null>(null);
  const suppressNextClickRef = useRef(false);

  const [viewport, setViewport] = useState<QaViewportBounds>(() => readViewportBounds());
  const [safeArea, setSafeArea] = useState<QaSafeAreaInsets>(() => readSafeAreaInsets());
  const [measuredSize, setMeasuredSize] = useState<{ width: number; height: number }>(() =>
    expanded ? QA_EXPANDED_PANEL_SIZE : QA_MINIMIZED_CHIP_SIZE,
  );
  const [isDragging, setIsDragging] = useState(false);

  const measureAndSyncBounds = useCallback(() => {
    setViewport(readViewportBounds());
    setSafeArea(readSafeAreaInsets());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('resize', measureAndSyncBounds);
    window.addEventListener('orientationchange', measureAndSyncBounds);
    return () => {
      window.removeEventListener('resize', measureAndSyncBounds);
      window.removeEventListener('orientationchange', measureAndSyncBounds);
    };
  }, [measureAndSyncBounds]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const nextWidth = Math.ceil(rect.width);
      const nextHeight = Math.ceil(rect.height);
      setMeasuredSize((prev) =>
        prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : { width: nextWidth, height: nextHeight },
      );
    }
  }, [expanded, language, viewport.width, viewport.height]);

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onExpandedChange(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [expanded, onExpandedChange]);

  const effectiveSize = expanded
    ? {
        width: Math.max(measuredSize.width, 240),
        height: Math.max(measuredSize.height, 260),
      }
    : QA_MINIMIZED_CHIP_SIZE;

  const baseAnchor =
    position ??
    getDefaultQaControllerPosition(viewport, QA_MINIMIZED_CHIP_SIZE, safeArea);
  const clampedRenderPos = clampQaControllerPosition(
    baseAnchor,
    viewport,
    effectiveSize,
    safeArea,
  );

  // When viewport shrinks or rotates, clamp any saved position back inside bounds cleanly.
  useEffect(() => {
    if (!position || isDragging) return;
    const clampedChipPos = clampQaControllerPosition(
      position,
      viewport,
      QA_MINIMIZED_CHIP_SIZE,
      safeArea,
    );
    if (clampedChipPos.x !== position.x || clampedChipPos.y !== position.y) {
      onPositionChange(clampedChipPos, true);
    }
  }, [position, viewport, safeArea, isDragging, onPositionChange]);

  const startPointerDrag = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const target = e.currentTarget;
    if (typeof target.setPointerCapture === 'function') {
      try {
        target.setPointerCapture(e.pointerId);
      } catch {
        // Ignore pointer capture error in synthetic environments.
      }
    }
    const startOrigin = clampQaControllerPosition(
      position ?? getDefaultQaControllerPosition(viewport, QA_MINIMIZED_CHIP_SIZE, safeArea),
      viewport,
      effectiveSize,
      safeArea,
    );
    dragSessionRef.current = {
      pointerId: e.pointerId,
      startPointer: { x: e.clientX, y: e.clientY },
      startElement: startOrigin,
      exceededThreshold: false,
    };
    suppressNextClickRef.current = false;
  };

  const movePointerDrag = (e: ReactPointerEvent<HTMLElement>) => {
    const drag = dragSessionRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const currentPointer = { x: e.clientX, y: e.clientY };
    if (!drag.exceededThreshold) {
      if (!isDragExceededThreshold(drag.startPointer, currentPointer)) {
        return;
      }
      drag.exceededThreshold = true;
      suppressNextClickRef.current = true;
      setIsDragging(true);
    }

    const dx = currentPointer.x - drag.startPointer.x;
    const dy = currentPointer.y - drag.startPointer.y;
    const nextPos = clampQaControllerPosition(
      { x: drag.startElement.x + dx, y: drag.startElement.y + dy },
      viewport,
      effectiveSize,
      safeArea,
    );
    onPositionChange(nextPos, false);
  };

  const endPointerDrag = (e: ReactPointerEvent<HTMLElement>, commit: boolean) => {
    const drag = dragSessionRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const target = e.currentTarget;
    if (
      typeof target.hasPointerCapture === 'function' &&
      target.hasPointerCapture(e.pointerId) &&
      typeof target.releasePointerCapture === 'function'
    ) {
      try {
        target.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore release error.
      }
    }

    if (drag.exceededThreshold && commit) {
      const dx = e.clientX - drag.startPointer.x;
      const dy = e.clientY - drag.startPointer.y;
      const finalPos = clampQaControllerPosition(
        { x: drag.startElement.x + dx, y: drag.startElement.y + dy },
        viewport,
        effectiveSize,
        safeArea,
      );
      onPositionChange(finalPos, true);
    }

    dragSessionRef.current = null;
    setIsDragging(false);
  };

  const handleMinimizedPillClick = () => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }
    onExpandedChange(true);
  };

  const handleNudgeKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    const step = e.shiftKey ? 32 : 16;
    let dx = 0;
    let dy = 0;
    if (e.key === 'ArrowLeft') dx = -step;
    else if (e.key === 'ArrowRight') dx = step;
    else if (e.key === 'ArrowUp') dy = -step;
    else if (e.key === 'ArrowDown') dy = step;
    else return;

    e.preventDefault();
    const current =
      position ?? getDefaultQaControllerPosition(viewport, effectiveSize, safeArea);
    const next = nudgeQaControllerPosition(
      current,
      dx,
      dy,
      viewport,
      effectiveSize,
      safeArea,
    );
    onPositionChange(next, true);
  };

  const handleSnapPreset = (preset: QaControllerAnchorPreset) => {
    const next = computePresetAnchorPosition(preset, viewport, QA_MINIMIZED_CHIP_SIZE, safeArea);
    onPositionChange(next, true);
  };

  const summary = formatQaStageActivitySummary(
    session,
    currentRoute,
    selectedCountryId,
    language,
  );

  if (!expanded) {
    return (
      <div
        ref={containerRef}
        style={{
          left: `${clampedRenderPos.x}px`,
          top: `${clampedRenderPos.y}px`,
        }}
        className={`fixed z-[60] pointer-events-auto select-none ${
          reducedMotion || isDragging ? '' : 'transition-[left,top] duration-150'
        }`}
        data-testid="developer-qa-controller"
        data-qa-state="minimized"
      >
        <button
          type="button"
          data-testid="qa-controller-pill"
          aria-expanded="false"
          aria-label={copy.qaControllerPillAriaLabel}
          title={copy.qaControllerDragHint}
          onPointerDown={startPointerDrag}
          onPointerMove={movePointerDrag}
          onPointerUp={(e) => endPointerDrag(e, true)}
          onPointerCancel={(e) => endPointerDrag(e, false)}
          onKeyDown={handleNudgeKeyDown}
          onClick={handleMinimizedPillClick}
          className="inline-flex h-[34px] touch-none items-center gap-1.5 rounded-full border border-[#F59E0B] bg-[#131E31]/92 px-3 text-[11px] font-extrabold tracking-wide text-[#FFFDF8] shadow-lg backdrop-blur-md hover:bg-[#1E2E4A] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F2C66D]"
        >
          <GripHorizontal
            className="h-3.5 w-3.5 text-[#F2C66D]/75 cursor-grab active:cursor-grabbing"
            aria-hidden="true"
          />
          <span
            className="h-2 w-2 rounded-full bg-[#24B8B0] shadow-[0_0_6px_#24B8B0]"
            aria-hidden="true"
          />
          <span className="font-mono-num uppercase text-[#FBBF24]">
            {copy.qaControllerPillLabel}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={copy.qaControllerTitle}
      data-testid="developer-qa-controller"
      data-qa-state="expanded"
      style={{
        left: `${clampedRenderPos.x}px`,
        top: `${clampedRenderPos.y}px`,
      }}
      className="fixed z-[60] pointer-events-auto w-[min(312px,calc(100vw-16px))] rounded-2xl border-2 border-[#F59E0B]/85 bg-[#131E31]/96 text-[#FFFDF8] shadow-2xl backdrop-blur-md"
    >
      {/* Drag Handle & Compact Header */}
      <div
        data-testid="qa-controller-drag-handle"
        onPointerDown={startPointerDrag}
        onPointerMove={movePointerDrag}
        onPointerUp={(e) => endPointerDrag(e, true)}
        onPointerCancel={(e) => endPointerDrag(e, false)}
        onKeyDown={handleNudgeKeyDown}
        tabIndex={0}
        aria-label={copy.qaControllerDragHint}
        className="flex touch-none items-center justify-between gap-2 border-b border-white/12 px-3 py-2 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <GripHorizontal className="h-3.5 w-3.5 shrink-0 text-[#F2C66D]/75" aria-hidden="true" />
          <Bug className="h-3.5 w-3.5 shrink-0 text-[#FBBF24]" aria-hidden="true" />
          <span className="truncate font-mono-num text-[11px] font-extrabold tracking-wide text-[#FBBF24]">
            {copy.qaControllerPillLabel}
          </span>
        </div>

        <button
          type="button"
          data-testid="qa-minimize-controller-button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onExpandedChange(false)}
          aria-label={copy.qaMinimizeControllerButton}
          title={copy.qaMinimizeControllerButton}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-[#FFFDF8] hover:bg-white/20 cursor-pointer"
        >
          <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Session Metadata */}
      <div className="space-y-2.5 p-3 text-[11px]">
        <div className="rounded-xl border border-white/12 bg-white/6 px-2.5 py-2 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-white/65">{copy.qaStatusFieldLabel}</span>
            <span className="font-bold text-[#34D399]">{summary.statusLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-white/65">{copy.qaCountryShortLabel}</span>
            <span className="truncate font-bold text-white">{summary.countryLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-white/65">{copy.qaStageShortLabel}</span>
            <span className="truncate font-bold text-[#F2C66D]">{summary.stageLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-white/65">{copy.qaActivityShortLabel}</span>
            <span className="truncate font-semibold text-white/90">{summary.activityLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-white/65">{copy.qaCefrShortLabel}</span>
            <span className="rounded bg-[#24B8B0]/20 px-1.5 py-0.5 font-mono-num text-[10px] font-extrabold text-[#5EEAD4]">
              {summary.cefrLabel}
            </span>
          </div>
        </div>

        {/* Accessible Reposition Controls (Alternative to Dragging) */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/65">
            <Move className="h-3 w-3 text-[#F2C66D]" aria-hidden="true" />
            <span>{copy.qaPositionPresetsLabel}</span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {(
              [
                { id: 'top-left', label: 'TL' },
                { id: 'top-center', label: 'TC' },
                { id: 'top-right', label: 'TR' },
                { id: 'bottom-left', label: 'BL' },
                { id: 'bottom-right', label: 'BR' },
              ] as const
            ).map((anchor) => (
              <button
                key={anchor.id}
                type="button"
                data-testid={`qa-anchor-${anchor.id}`}
                onClick={() => handleSnapPreset(anchor.id)}
                className="rounded-lg border border-white/15 bg-white/8 py-1 font-mono-num text-[10px] font-bold text-white/90 hover:bg-white/18 cursor-pointer"
              >
                {anchor.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-1.5 pt-0.5">
          <button
            type="button"
            data-testid="qa-open-console-button"
            onClick={onOpenConsole}
            className="inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-xl bg-[#F59E0B] px-3 py-1.5 text-xs font-extrabold text-[#131E31] hover:bg-[#fbbf24] cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{copy.qaOpenConsoleButton}</span>
          </button>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              data-testid="qa-minimize-action-button"
              onClick={() => onExpandedChange(false)}
              className="inline-flex min-h-[32px] items-center justify-center gap-1 rounded-xl border border-white/18 bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-white/18 cursor-pointer"
            >
              <Minimize2 className="h-3 w-3" aria-hidden="true" />
              <span>{copy.qaMinimizeControllerButton}</span>
            </button>

            <button
              type="button"
              data-testid="qa-hide-overlay-button"
              onClick={onHideOverlay}
              className="inline-flex min-h-[32px] items-center justify-center gap-1 rounded-xl border border-[#24B8B0]/45 bg-[#24B8B0]/18 px-2.5 py-1.5 text-[11px] font-bold text-[#99F6E4] hover:bg-[#24B8B0]/28 cursor-pointer"
            >
              <EyeOff className="h-3 w-3" aria-hidden="true" />
              <span>{copy.qaHideOverlayButton}</span>
            </button>
          </div>

          <button
            type="button"
            data-testid="qa-exit-mode-button"
            onClick={onExitQaMode}
            className="inline-flex min-h-[32px] items-center justify-center gap-1.5 rounded-xl bg-[#EF4444] px-3 py-1.5 text-[11px] font-extrabold text-white hover:bg-[#DC2626] cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{copy.qaBannerExitMode}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
