import { useCallback, useEffect, useState } from 'react';
import { BookOpen, FileText, Square, Volume2 } from 'lucide-react';
import type {
  AppLanguage,
  EgyptInstructionJournalRecord,
  EgyptPerformEvidenceRecord,
  EgyptPracticeEvidenceRecord,
} from '../../types/game';
import { GAME_COPY } from '../../data/i18n';
import { EGYPT_BUILD_MISSIONS } from '../../data/egyptBuild';
import { EGYPT_PRACTICE_MISSIONS } from '../../data/egyptPractice';
import { EGYPT_PERFORM_MISSIONS } from '../../data/egyptPerform';
import { EgyptBuildStationEmblemSVG } from './EgyptBuildArtwork';
import { EgyptPracticeStationEmblemSVG } from './EgyptPracticeArtwork';
import { EgyptPerformMissionEmblemSVG } from './EgyptPerformArtwork';

interface EgyptInstructionJournalProps {
  language: AppLanguage;
  isNight: boolean;
  entries: EgyptInstructionJournalRecord[];
  practiceEntries?: EgyptPracticeEvidenceRecord[];
  performEntries?: EgyptPerformEvidenceRecord[];
  initialTab?: 'build' | 'practice' | 'perform';
  compact?: boolean;
  showBlueprintPreview?: boolean;
  onPlaySfx?: (kind?: 'click' | 'select' | 'reward') => void;
}

