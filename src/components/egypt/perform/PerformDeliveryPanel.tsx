import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Mic,
  Play,
  RefreshCw,
  Square,
  Trash2,
  Volume2,
} from 'lucide-react';
import type {
  AppLanguage,
  EgyptPerformAssessmentResult,
  EgyptPerformPracticeMode,
  LocalizedText,
} from '../../../types/game';
import {
  isMicrophoneRecordingSupported,
  startTransientMicRecording,
  type ActiveRecordingHandle,
  type RecorderErrorCode,
} from '../../../utils/audioRecorder';
import { RUBRIC_CRITERION_LABELS } from '../../../data/egyptPerformAssessment';

interface PerformDeliveryPanelProps {
  language: AppLanguage;
  isNight: boolean;
  cefrLevel: 'a2' | 'b1';
  wordBank: string[];
  sentenceStarters: string[];
  thaiScaffold: string;
  learnerText: string;
  onLearnerTextChange: (next: string) => void;
  practiceMode: EgyptPerformPracticeMode;
  onPracticeModeChange: (mode: EgyptPerformPracticeMode) => void;
  selfReviewChecks: string[];
  onToggleSelfReviewCheck: (checkId: string) => void;
  assessment: EgyptPerformAssessmentResult;
  placeholder: LocalizedText;
  alreadyCompleted?: boolean;
  submitLabel: LocalizedText;
  onSubmit: () => void;
  onPlaySfx: (kind?: 'click' | 'select' | 'reward') => void;
}

const SELF_REVIEW_OPTIONS: Array<{ id: string; label: LocalizedText }> = [
  {
    id: 'checked_clarity',
    label: {
      en: 'My instructions or explanations are clear and easy to follow.',
      th: 'คำสั่งหรือคำอธิบายของฉันชัดเจนและเข้าใจง่าย',
    },
  },
  {
    id: 'addressed_scenario',
    label: {
      en: 'I addressed the visitor needs and scenario details.',
      th: 'ฉันตอบสนองความต้องการของผู้มาเยือนและเงื่อนไขสถานการณ์ครบถ้วน',
    },
  },
  {
    id: 'checked_sequence_or_rules',
    label: {
      en: 'I used logical order or polite expressions appropriately.',
      th: 'ฉันใช้ลำดับขั้นตอนหรือถ้อยคำสุภาพได้เหมาะสม',
    },
  },
];

