import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Edit3,
  Feather,
  Mic,
  MicOff,
  Save,
  ShieldCheck,
  Sparkles,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import type {
  AppLanguage,
  EgyptInstructionJournalRecord,
  EgyptPerformEvidenceRecord,
  EgyptPerformReflectionSectionId,
  EgyptPerformReflectionState,
  EgyptPerformReflectionStrengthId,
  EgyptPracticeEvidenceRecord,
  ResolvedAppearance,
} from '../../types/game';
import { GAME_COPY } from '../../data/i18n';
import {
  EGYPT_REFLECTION_GOAL_OPTIONS,
  EGYPT_REFLECTION_SECTIONS,
  EGYPT_REFLECTION_SECTION_ORDER,
  EGYPT_REFLECTION_STRENGTH_OPTIONS,
  TRANSPARENT_REFLECTION_NOTE,
  createEmptyEgyptReflectionState,
  evaluateEgyptReflectionDraft,
  hasAnyEgyptReflectionDraftContent,
} from '../../data/egyptReflection';
import { voxAudio } from '../../utils/audioEngine';
import { EgyptNpcPortraitSVG } from './EgyptSvgArtwork';
import { EgyptInstructionJournal } from './EgyptInstructionJournal';

interface EgyptFinalReflectionModalProps {
  isOpen: boolean;
  language: AppLanguage;
  appearance: ResolvedAppearance;
  reducedMotion?: boolean;
  performCompleted: boolean;
  alreadySubmittedAt?: string;
  initialReflection?: EgyptPerformReflectionState;
  initialDifficulty?: 'a2' | 'b1';
  performPortfolio: EgyptPerformEvidenceRecord[];
  buildJournal: EgyptInstructionJournalRecord[];
  practiceJournal: EgyptPracticeEvidenceRecord[];
  onSaveDraft: (draft: EgyptPerformReflectionState) => void;
  onSubmitReflection: (submitted: EgyptPerformReflectionState) => void;
  onClose: () => void;
  onPlaySfx?: (kind?: 'click' | 'select' | 'complete' | 'reward') => void;
}

type BrowserSpeechRecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognitionCtor(): BrowserSpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: BrowserSpeechRecognitionCtor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function formatReadableDate(iso: string | undefined, language: AppLanguage): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EgyptFinalReflectionModal({
  isOpen,
  language,
  appearance,
  reducedMotion = false,
  performCompleted,
  alreadySubmittedAt,
  initialReflection,
  initialDifficulty = 'a2',
  performPortfolio,
  buildJournal,
  practiceJournal,
  onSaveDraft,
  onSubmitReflection,
  onClose,
  onPlaySfx,
}: EgyptFinalReflectionModalProps) {
  const isNight = appearance === 'night';
  const copy = GAME_COPY[language];
  const isReadOnlySummary =
    performCompleted && initialReflection?.status === 'submitted';

  const [draft, setDraft] = useState<EgyptPerformReflectionState>(() =>
    initialReflection
      ? {
          ...initialReflection,
          sections: { ...initialReflection.sections },
          selectedStrengths: [...initialReflection.selectedStrengths],
          selectedGoalIds: [...initialReflection.selectedGoalIds],
        }
      : createEmptyEgyptReflectionState(initialDifficulty),
  );
  const [step, setStep] = useState<'edit' | 'review'>('edit');
  const [showThaiTips, setShowThaiTips] = useState<boolean>(language === 'th');
  const [showPortfolioDrawer, setShowPortfolioDrawer] = useState<boolean>(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [listeningSectionId, setListeningSectionId] =
    useState<EgyptPerformReflectionSectionId | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const recognitionRef = useRef<InstanceType<BrowserSpeechRecognitionCtor> | null>(null);

  const hasSpeechRec = useMemo(() => Boolean(getSpeechRecognitionCtor()), []);

  const stopAllSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors
      }
      recognitionRef.current = null;
    }
    setListeningSectionId(null);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setDraft(
      initialReflection
        ? {
            ...initialReflection,
            sections: { ...initialReflection.sections },
            selectedStrengths: [...initialReflection.selectedStrengths],
            selectedGoalIds: [...initialReflection.selectedGoalIds],
          }
        : createEmptyEgyptReflectionState(initialDifficulty),
    );
    setStep('edit');
    setSaveNotice(null);
    voxAudio.setDialogueDucking(true);
    return () => {
      stopAllSpeech();
      voxAudio.setDialogueDucking(false);
    };
  }, [isOpen, initialReflection, initialDifficulty, stopAllSpeech]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        if (!isReadOnlySummary && hasAnyEgyptReflectionDraftContent(draft)) {
          onSaveDraft({
            ...draft,
            status: 'draft',
            updatedAt: new Date().toISOString(),
          });
        }
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isReadOnlySummary, draft, onSaveDraft, onClose]);

  const evaluation = useMemo(() => evaluateEgyptReflectionDraft(draft), [draft]);

  if (!isOpen) return null;

  const speakEnglishPrompt = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 0.94;
    utter.onend = () => setSpeakingId(null);
    utter.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utter);
    onPlaySfx?.('click');
  };

  const handleTransientDictation = (sectionId: EgyptPerformReflectionSectionId) => {
    if (listeningSectionId === sectionId) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setListeningSectionId(null);
      return;
    }
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    stopAllSpeech();
    try {
      const rec = new Ctor();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.continuous = false;
      rec.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim() ?? '';
        if (transcript) {
          setDraft((prev) => {
            const current = prev.sections[sectionId] ?? '';
            const nextText = current ? `${current.trim()} ${transcript}` : transcript;
            return {
              ...prev,
              speechRehearsalUsed: true,
              updatedAt: new Date().toISOString(),
              sections: {
                ...prev.sections,
                [sectionId]: nextText,
              },
            };
          });
        }
      };
      rec.onerror = () => setListeningSectionId(null);
      rec.onend = () => {
        setListeningSectionId(null);
        recognitionRef.current = null;
      };
      recognitionRef.current = rec;
      setListeningSectionId(sectionId);
      rec.start();
      onPlaySfx?.('select');
    } catch {
      setListeningSectionId(null);
    }
  };

  const updateSectionText = (
    sectionId: EgyptPerformReflectionSectionId,
    value: string,
  ) => {
    setSaveNotice(null);
    setDraft((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      sections: {
        ...prev.sections,
        [sectionId]: value,
      },
    }));
  };

  const appendStarterOrWord = (
    sectionId: EgyptPerformReflectionSectionId,
    snippet: string,
  ) => {
    onPlaySfx?.('select');
    setSaveNotice(null);
    setDraft((prev) => {
      const current = prev.sections[sectionId] ?? '';
      const clean = current.trimEnd();
      const next = clean.length === 0 ? `${snippet} ` : `${clean} ${snippet} `;
      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        sections: {
          ...prev.sections,
          [sectionId]: next,
        },
      };
    });
  };

  const toggleStrength = (id: EgyptPerformReflectionStrengthId) => {
    onPlaySfx?.('select');
    setSaveNotice(null);
    setDraft((prev) => {
      const exists = prev.selectedStrengths.includes(id);
      const next = exists
        ? prev.selectedStrengths.filter((item) => item !== id)
        : [...prev.selectedStrengths, id];
      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        selectedStrengths: next,
      };
    });
  };

  const toggleGoal = (id: string) => {
    onPlaySfx?.('select');
    setSaveNotice(null);
    setDraft((prev) => {
      const exists = prev.selectedGoalIds.includes(id);
      const next = exists
        ? prev.selectedGoalIds.filter((item) => item !== id)
        : [...prev.selectedGoalIds, id];
      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        selectedGoalIds: next,
      };
    });
  };

  const handleSaveAndClose = () => {
    onPlaySfx?.('click');
    const saved: EgyptPerformReflectionState = {
      ...draft,
      status: 'draft',
      submittedAt: undefined,
      updatedAt: new Date().toISOString(),
    };
    onSaveDraft(saved);
    onClose();
  };

  const handleSaveDraftInPlace = () => {
    onPlaySfx?.('select');
    const saved: EgyptPerformReflectionState = {
      ...draft,
      status: 'draft',
      submittedAt: undefined,
      updatedAt: new Date().toISOString(),
    };
    onSaveDraft(saved);
    setSaveNotice(
      language === 'th'
        ? 'บันทึกร่างคำสะท้อนคิดเรียบร้อยแล้ว สามารถกลับมาทำต่อได้ทุกเมื่อ'
        : 'Reflection draft saved safely. You can continue anytime without losing progress.',
    );
  };

  const handleGoToReview = () => {
    if (!evaluation.readyToSubmit) return;
    onPlaySfx?.('complete');
    setStep('review');
  };

  const handleFinalSubmit = () => {
    if (!evaluation.readyToSubmit) return;
    onPlaySfx?.('reward');
    const now = new Date().toISOString();
    onSubmitReflection({
      ...draft,
      status: 'submitted',
      updatedAt: now,
      submittedAt: now,
    });
  };

  const containerTone = isNight
    ? 'border-[#F2C66D]/45 bg-[#101B2E] text-[#F8FAFC]'
    : 'border-[#D4A14A]/65 bg-[#FFFDF8] text-[#172338]';

  const cardTone = isNight
    ? 'border-[#33486B] bg-[#16233B]'
    : 'border-[#E6D6B8] bg-[#FAF4E8]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#080F1E]/80 p-3 sm:p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={copy.egyptReflectionGateTitle}
      data-testid="egypt-final-reflection-modal"
    >
      <div
        className={`relative flex max-h-[93vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-2 shadow-2xl ${containerTone}`}
      >
        {/* Top Header */}
        <div
          className={`flex items-start justify-between gap-3 border-b px-5 py-4 ${
            isNight ? 'border-white/10 bg-[#142038]' : 'border-[#E7D8BA] bg-[#F7EEDB]'
          }`}
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="hidden sm:block shrink-0">
              <EgyptNpcPortraitSVG npcId="npc_layla" className="h-14 w-14" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-[#D4A14A]/20 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#B7791F] dark:text-[#F2C66D]">
                  <Feather className="h-3.5 w-3.5" aria-hidden="true" />
                  {language === 'th' ? 'ด่าน 5 · สะท้อนคิดขั้นสุดท้าย' : 'Stage 5 · Final Self-Reflection'}
                </span>
                {isReadOnlySummary && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-[#24B8B0]/20 px-2 py-0.5 text-[11px] font-extrabold text-[#0E7A74] dark:text-[#5EEAD4]">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {language === 'th' ? 'ส่งคำสะท้อนคิดแล้ว' : 'Submitted'}
                  </span>
                )}
              </div>
              <h2 className="mt-1 font-display text-lg sm:text-xl font-extrabold leading-tight">
                {language === 'th'
                  ? 'คำสะท้อนคิดขั้นสุดท้ายของนักสำรวจ — การเดินทางและพัฒนาการของฉัน'
                  : "The Explorer's Final Reflection — My Journey, My Growth"}
              </h2>
              <p className={`mt-0.5 text-xs sm:text-sm ${isNight ? 'text-white/75' : 'text-[#4B5B73]'}`}>
                {isReadOnlySummary
                  ? language === 'th'
                    ? `บันทึกสรุปการเรียนรู้ขั้นสุดท้ายของอียิปต์ (ส่งเมื่อ ${formatReadableDate(alreadySubmittedAt ?? initialReflection?.submittedAt, language)})`
                    : `Read-only summary of your submitted Egypt reflection (${formatReadableDate(alreadySubmittedAt ?? initialReflection?.submittedAt, language)}).`
                  : language === 'th'
                    ? 'บอกเล่าการเรียนรู้ จุดที่ยาก กลยุทธ์ และเป้าหมายของคุณตามความจริง เพื่อเปิดผนึกโถงแห่งปัญญาและรับ +100 XP + ตราพาสปอร์ตอียิปต์'
                    : 'Share your honest learning journey to unseal the Chamber of Wisdom and receive your +100 XP & official Egypt Passport Stamp.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={isReadOnlySummary ? onClose : handleSaveAndClose}
            aria-label={copy.closeSettings}
            data-testid="reflection-close-button"
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors cursor-pointer ${
              isNight
                ? 'border-white/15 bg-white/10 text-white hover:bg-white/20'
                : 'border-[#D4A14A]/40 bg-white text-[#172338] hover:bg-[#FAF0DC]'
            }`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Mode & Scaffold Controls */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2 border-b px-5 py-2.5 text-xs ${
            isNight ? 'border-white/10 bg-[#0F182B]' : 'border-[#EDE1C9] bg-[#FDF8EC]'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            {!isReadOnlySummary && (
              <div
                className={`inline-flex rounded-xl border p-0.5 ${
                  isNight ? 'border-white/15 bg-white/5' : 'border-[#D4A14A]/40 bg-white'
                }`}
                role="group"
                aria-label="CEFR Guidance Mode"
              >
                <button
                  type="button"
                  data-testid="reflection-mode-a2"
                  onClick={() => {
                    onPlaySfx?.('select');
                    setDraft((prev) => ({ ...prev, cefrMode: 'a2' }));
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition-colors cursor-pointer ${
                    draft.cefrMode === 'a2'
                      ? 'bg-[#24B8B0] text-[#0A1E24]'
                      : isNight
                        ? 'text-white/75 hover:text-white'
                        : 'text-[#4B5B73] hover:text-[#172338]'
                  }`}
                >
                  A2 Guided
                </button>
                <button
                  type="button"
                  data-testid="reflection-mode-b1"
                  onClick={() => {
                    onPlaySfx?.('select');
                    setDraft((prev) => ({ ...prev, cefrMode: 'b1' }));
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition-colors cursor-pointer ${
                    draft.cefrMode === 'b1'
                      ? 'bg-[#D4A14A] text-[#172338]'
                      : isNight
                        ? 'text-white/75 hover:text-white'
                        : 'text-[#4B5B73] hover:text-[#172338]'
                  }`}
                >
                  B1 Independent
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                onPlaySfx?.('click');
                setShowThaiTips((v) => !v);
              }}
              className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-bold cursor-pointer ${
                isNight
                  ? 'border-white/15 bg-white/8 text-white/90 hover:bg-white/15'
                  : 'border-[#D4A14A]/35 bg-white text-[#334155] hover:bg-[#FAF0DC]'
              }`}
            >
              <span>{language === 'th' ? 'คำอธิบายภาษาไทย' : 'Thai Scaffold Tips'}</span>
              {showThaiTips ? (
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          </div>

          <button
            type="button"
            data-testid="reflection-evidence-drawer-toggle"
            onClick={() => {
              onPlaySfx?.('click');
              setShowPortfolioDrawer((prev) => !prev);
              setDraft((prev) => ({ ...prev, reviewedPortfolioEvidence: true }));
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-extrabold cursor-pointer ${
              isNight
                ? 'border-[#F2C66D]/40 bg-[#F2C66D]/12 text-[#F2C66D] hover:bg-[#F2C66D]/20'
                : 'border-[#B7791F]/35 bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A]'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {showPortfolioDrawer
                ? language === 'th'
                  ? 'ซ่อนหลักฐานการเรียนรู้'
                  : 'Hide My Evidence Drawer'
                : language === 'th'
                  ? `ดูหลักฐานที่สะสม (${performPortfolio.length}/5 ภารกิจ)`
                  : `Review My Evidence (${performPortfolio.length}/5 Missions)`}
            </span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Transparent Reflection Notice */}
          <div
            className={`flex items-start gap-2.5 rounded-2xl border p-3 text-xs leading-relaxed ${
              isNight
                ? 'border-[#24B8B0]/35 bg-[#24B8B0]/10 text-[#CCFBF1]'
                : 'border-[#0E7A74]/25 bg-[#ECFEFF] text-[#115E59]'
            }`}
          >
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{TRANSPARENT_REFLECTION_NOTE[language]}</p>
          </div>

          {/* Evidence Drawer */}
          {showPortfolioDrawer && (
            <div className={`rounded-2xl border p-3 ${cardTone}`}>
              <EgyptInstructionJournal
                language={language}
                isNight={isNight}
                entries={buildJournal}
                practiceEntries={practiceJournal}
                performEntries={performPortfolio}
                initialTab="perform"
                compact
                showBlueprintPreview={false}
                onPlaySfx={onPlaySfx}
              />
            </div>
          )}

          {saveNotice && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-[#24B8B0]/50 bg-[#24B8B0]/15 px-3 py-2 text-xs font-bold text-[#0E7A74] dark:text-[#5EEAD4]"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{saveNotice}</span>
            </div>
          )}

          {/* READ-ONLY OR REVIEW MODE */}
          {(isReadOnlySummary || step === 'review') ? (
            <div className="space-y-4" data-testid="reflection-review-summary">
              {!isReadOnlySummary && (
                <div
                  className={`rounded-2xl border p-3.5 ${
                    isNight
                      ? 'border-[#F2C66D]/40 bg-[#F2C66D]/10 text-[#FEF3C7]'
                      : 'border-[#D4A14A]/50 bg-[#FEF9E7] text-[#78350F]'
                  }`}
                >
                  <p className="text-sm font-extrabold">
                    {language === 'th'
                      ? 'ตรวจสอบคำตอบก่อนส่งขั้นสุดท้าย'
                      : 'Review Before Final Submission'}
                  </p>
                  <p className="mt-1 text-xs">
                    {language === 'th'
                      ? 'เมื่อกดส่งแล้ว ระบบจะเปิดผนึกโถงแห่งปัญญา มอบ +100 XP และตราประทับพาสปอร์ตอียิปต์ 5/5 อย่างถาวร'
                      : 'Submitting will unseal the Chamber of Wisdom and award your lifetime +100 XP and Egypt Passport Stamp (5/5).'}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {EGYPT_REFLECTION_SECTIONS.map((sec) => (
                  <div key={sec.id} className={`rounded-2xl border p-3.5 ${cardTone}`}>
                    <div className="text-xs font-extrabold uppercase tracking-wide text-[#B7791F] dark:text-[#F2C66D]">
                      {sec.title[language]}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                      {draft.sections[sec.id] || '—'}
                    </p>
                  </div>
                ))}
              </div>

              <div className={`rounded-2xl border p-3.5 space-y-2 ${cardTone}`}>
                <div className="text-xs font-extrabold uppercase tracking-wide text-[#0E7A74] dark:text-[#5EEAD4]">
                  {language === 'th' ? 'จุดแข็งและพัฒนาการที่เลือก' : 'Selected Strengths & Growth Areas'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {draft.selectedStrengths.map((sid) => {
                    const opt = EGYPT_REFLECTION_STRENGTH_OPTIONS.find((o) => o.id === sid);
                    return (
                      <span
                        key={sid}
                        className="rounded-xl border border-[#24B8B0]/40 bg-[#24B8B0]/15 px-2.5 py-1 text-xs font-bold"
                      >
                        {opt?.label[language] ?? sid}
                      </span>
                    );
                  })}
                </div>
              </div>

              {draft.selectedGoalIds.length > 0 && (
                <div className={`rounded-2xl border p-3.5 space-y-2 ${cardTone}`}>
                  <div className="text-xs font-extrabold uppercase tracking-wide text-[#B7791F] dark:text-[#F2C66D]">
                    {language === 'th' ? 'เป้าหมายการเรียนที่เลือก' : 'Selected Next Goals'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {draft.selectedGoalIds.map((gid) => {
                      const opt = EGYPT_REFLECTION_GOAL_OPTIONS.find((o) => o.id === gid);
                      return (
                        <span
                          key={gid}
                          className="rounded-xl border border-[#D4A14A]/40 bg-[#D4A14A]/15 px-2.5 py-1 text-xs font-bold"
                        >
                          {opt?.label[language] ?? gid}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* EDIT FORM MODE */
            <div className="space-y-4">
              {EGYPT_REFLECTION_SECTIONS.map((sec) => {
                const val = draft.sections[sec.id] ?? '';
                const secEval = evaluation.sectionResults[sec.id];
                const promptText = draft.cefrMode === 'b1' ? sec.b1Prompt : sec.a2Prompt;
                const isListeningHere = listeningSectionId === sec.id;
                const isSpeakingHere = speakingId === `sec-${sec.id}`;

                return (
                  <section
                    key={sec.id}
                    className={`rounded-2xl border p-4 space-y-3 ${cardTone} ${
                      reducedMotion ? '' : 'transition-colors'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-extrabold text-[#B7791F] dark:text-[#F2C66D]">
                          {sec.title[language]}
                        </h3>
                        <p className="mt-1 text-sm font-bold leading-snug">
                          {promptText[language]}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => speakEnglishPrompt(`sec-${sec.id}`, promptText.en)}
                          className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                            isNight
                              ? 'border-white/15 bg-white/8 text-white hover:bg-white/15'
                              : 'border-[#D4A14A]/35 bg-white text-[#172338] hover:bg-[#FAF0DC]'
                          }`}
                        >
                          {isSpeakingHere ? (
                            <Square className="h-3 w-3" aria-hidden="true" />
                          ) : (
                            <Volume2 className="h-3 w-3" aria-hidden="true" />
                          )}
                          <span>{isSpeakingHere ? 'Stop' : 'Listen'}</span>
                        </button>
                        {secEval.valid ? (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-[#24B8B0]/20 px-2 py-1 text-[11px] font-extrabold text-[#0E7A74] dark:text-[#5EEAD4]">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{secEval.wordCount}w</span>
                          </span>
                        ) : (
                          <span className="rounded-xl bg-white/10 px-2 py-1 text-[11px] font-mono-num font-bold opacity-75">
                            {secEval.wordCount}w
                          </span>
                        )}
                      </div>
                    </div>

                    {showThaiTips && (
                      <p className={`rounded-xl px-3 py-1.5 text-xs ${isNight ? 'bg-white/5 text-[#CBD5E1]' : 'bg-white/80 text-[#475569]'}`}>
                        {sec.thaiScaffoldNote}
                      </p>
                    )}

                    {/* A2 Scaffolds vs B1 Guiding Questions */}
                    {draft.cefrMode === 'a2' ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {sec.a2SentenceStarters.map((starter) => (
                            <button
                              key={starter}
                              type="button"
                              onClick={() => appendStarterOrWord(sec.id, starter)}
                              className={`rounded-xl border px-2.5 py-1 text-xs font-bold cursor-pointer ${
                                isNight
                                  ? 'border-[#24B8B0]/40 bg-[#24B8B0]/15 text-[#99F6E4] hover:bg-[#24B8B0]/25'
                                  : 'border-[#0E7A74]/30 bg-white text-[#0E7A74] hover:bg-[#E6FFFA]'
                              }`}
                            >
                              + {starter}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-bold opacity-75">
                            {language === 'th' ? 'คลังคำ:' : 'Word Bank:'}
                          </span>
                          {sec.a2WordBank.map((word) => (
                            <button
                              key={word}
                              type="button"
                              onClick={() => appendStarterOrWord(sec.id, word)}
                              className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold cursor-pointer ${
                                isNight
                                  ? 'border-white/15 bg-white/5 text-white/85 hover:bg-white/15'
                                  : 'border-[#D4A14A]/35 bg-[#FFFDF8] text-[#475569] hover:bg-[#FEF3C7]'
                              }`}
                            >
                              {word}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <ul className={`list-disc pl-5 text-xs space-y-0.5 ${isNight ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
                        {sec.b1GuidingQuestions.map((q) => (
                          <li key={q}>{q}</li>
                        ))}
                      </ul>
                    )}

                    <div className="space-y-1.5">
                      <textarea
                        rows={3}
                        data-testid={`reflection-input-${sec.id}`}
                        value={val}
                        onChange={(e) => updateSectionText(sec.id, e.target.value)}
                        placeholder={sec.placeholder[draft.cefrMode]}
                        aria-label={sec.title[language]}
                        className={`w-full rounded-xl border p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 ${
                          isNight
                            ? 'border-white/15 bg-[#0D1628] text-white placeholder:text-white/40 focus:ring-[#24B8B0]'
                            : 'border-[#D4A14A]/45 bg-white text-[#172338] placeholder:text-[#94A3B8] focus:ring-[#0E7A74]'
                        }`}
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] opacity-80">{sec.honestToneNote[language]}</span>

                        {hasSpeechRec && (
                          <button
                            type="button"
                            onClick={() => handleTransientDictation(sec.id)}
                            className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                              isListeningHere
                                ? 'border-[#EF4444] bg-[#EF4444]/15 text-[#EF4444]'
                                : isNight
                                  ? 'border-white/15 bg-white/8 text-white/85 hover:bg-white/15'
                                  : 'border-[#D4A14A]/35 bg-white text-[#334155] hover:bg-[#FAF0DC]'
                            }`}
                          >
                            {isListeningHere ? (
                              <MicOff className="h-3 w-3" aria-hidden="true" />
                            ) : (
                              <Mic className="h-3 w-3" aria-hidden="true" />
                            )}
                            <span>
                              {isListeningHere
                                ? language === 'th'
                                  ? 'กำลังฟัง... แตะเพื่อหยุด'
                                  : 'Listening... Tap to stop'
                                : language === 'th'
                                  ? 'ซ้อมพูดเป็นข้อความ (ชั่วคราว ไม่บันทึกเสียง)'
                                  : 'Speak to Type (Transient — audio not saved)'}
                            </span>
                          </button>
                        )}
                      </div>
                      {val.trim().length > 0 && !secEval.valid && secEval.feedback && (
                        <p className="text-xs font-semibold text-[#D97706] dark:text-[#FBBF24]">
                          {secEval.feedback[language]}
                        </p>
                      )}
                    </div>
                  </section>
                );
              })}

              {/* Strengths Checklist */}
              <section className={`rounded-2xl border p-4 space-y-2.5 ${cardTone}`}>
                <h3 className="text-sm font-extrabold text-[#0E7A74] dark:text-[#5EEAD4]">
                  {language === 'th'
                    ? 'เลือกจุดแข็งหรือสิ่งที่กำลังพัฒนาอย่างน้อย 1 ข้อ'
                    : 'Select at least 1 strength or growth area'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EGYPT_REFLECTION_STRENGTH_OPTIONS.map((opt) => {
                    const active = draft.selectedStrengths.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        data-testid={`reflection-strength-${opt.id}`}
                        onClick={() => toggleStrength(opt.id)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors cursor-pointer ${
                          active
                            ? 'border-[#24B8B0] bg-[#24B8B0]/20 text-[#0E7A74] dark:text-[#99F6E4]'
                            : isNight
                              ? 'border-white/12 bg-[#0D1628] text-white/85 hover:bg-white/10'
                              : 'border-[#E2D4B7] bg-white text-[#334155] hover:bg-[#FAF0DC]'
                        }`}
                      >
                        <CheckCircle2
                          className={`h-4 w-4 shrink-0 ${active ? 'opacity-100' : 'opacity-25'}`}
                          aria-hidden="true"
                        />
                        <span>{opt.label[language]}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Next Learning Goal Chips */}
              <section className={`rounded-2xl border p-4 space-y-2.5 ${cardTone}`}>
                <h3 className="text-sm font-extrabold text-[#B7791F] dark:text-[#F2C66D]">
                  {language === 'th'
                    ? 'เป้าหมายการฝึกฝนต่อ (เลือกเสริมได้)'
                    : 'Optional Next-Step Learning Goals'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {EGYPT_REFLECTION_GOAL_OPTIONS.map((goal) => {
                    const active = draft.selectedGoalIds.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        data-testid={`reflection-goal-${goal.id}`}
                        onClick={() => toggleGoal(goal.id)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                          active
                            ? 'border-[#D4A14A] bg-[#D4A14A]/25 text-[#92400E] dark:text-[#FDE68A]'
                            : isNight
                              ? 'border-white/12 bg-[#0D1628] text-white/80 hover:bg-white/10'
                              : 'border-[#E2D4B7] bg-white text-[#334155] hover:bg-[#FAF0DC]'
                        }`}
                      >
                        {goal.label[language]}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Validation Guidance Summary */}
              {!evaluation.readyToSubmit && (
                <div
                  className={`rounded-2xl border p-3.5 text-xs space-y-1.5 ${
                    isNight
                      ? 'border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#FDE68A]'
                      : 'border-[#D97706]/35 bg-[#FFFBEB] text-[#92400E]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-extrabold">
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      {language === 'th'
                        ? `ยังเหลืออีก ${evaluation.issues.length} รายการก่อนตรวจสอบเพื่อส่ง:`
                        : `${evaluation.issues.length} item(s) remaining before submission:`}
                    </span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {evaluation.issues.slice(0, 6).map((issue, idx) => (
                      <li key={idx}>{issue[language]}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2.5 border-t px-5 py-3.5 ${
            isNight ? 'border-white/10 bg-[#142038]' : 'border-[#E7D8BA] bg-[#F7EEDB]'
          }`}
        >
          {isReadOnlySummary ? (
            <>
              <div className="flex items-center gap-2 text-xs font-semibold opacity-80">
                <Compass className="h-4 w-4 text-[#24B8B0]" aria-hidden="true" />
                <span>
                  {language === 'th'
                    ? 'คำสะท้อนคิดถูกบันทึกไว้ถาวรในประวัติการเรียนรู้ของคุณแล้ว'
                    : 'Your submitted reflection is safely preserved in your learning legacy.'}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-[#D4A14A] px-5 py-2 text-sm font-extrabold text-[#172338] hover:bg-[#e1b361] cursor-pointer"
              >
                <span>{copy.closeSettings}</span>
              </button>
            </>
          ) : step === 'edit' ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-testid="reflection-save-draft-button"
                  onClick={handleSaveDraftInPlace}
                  className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-extrabold cursor-pointer ${
                    isNight
                      ? 'border-white/20 bg-white/10 text-white hover:bg-white/18'
                      : 'border-[#D4A14A]/50 bg-white text-[#172338] hover:bg-[#FAF0DC]'
                  }`}
                >
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{copy.egyptReflectionSaveDraftBtn}</span>
                </button>
                <button
                  type="button"
                  data-testid="reflection-save-close-button"
                  onClick={handleSaveAndClose}
                  className="text-xs font-bold underline opacity-85 hover:opacity-100 cursor-pointer px-2 py-1"
                >
                  {language === 'th' ? 'บันทึกแล้วกลับไปสำรวจ' : 'Save & Return to Map'}
                </button>
              </div>

              <button
                type="button"
                data-testid="reflection-review-submit-button"
                disabled={!evaluation.readyToSubmit}
                onClick={handleGoToReview}
                className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-5 py-2 text-sm font-extrabold transition-all ${
                  evaluation.readyToSubmit
                    ? 'bg-[#24B8B0] text-[#082026] hover:bg-[#2ed0c7] shadow-md cursor-pointer'
                    : 'bg-slate-400/30 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>
                  {copy.egyptReflectionReviewBeforeSubmitBtn} (
                  {EGYPT_REFLECTION_SECTION_ORDER.filter((id) => evaluation.sectionResults[id].valid).length}
                  /5)
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                data-testid="reflection-back-edit-button"
                onClick={() => {
                  onPlaySfx?.('click');
                  setStep('edit');
                }}
                className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-extrabold cursor-pointer ${
                  isNight
                    ? 'border-white/20 bg-white/10 text-white hover:bg-white/18'
                    : 'border-[#D4A14A]/50 bg-white text-[#172338] hover:bg-[#FAF0DC]'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{copy.egyptReflectionBackToEditBtn}</span>
              </button>

              <button
                type="button"
                data-testid="reflection-final-submit-button"
                onClick={handleFinalSubmit}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4A14A] to-[#F2C66D] px-5 py-2 text-sm font-extrabold text-[#172338] shadow-lg hover:brightness-105 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>{copy.egyptReflectionSubmitFinalBtn}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