export function EgyptInstructionJournal({
  language,
  isNight,
  entries,
  practiceEntries,
  performEntries,
  initialTab = 'build',
  compact = false,
  showBlueprintPreview = true,
  onPlaySfx,
}: EgyptInstructionJournalProps) {
  const copy = GAME_COPY[language];
  const hasPracticeTab = practiceEntries !== undefined;
  const hasPerformTab = performEntries !== undefined;
  const resolvedInitialTab: 'build' | 'practice' | 'perform' =
    initialTab === 'perform' && hasPerformTab
      ? 'perform'
      : initialTab === 'practice' && hasPracticeTab
        ? 'practice'
        : 'build';
  const [activeTab, setActiveTab] = useState<'build' | 'practice' | 'perform'>(
    resolvedInitialTab,
  );
  const [showThaiScaffold, setShowThaiScaffold] = useState<boolean>(
    language === 'th',
  );
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
  }, []);

  const speakText = useCallback(
    (id: string, text: string) => {
      onPlaySfx?.('select');
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }
      stopSpeech();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.94;
      u.pitch = 1.02;
      u.onend = () => setSpeakingId((cur) => (cur === id ? null : cur));
      u.onerror = () => setSpeakingId((cur) => (cur === id ? null : cur));
      setSpeakingId(id);
      window.speechSynthesis.speak(u);
    },
    [onPlaySfx, stopSpeech],
  );

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  const blueprintEntries = entries.filter(
    (entry) => entry.gameId === 'pharaoh_master_blueprint',
  );
  const latestBlueprint =
    blueprintEntries.length > 0
      ? blueprintEntries[blueprintEntries.length - 1]
      : null;

  return (
    <div className="space-y-3">
      {/* Journal Header + EN/TH Toggle */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border p-3.5 ${
          isNight
            ? 'border-[#E7B43C]/35 bg-[#162340]'
            : 'border-[#FDE68A] bg-[#FFFBEB]'
        }`}
      >
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <BookOpen
            className="h-5 w-5 shrink-0 mt-0.5 text-[#0D9488] dark:text-[#5EEAD4]"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h3 className="font-display text-sm sm:text-base font-extrabold">
              {copy.egyptJournalTitle}
            </h3>
            <p
              className={`text-xs ${
                isNight ? 'text-[#CBD5E1]' : 'text-[#475569]'
              }`}
            >
              {copy.egyptJournalSubtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(hasPracticeTab || hasPerformTab) && (
            <div
              className={`inline-flex flex-wrap rounded-xl border p-0.5 ${
                isNight
                  ? 'border-white/15 bg-[#0F1B33]'
                  : 'border-[#CBD5E1] bg-white'
              }`}
              role="tablist"
              aria-label="Egypt Journal Sections"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'build'}
                onClick={() => {
                  stopSpeech();
                  onPlaySfx?.('select');
                  setActiveTab('build');
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-extrabold cursor-pointer ${
                  activeTab === 'build'
                    ? 'bg-[#E7B43C] text-[#131E31]'
                    : isNight
                      ? 'text-[#CBD5E1]'
                      : 'text-[#475569]'
                }`}
              >
                {copy.egyptPracticeJournalTabBuild} ({entries.length})
              </button>
              {hasPracticeTab && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'practice'}
                  onClick={() => {
                    stopSpeech();
                    onPlaySfx?.('select');
                    setActiveTab('practice');
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-extrabold cursor-pointer ${
                    activeTab === 'practice'
                      ? 'bg-[#0D9488] text-white'
                      : isNight
                        ? 'text-[#CBD5E1]'
                        : 'text-[#475569]'
                  }`}
                >
                  {copy.egyptPracticeJournalTabPractice} ({practiceEntries?.length ?? 0})
                </button>
              )}
              {hasPerformTab && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'perform'}
                  onClick={() => {
                    stopSpeech();
                    onPlaySfx?.('select');
                    setActiveTab('perform');
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-extrabold cursor-pointer ${
                    activeTab === 'perform'
                      ? 'bg-[#E7B43C] text-[#131E31]'
                      : isNight
                        ? 'text-[#CBD5E1]'
                        : 'text-[#475569]'
                  }`}
                >
                  {copy.egyptPerformJournalTabPerform} ({performEntries?.length ?? 0})
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              onPlaySfx?.('select');
              setShowThaiScaffold((prev) => !prev);
            }}
            className={`rounded-xl border px-3 py-1.5 text-xs font-extrabold cursor-pointer ${
              showThaiScaffold
                ? 'border-[#0D9488] bg-[#0D9488] text-white'
                : isNight
                  ? 'border-white/15 bg-white/10 text-[#CBD5E1]'
                  : 'border-[#CBD5E1] bg-white text-[#475569]'
            }`}
          >
            {showThaiScaffold ? 'EN + TH' : 'EN Only'}
          </button>
        </div>
      </div>

      {/* Perform Portfolio Tab View */}
      {hasPerformTab && activeTab === 'perform' ? (
        (performEntries?.length ?? 0) === 0 ? (
          <div
            className={`rounded-2xl border border-dashed p-5 text-center space-y-2 ${
              isNight
                ? 'border-white/20 bg-[#162340]/70 text-[#CBD5E1]'
                : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#475569]'
            }`}
          >
            <FileText
              className="mx-auto h-7 w-7 opacity-60"
              aria-hidden="true"
            />
            <p className="text-xs sm:text-sm font-semibold">
              {copy.egyptPerformPortfolioEmptyState}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {EGYPT_PERFORM_MISSIONS.map((mission) => {
              const entry = (performEntries ?? []).find(
                (r) => r.performMissionId === mission.performMissionId,
              );
              if (!entry) return null;
              const speakKey = `perform-${entry.id}`;
              const isSpeaking = speakingId === speakKey;

              return (
                <div
                  key={mission.performMissionId}
                  className={`rounded-2xl border p-3.5 space-y-2.5 ${
                    isNight
                      ? 'border-white/12 bg-[#162340]'
                      : 'border-[#E2E8F0] bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <EgyptPerformMissionEmblemSVG
                        performMissionId={mission.performMissionId}
                        className={
                          compact
                            ? 'h-8 w-8 shrink-0 rounded-lg'
                            : 'h-9 w-9 shrink-0 rounded-xl'
                        }
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-md bg-[#0D9488]/15 px-1.5 py-0.5 font-mono-num text-[10px] font-extrabold text-[#0D9488] dark:text-[#5EEAD4]">
                            {entry.cefrLevel.toUpperCase()}
                          </span>
                          {entry.attemptNumber && entry.attemptNumber > 1 && (
                            <span className="rounded-md bg-[#E7B43C]/20 px-1.5 py-0.5 font-mono-num text-[10px] font-extrabold text-[#B45309] dark:text-[#FDE68A]">
                              #{entry.attemptNumber}
                            </span>
                          )}
                          <span className="font-display text-xs sm:text-sm font-extrabold truncate">
                            {mission.title[language]}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] ${
                            isNight ? 'text-[#94A3B8]' : 'text-[#64748B]'
                          }`}
                        >
                          {mission.focusSkill[language]} ·{' '}
                          {entry.completedTaskIds.length}/3{' '}
                          {language === 'th' ? 'ขั้นตอน' : 'tasks'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        isSpeaking
                          ? stopSpeech()
                          : speakText(speakKey, entry.learnerProducedText)
                      }
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                        isNight
                          ? 'border-white/15 bg-white/10 text-white'
                          : 'border-[#CBD5E1] bg-white text-[#334155]'
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <Square className="h-3 w-3" aria-hidden="true" />
                          <span>{copy.egyptDiscoverStopAudioButton}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3 w-3" aria-hidden="true" />
                          <span>{copy.egyptJournalListenButton}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div
                    className={`rounded-xl border p-2.5 space-y-1.5 ${
                      isNight
                        ? 'border-white/10 bg-[#0F1B33]'
                        : 'border-[#E2E8F0] bg-[#F8FAFC]'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                      “{entry.learnerProducedText}”
                    </p>
                    {entry.validatedResponses.length > 0 && (
                      <p
                        className={`text-[11px] ${
                          isNight ? 'text-[#CBD5E1]' : 'text-[#475569]'
                        }`}
                      >
                        {entry.validatedResponses.slice(0, 3).join(' · ')}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {entry.rubricSummary.map((r) => (
                        <span
                          key={r.criterionId}
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                            r.level === 'strong'
                              ? 'bg-[#10B981]/20 text-[#059669] dark:text-[#34D399]'
                              : r.level === 'developing'
                                ? 'bg-[#E7B43C]/20 text-[#B45309] dark:text-[#FDE68A]'
                                : 'bg-[#F87171]/20 text-[#DC2626] dark:text-[#FCA5A5]'
                          }`}
                        >
                          {r.criterionId}: {r.level}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : /* Practice Tab View */
      hasPracticeTab && activeTab === 'practice' ? (
        (practiceEntries?.length ?? 0) === 0 ? (
          <div
            className={`rounded-2xl border border-dashed p-5 text-center space-y-2 ${
              isNight
                ? 'border-white/20 bg-[#162340]/70 text-[#CBD5E1]'
                : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#475569]'
            }`}
          >
            <FileText
              className="mx-auto h-7 w-7 opacity-60"
              aria-hidden="true"
            />
            <p className="text-xs sm:text-sm font-semibold">
              {copy.egyptPracticeJournalEmptyState}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {EGYPT_PRACTICE_MISSIONS.map((mission) => {
              const gameEntries = (practiceEntries ?? []).filter(
                (entry) => entry.gameId === mission.gameId,
              );
              if (gameEntries.length === 0) return null;

              return (
                <div
                  key={mission.gameId}
                  className={`rounded-2xl border p-3.5 space-y-2.5 ${
                    isNight
                      ? 'border-white/12 bg-[#162340]'
                      : 'border-[#E2E8F0] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <EgyptPracticeStationEmblemSVG
                      gameId={mission.gameId}
                      className={
                        compact
                          ? 'h-8 w-8 shrink-0 rounded-lg'
                          : 'h-9 w-9 shrink-0 rounded-xl'
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xs sm:text-sm font-extrabold truncate">
                        {mission.title[language]}
                      </p>
                      <p
                        className={`text-[11px] ${
                          isNight ? 'text-[#94A3B8]' : 'text-[#64748B]'
                        }`}
                      >
                        {gameEntries.length} / 6{' '}
                        {language === 'th' ? 'ภารกิจที่ฝึกผ่าน' : 'logged'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {gameEntries.map((entry) => {
                      const speakKey = `practice-${entry.id}`;
                      const isSpeaking = speakingId === speakKey;
                      return (
                        <div
                          key={entry.id}
                          className={`rounded-xl border p-2.5 space-y-1.5 ${
                            isNight
                              ? 'border-white/10 bg-[#0F1B33]'
                              : 'border-[#E2E8F0] bg-[#F8FAFC]'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="rounded-md bg-[#0D9488]/15 px-1.5 py-0.5 font-mono-num text-[10px] font-extrabold text-[#0D9488] dark:text-[#5EEAD4]">
                                {entry.cefrLevel.toUpperCase()}
                              </span>
                              {entry.attemptNumber && entry.attemptNumber > 1 && (
                                <span className="rounded-md bg-[#E7B43C]/20 px-1.5 py-0.5 font-mono-num text-[10px] font-extrabold text-[#B45309] dark:text-[#FDE68A]">
                                  #{entry.attemptNumber}
                                </span>
                              )}
                              <span className="text-xs font-bold truncate">
                                {entry.challengeTitle[language]}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                isSpeaking
                                  ? stopSpeech()
                                  : speakText(speakKey, entry.responseSummary)
                              }
                              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                                isNight
                                  ? 'border-white/15 bg-white/10 text-white'
                                  : 'border-[#CBD5E1] bg-white text-[#334155]'
                              }`}
                            >
                              {isSpeaking ? (
                                <>
                                  <Square className="h-3 w-3" aria-hidden="true" />
                                  <span>{copy.egyptDiscoverStopAudioButton}</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="h-3 w-3" aria-hidden="true" />
                                  <span>{copy.egyptJournalListenButton}</span>
                                </>
                              )}
                            </button>
                          </div>

                          {entry.responseLines.length > 1 ? (
                            <ol className="space-y-0.5 text-xs font-semibold leading-snug">
                              {entry.responseLines.map((line, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="font-mono-num opacity-65">
                                    {i + 1}.
                                  </span>
                                  <span>{line}</span>
                                </li>
                              ))}
                            </ol>
                          ) : (
                            <p className="text-xs sm:text-sm font-semibold leading-snug">
                              “{entry.responseSummary}”
                            </p>
                          )}

                          {showThaiScaffold && entry.thaiScaffold && (
                            <p
                              className={`text-[11px] ${
                                isNight ? 'text-[#CBD5E1]' : 'text-[#64748B]'
                              }`}
                            >
                              {entry.thaiScaffold}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : /* Empty State vs Grouped BUILD Entries */
      entries.length === 0 ? (
        <div
          className={`rounded-2xl border border-dashed p-5 text-center space-y-2 ${
            isNight
              ? 'border-white/20 bg-[#162340]/70 text-[#CBD5E1]'
              : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#475569]'
          }`}
        >
          <FileText
            className="mx-auto h-7 w-7 opacity-60"
            aria-hidden="true"
          />
          <p className="text-xs sm:text-sm font-semibold">
            {copy.egyptJournalEmptyState}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Completed Master Blueprint Preview */}
          {showBlueprintPreview && latestBlueprint && (
            <div
              className={`rounded-2xl border p-3.5 space-y-2 ${
                isNight
                  ? 'border-[#E7B43C]/45 bg-[#1B2542]'
                  : 'border-[#F59E0B]/45 bg-[#FFFBEB]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#D97706] dark:text-[#FDE68A]">
                    {copy.egyptJournalBlueprintPreviewTitle}
                  </p>
                  <p className="font-display text-xs sm:text-sm font-extrabold">
                    {latestBlueprint.challengeTitle[language]}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    speakingId === 'blueprint-preview'
                      ? stopSpeech()
                      : speakText(
                          'blueprint-preview',
                          latestBlueprint.instructionText,
                        )
                  }
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold cursor-pointer ${
                    isNight
                      ? 'border-white/15 bg-white/10 text-white'
                      : 'border-[#FDE68A] bg-white text-[#92400E]'
                  }`}
                >
                  {speakingId === 'blueprint-preview' ? (
                    <>
                      <Square className="h-3 w-3" aria-hidden="true" />
                      <span>{copy.egyptDiscoverStopAudioButton}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{copy.egyptJournalListenButton}</span>
                    </>
                  )}
                </button>
              </div>

              <ol className="space-y-1 text-xs sm:text-sm font-semibold">
                {latestBlueprint.instructionLines.map((line, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-mono-num font-extrabold text-[#0D9488] dark:text-[#5EEAD4]">
                      {i + 1}.
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
              {showThaiScaffold && latestBlueprint.thaiScaffold && (
                <p
                  className={`text-[11px] font-medium ${
                    isNight ? 'text-[#CBD5E1]' : 'text-[#64748B]'
                  }`}
                >
                  {latestBlueprint.thaiScaffold}
                </p>
              )}
            </div>
          )}

          {/* Entries Grouped by BUILD Workshop */}
          {EGYPT_BUILD_MISSIONS.map((mission) => {
            const gameEntries = entries.filter(
              (entry) => entry.gameId === mission.gameId,
            );
            if (gameEntries.length === 0) return null;

            return (
              <div
                key={mission.gameId}
                className={`rounded-2xl border p-3.5 space-y-2.5 ${
                  isNight
                    ? 'border-white/12 bg-[#162340]'
                    : 'border-[#E2E8F0] bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <EgyptBuildStationEmblemSVG
                    gameId={mission.gameId}
                    className={
                      compact
                        ? 'h-8 w-8 shrink-0 rounded-lg'
                        : 'h-9 w-9 shrink-0 rounded-xl'
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-xs sm:text-sm font-extrabold truncate">
                      {mission.title[language]}
                    </p>
                    <p
                      className={`text-[11px] ${
                        isNight ? 'text-[#94A3B8]' : 'text-[#64748B]'
                      }`}
                    >
                      {gameEntries.length} / 6{' '}
                      {language === 'th' ? 'รายการที่บันทึก' : 'saved'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {gameEntries.map((entry) => {
                    const isSpeaking = speakingId === entry.id;
                    return (
                      <div
                        key={entry.id}
                        className={`rounded-xl border p-2.5 space-y-1.5 ${
                          isNight
                            ? 'border-white/10 bg-[#0F1B33]'
                            : 'border-[#E2E8F0] bg-[#F8FAFC]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="rounded-md bg-[#0D9488]/15 px-1.5 py-0.5 font-mono-num text-[10px] font-extrabold text-[#0D9488] dark:text-[#5EEAD4]">
                              {entry.cefrLevel.toUpperCase()}
                            </span>
                            {entry.attemptNumber && entry.attemptNumber > 1 && (
                              <span className="rounded-md bg-[#E7B43C]/20 px-1.5 py-0.5 font-mono-num text-[10px] font-extrabold text-[#B45309] dark:text-[#FDE68A]">
                                #{entry.attemptNumber}
                              </span>
                            )}
                            <span className="text-xs font-bold truncate">
                              {entry.challengeTitle[language]}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              isSpeaking
                                ? stopSpeech()
                                : speakText(entry.id, entry.instructionText)
                            }
                            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                              isNight
                                ? 'border-white/15 bg-white/10 text-white'
                                : 'border-[#CBD5E1] bg-white text-[#334155]'
                            }`}
                          >
                            {isSpeaking ? (
                              <>
                                <Square className="h-3 w-3" aria-hidden="true" />
                                <span>{copy.egyptDiscoverStopAudioButton}</span>
                              </>
                            ) : (
                              <>
                                <Volume2
                                  className="h-3 w-3"
                                  aria-hidden="true"
                                />
                                <span>{copy.egyptJournalListenButton}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {entry.instructionLines.length > 1 ? (
                          <ol className="space-y-0.5 text-xs font-semibold leading-snug">
                            {entry.instructionLines.map((line, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="font-mono-num opacity-65">
                                  {i + 1}.
                                </span>
                                <span>{line}</span>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-xs sm:text-sm font-semibold leading-snug">
                            “{entry.instructionText}”
                          </p>
                        )}

                        {showThaiScaffold && entry.thaiScaffold && (
                          <p
                            className={`text-[11px] ${
                              isNight ? 'text-[#CBD5E1]' : 'text-[#64748B]'
                            }`}
                          >
                            {entry.thaiScaffold}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p
        className={`text-[11px] font-medium ${
          isNight ? 'text-[#94A3B8]' : 'text-[#64748B]'
        }`}
      >
        {copy.egyptJournalRevisionPolicyNote}
      </p>
    </div>
  );
}