export function PerformDeliveryPanel({
  language,
  isNight,
  cefrLevel,
  wordBank,
  sentenceStarters,
  thaiScaffold,
  learnerText,
  onLearnerTextChange,
  practiceMode,
  onPracticeModeChange,
  selfReviewChecks,
  onToggleSelfReviewCheck,
  assessment,
  placeholder,
  alreadyCompleted = false,
  submitLabel,
  onSubmit,
  onPlaySfx,
}: PerformDeliveryPanelProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recorderError, setRecorderError] = useState<RecorderErrorCode | null>(null);
  const [isSpeakingTts, setIsSpeakingTts] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showThaiHint, setShowThaiHint] = useState(language === 'th');
  const recorderRef = useRef<ActiveRecordingHandle | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const micSupported = isMicrophoneRecordingSupported();

  const revokeUrl = useCallback((url: string | null) => {
    if (url && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Ignore cleanup errors
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      recorderRef.current?.dispose();
      recorderRef.current = null;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      revokeUrl(recordedAudioUrl);
    };
  }, [recordedAudioUrl, revokeUrl]);

  const stopTts = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingTts(false);
  }, []);

  const handleSpeakStarter = (text: string) => {
    onPlaySfx('select');
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    stopTts();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.94;
    u.onend = () => setIsSpeakingTts(false);
    u.onerror = () => setIsSpeakingTts(false);
    setIsSpeakingTts(true);
    window.speechSynthesis.speak(u);
  };

  const handleStartRecording = async () => {
    onPlaySfx('select');
    setRecorderError(null);
    if (recordedAudioUrl) {
      revokeUrl(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
    const handle = await startTransientMicRecording({
      onRecordingStarted: () => {
        setIsRecording(true);
        onPracticeModeChange('recorded_mic');
      },
      onAudioReady: (url) => {
        setIsRecording(false);
        setRecordedAudioUrl(url);
        onPracticeModeChange('recorded_mic');
      },
      onError: (code) => {
        setIsRecording(false);
        setRecorderError(code);
      },
    });
    recorderRef.current = handle;
  };

  const handleStopRecording = () => {
    onPlaySfx('click');
    recorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleClearRecording = () => {
    onPlaySfx('click');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingAudio(false);
    revokeUrl(recordedAudioUrl);
    setRecordedAudioUrl(null);
    onPracticeModeChange('written_or_rehearsal');
  };

  const handleTogglePlayRecording = () => {
    if (!recordedAudioUrl) return;
    onPlaySfx('select');
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }
    const audio = new Audio(recordedAudioUrl);
    audioRef.current = audio;
    audio.onended = () => setIsPlayingAudio(false);
    audio.onerror = () => setIsPlayingAudio(false);
    setIsPlayingAudio(true);
    void audio.play().catch(() => setIsPlayingAudio(false));
  };

  const appendChip = (chip: string) => {
    onPlaySfx('select');
    const current = learnerText.trimEnd();
    const spacer = current.length === 0 ? '' : current.endsWith(' ') ? '' : ' ';
    onLearnerTextChange(`${current}${spacer}${chip}`);
  };

  const allSelfReviewsChecked = selfReviewChecks.length >= 2;
  const canSubmit = assessment.readyToComplete && allSelfReviewsChecked;

  return (
    <div className="space-y-4">
      {/* Helpful Word Bank & Sentence Starters */}
      <div
        className={`rounded-2xl border p-3.5 space-y-2.5 ${
          isNight
            ? 'border-white/12 bg-[#162340]'
            : 'border-[#E2E8F0] bg-[#F8FAFC]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-extrabold text-[#0D9488] dark:text-[#5EEAD4]">
            {language === 'th'
              ? `คลังคำศัพท์และโครงประโยคช่วยฝึก (${cefrLevel.toUpperCase()})`
              : `Word Bank & Sentence Starters (${cefrLevel.toUpperCase()})`}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowThaiHint((prev) => !prev)}
              className={`rounded-lg border px-2 py-1 text-[11px] font-bold cursor-pointer ${
                isNight
                  ? 'border-white/15 bg-white/10 text-[#CBD5E1]'
                  : 'border-[#CBD5E1] bg-white text-[#475569]'
              }`}
            >
              {showThaiHint ? 'TH Hint ON' : 'TH Hint OFF'}
            </button>
            <button
              type="button"
              onClick={() =>
                isSpeakingTts
                  ? stopTts()
                  : handleSpeakStarter(sentenceStarters.join(' '))
              }
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                isNight
                  ? 'border-[#12B8B0]/40 bg-[#102A33] text-[#5EEAD4]'
                  : 'border-[#0D9488]/30 bg-white text-[#0F766E]'
              }`}
            >
              {isSpeakingTts ? (
                <>
                  <Square className="h-3 w-3" aria-hidden="true" />
                  <span>{language === 'th' ? 'หยุดฟัง' : 'Stop'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3 w-3" aria-hidden="true" />
                  <span>{language === 'th' ? 'ฟังตัวอย่าง' : 'Listen Model'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {wordBank.map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => appendChip(word)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                isNight
                  ? 'border-[#E7B43C]/40 bg-[#2A2013]/80 text-[#FDE68A] hover:bg-[#3A2C1A]'
                  : 'border-[#F59E0B]/35 bg-[#FFFBEB] text-[#92400E] hover:bg-[#FEF3C7]'
              }`}
            >
              + {word}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          {sentenceStarters.map((starter) => (
            <button
              key={starter}
              type="button"
              onClick={() => appendChip(starter)}
              className={`block w-full rounded-xl border px-3 py-1.5 text-left text-xs font-medium transition-colors cursor-pointer ${
                isNight
                  ? 'border-white/10 bg-[#0F1B33] text-[#E2E8F0] hover:border-[#12B8B0]/50'
                  : 'border-[#E2E8F0] bg-white text-[#334155] hover:border-[#0D9488]/40'
              }`}
            >
              + “{starter}”
            </button>
          ))}
        </div>

        {showThaiHint && (
          <p className={`text-xs ${isNight ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
            {thaiScaffold}
          </p>
        )}
      </div>

      {/* Written Response Composer (Always available; satisfies no-mic fallback too) */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="perform-response-textarea"
            className="text-xs font-extrabold"
          >
            {language === 'th'
              ? 'คำอธิบาย / คำแนะนำภาษาอังกฤษของคุณ (เก็บไว้ใน Performance Portfolio)'
              : 'Your English Performance Response (Saved to Performance Portfolio)'}
          </label>
          <span className="font-mono-num text-[11px] font-bold text-[#0D9488] dark:text-[#5EEAD4]">
            {assessment.wordCount} {language === 'th' ? 'คำ' : 'words'}
          </span>
        </div>

        <textarea
          id="perform-response-textarea"
          rows={4}
          value={learnerText}
          onChange={(e) => onLearnerTextChange(e.target.value)}
          placeholder={placeholder[language]}
          className={`w-full rounded-2xl border p-3.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0D9488] ${
            isNight
              ? 'border-white/15 bg-[#0F1B33] text-[#F8FAFC] placeholder:text-[#64748B]'
              : 'border-[#CBD5E1] bg-white text-[#1E293B] placeholder:text-[#94A3B8]'
          }`}
        />
      </div>

      {/* Optional Transient Microphone Recording (Browser-Only, Zero Persistence) */}
      <div
        className={`rounded-2xl border p-3.5 space-y-2 ${
          isNight
            ? 'border-[#12B8B0]/30 bg-[#102A33]/75'
            : 'border-[#99F6E4] bg-[#F0FDFA]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-extrabold text-[#0F766E] dark:text-[#5EEAD4]">
              {language === 'th'
                ? 'ฝึกพูดอัดเสียงชั่วคราว (ไม่บังคับ · ใช้คำตอบที่เขียนแทนได้เสมอ)'
                : 'Optional Voice Rehearsal Recording (Transient · Written Alternative Always Accepted)'}
            </p>
            <p
              className={`text-[11px] ${
                isNight ? 'text-[#CBD5E1]' : 'text-[#475569]'
              }`}
            >
              {language === 'th'
                ? 'เสียงจะอยู่ในหน่วยความจำชั่วคราวเท่านั้น ไม่ถูกบันทึกหรือส่งออก'
                : 'Audio stays in temporary memory only and is never stored or exported.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isRecording ? (
              <button
                type="button"
                disabled={!micSupported}
                onClick={handleStartRecording}
                className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isNight
                    ? 'bg-[#12B8B0] text-[#0F172A] hover:bg-[#2DD4BF]'
                    : 'bg-[#0D9488] text-white hover:bg-[#0F766E]'
                }`}
              >
                <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {recordedAudioUrl
                    ? language === 'th'
                      ? 'อัดใหม่'
                      : 'Re-record'
                    : language === 'th'
                      ? 'เริ่มอัดเสียง'
                      : 'Record Voice'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopRecording}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#DC2626] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#B91C1C] cursor-pointer"
              >
                <Square className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{language === 'th' ? 'หยุดอัดเสียง' : 'Stop Recording'}</span>
              </button>
            )}

            {recordedAudioUrl && !isRecording && (
              <>
                <button
                  type="button"
                  onClick={handleTogglePlayRecording}
                  className={`inline-flex min-h-[40px] items-center gap-1 rounded-xl border px-3 py-2 text-xs font-bold cursor-pointer ${
                    isNight
                      ? 'border-white/20 bg-white/10 text-white'
                      : 'border-[#0D9488]/40 bg-white text-[#0F766E]'
                  }`}
                >
                  {isPlayingAudio ? (
                    <Square className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>
                    {isPlayingAudio
                      ? language === 'th'
                        ? 'หยุดฟัง'
                        : 'Stop'
                      : language === 'th'
                        ? 'ฟังเสียง'
                        : 'Play'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleClearRecording}
                  className="inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-[#EF4444]/40 px-2.5 py-2 text-xs font-bold text-[#DC2626] dark:text-[#FCA5A5] cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{language === 'th' ? 'ล้าง' : 'Clear'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {(!micSupported || recorderError) && (
          <div className="flex items-start gap-2 rounded-xl border border-[#F59E0B]/45 bg-[#FFFBEB] px-3 py-2 text-xs font-semibold text-[#92400E] dark:bg-[#2A2013] dark:text-[#FDE68A]">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              {recorderError === 'permission_denied'
                ? language === 'th'
                  ? 'ไม่ได้รับอนุญาตใช้ไมโครโฟน — ไม่เป็นไร! ใช้การพิมพ์คำตอบด้านบนและแบบประเมินตนเองเพื่อผ่านภารกิจได้ทันที'
                  : 'Microphone permission was denied. No problem — your typed response above works as a complete alternative!'
                : recorderError === 'not_found'
                  ? language === 'th'
                    ? 'ไม่พบอุปกรณ์ไมโครโฟน — ใช้คำตอบแบบเขียนด้านบนได้ทันที'
                    : 'No microphone device found — please use the written response above.'
                  : language === 'th'
                    ? 'เบราว์เซอร์นี้ไม่รองรับการอัดเสียงไมโครโฟน — ใช้คำตอบแบบเขียนด้านบนแทนได้อย่างสมบูรณ์'
                    : 'Microphone recording is unavailable in this environment — the written response above is fully accepted.'}
            </span>
          </div>
        )}

        <p className="text-[11px] font-semibold opacity-85">
          {language === 'th' ? 'โหมดปัจจุบัน: ' : 'Delivery Mode: '}
          {practiceMode === 'recorded_mic' && recordedAudioUrl
            ? language === 'th'
              ? 'อัดเสียงประกอบคำตอบเรียบร้อย'
              : 'Voice rehearsal recorded + written summary'
            : language === 'th'
              ? 'ส่งด้วยข้อความ / ฝึกพูดโดยไม่ใช้ไมโครโฟน'
              : 'Written & self-rehearsal delivery'}
        </p>
      </div>

      {/* Transparent 5-Criterion Formative Rubric Feedback */}
      <div
        className={`rounded-2xl border p-3.5 space-y-2.5 ${
          isNight
            ? 'border-[#E7B43C]/35 bg-[#162340]'
            : 'border-[#FDE68A] bg-[#FFFBEB]'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-extrabold">
            {language === 'th'
              ? 'เกณฑ์สะท้อนผลเชิงสร้างสรรค์ (5 มิติ)'
              : 'Transparent Formative Feedback (5 Dimensions)'}
          </p>
          <span
            className={`rounded-lg px-2 py-0.5 text-[11px] font-extrabold ${
              assessment.readyToComplete
                ? 'bg-[#059669] text-white'
                : 'bg-[#D97706] text-white'
            }`}
          >
            {assessment.readyToComplete
              ? language === 'th'
                ? 'พร้อมส่งหลักฐาน'
                : 'Evidence Ready'
              : language === 'th'
                ? 'กำลังพัฒนา'
                : 'Needs Detail'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {assessment.criteria.map((c) => (
            <div
              key={c.criterionId}
              className={`rounded-xl border px-3 py-2 text-xs ${
                isNight
                  ? 'border-white/10 bg-[#0F1B33]'
                  : 'border-[#E2E8F0] bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold">
                  {RUBRIC_CRITERION_LABELS[c.criterionId][language]}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold ${
                    c.level === 'strong'
                      ? 'bg-[#059669]/15 text-[#059669] dark:text-[#34D399]'
                      : c.level === 'developing'
                        ? 'bg-[#D97706]/15 text-[#B45309] dark:text-[#FBBF24]'
                        : 'bg-[#DC2626]/15 text-[#DC2626] dark:text-[#FCA5A5]'
                  }`}
                >
                  {c.level === 'strong'
                    ? language === 'th'
                      ? 'ดีเยี่ยม'
                      : 'Strong'
                    : c.level === 'developing'
                      ? language === 'th'
                        ? 'พอใช้'
                        : 'Developing'
                      : language === 'th'
                        ? 'ควรเสริม'
                        : 'Revise'}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] opacity-85">
                {c.feedback[language]}
              </p>
            </div>
          ))}
        </div>

        {assessment.revisionSuggestions.length > 0 && (
          <ul className="space-y-1 text-xs text-[#B45309] dark:text-[#FDE68A]">
            {assessment.revisionSuggestions.map((sug, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{sug[language]}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="flex items-start gap-1.5 text-[11px] opacity-80">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{assessment.ruleBasedDisclaimer[language]}</span>
        </p>
      </div>

      {/* Self-Review Checklist */}
      <div
        className={`rounded-2xl border p-3.5 space-y-2 ${
          isNight
            ? 'border-white/12 bg-[#162340]'
            : 'border-[#E2E8F0] bg-white'
        }`}
      >
        <p className="text-xs font-extrabold">
          {language === 'th'
            ? 'ตรวจทานผลงานด้วยตนเอง (เลือกอย่างน้อย 2 ข้อก่อนส่ง)'
            : 'Self-Review Checklist (Confirm at least 2 items before submitting)'}
        </p>
        <div className="space-y-1.5">
          {SELF_REVIEW_OPTIONS.map((item) => {
            const checked = selfReviewChecks.includes(item.id);
            return (
              <label
                key={item.id}
                className={`flex items-start gap-2.5 rounded-xl border px-3 py-2 text-xs cursor-pointer ${
                  checked
                    ? isNight
                      ? 'border-[#12B8B0]/60 bg-[#102A33] text-[#E6FAF5]'
                      : 'border-[#0D9488]/45 bg-[#F0FDFA] text-[#0F766E]'
                    : isNight
                      ? 'border-white/10 bg-[#0F1B33] text-[#CBD5E1]'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#334155]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    onPlaySfx('select');
                    onToggleSelfReviewCheck(item.id);
                  }}
                  className="mt-0.5 h-4 w-4 accent-[#0D9488] cursor-pointer"
                />
                <span className="font-semibold">{item.label[language]}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Submit / Save Evidence CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <span className="text-xs font-semibold opacity-80">
          {alreadyCompleted
            ? language === 'th'
              ? 'สามารถปรับปรุงและบันทึกซ้ำได้โดยไม่ซ้ำรางวัล'
              : 'Revising updates your Performance Portfolio without duplicate rewards.'
            : language === 'th'
              ? 'บันทึกผลงานเข้าสู่ Performance Portfolio (+0 XP ในขั้นฝึกผลงาน)'
              : 'Saves directly to your Stage 4 Performance Portfolio.'}
        </span>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => {
            onPlaySfx('reward');
            onSubmit();
          }}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#E7B43C] px-5 py-2.5 font-display text-sm font-extrabold text-[#131E31] shadow-md hover:bg-[#F2C66D] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span>{submitLabel[language]}</span>
        </button>
      </div>
    </div>
  );
}
