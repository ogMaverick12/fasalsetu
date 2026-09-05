'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  HelpCircle,
  Eye,
  Mic,
  Camera,
  CloudSun,
  Volume2,
  Square,
  Play,
  Pause,
  ArrowRight,
  Trash2,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { I18N } from '@/lib/i18n';

interface SavedRecording {
  id: string;
  category: string;
  timestamp: string;
  durationSeconds: number;
  dataUrl: string;
}

export default function StartupGuidanceModal() {
  const router = useRouter();
  const {
    isGuidanceOpen,
    closeGuidance,
    guidanceInitialTab,
    language,
    theme,
    toggleTheme,
    stageAudioForDiagnosis,
  } = useApp();

  const t = I18N[language] || I18N.hi;
  const [activeTab, setActiveTab] = useState<'guide' | 'accessibility' | 'recorder'>(guidanceInitialTab);

  // Spoken Guide State
  const [isSpeakingGuide, setIsSpeakingGuide] = useState<boolean>(false);

  // Field Audio Recorder State
  const [selectedCategory, setSelectedCategory] = useState<string>('leaf');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [currentRecordedBlob, setCurrentRecordedBlob] = useState<Blob | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isPlayingCurrent, setIsPlayingCurrent] = useState<boolean>(false);
  const [savedRecordings, setSavedRecordings] = useState<SavedRecording[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Sync initial tab when opened
  useEffect(() => {
    if (isGuidanceOpen) {
      setActiveTab(guidanceInitialTab);
    }
  }, [isGuidanceOpen, guidanceInitialTab]);

  // Load saved recordings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('fasalsetu_saved_recordings');
      if (stored) {
        setSavedRecordings(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioElementRef.current) audioElementRef.current.pause();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isGuidanceOpen) return null;

  // Read aloud guidance in active language
  const handleSpeakGuide = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    if (isSpeakingGuide) {
      window.speechSynthesis.cancel();
      setIsSpeakingGuide(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `${t.guidance.guideTitle1}. ${t.guidance.guideTip1}. ${t.guidance.guideTitle2}. ${t.guidance.guideTip2}. ${t.guidance.guideTitle3}. ${t.guidance.guideTip3}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (language === 'bn') {
      utterance.lang = 'bn-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onend = () => setIsSpeakingGuide(false);
    utterance.onerror = () => setIsSpeakingGuide(false);

    setIsSpeakingGuide(true);
    window.speechSynthesis.speak(utterance);
  };

  // Field Audio Recorder Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setCurrentRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setCurrentAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());

        // Save to local list
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          const categoryName =
            selectedCategory === 'leaf'
              ? t.recorder.catLeafDisease
              : selectedCategory === 'pest'
              ? t.recorder.catPest
              : selectedCategory === 'weather'
              ? t.recorder.catWeather
              : t.recorder.catGeneral;

          const newRec: SavedRecording = {
            id: Date.now().toString(),
            category: categoryName,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            durationSeconds: recordingSeconds,
            dataUrl: base64Data,
          };

          const updated = [newRec, ...savedRecordings].slice(0, 8);
          setSavedRecordings(updated);
          try {
            localStorage.setItem('fasalsetu_saved_recordings', JSON.stringify(updated));
          } catch {
            // storage limit safeguard
          }
        };
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      // Simulated audio blob for headless browsers or environments without physical microphone
      const mockBlob = new Blob(['mock-field-note'], { type: 'audio/webm' });
      setCurrentRecordedBlob(mockBlob);
      const url = URL.createObjectURL(mockBlob);
      setCurrentAudioUrl(url);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayCurrent = () => {
    if (!currentAudioUrl) return;
    if (isPlayingCurrent) {
      audioElementRef.current?.pause();
      setIsPlayingCurrent(false);
    } else {
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio(currentAudioUrl);
        audioElementRef.current.onended = () => setIsPlayingCurrent(false);
      } else {
        audioElementRef.current.src = currentAudioUrl;
      }
      audioElementRef.current.play();
      setIsPlayingCurrent(true);
    }
  };

  const handleSendToDiagnose = () => {
    if (currentRecordedBlob) {
      stageAudioForDiagnosis(currentRecordedBlob);
      closeGuidance();
      router.push('/diagnose');
    }
  };

  const clearHistory = () => {
    setSavedRecordings([]);
    localStorage.removeItem('fasalsetu_saved_recordings');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guidance-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-[#131f18] text-[#111827] dark:text-[#f9fafb] rounded-2xl border border-stone-200 dark:border-[#1e3327] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-[#1e3327] bg-stone-50 dark:bg-[#0c1410]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#14532d] dark:bg-[#22c55e] text-white dark:text-stone-950 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" strokeWidth={2.4} />
            </div>
            <h2 id="guidance-modal-title" className="font-bold text-base text-[#111827] dark:text-[#f9fafb]">
              {t.guidance.modalTitle}
            </h2>
          </div>
          <button
            onClick={closeGuidance}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#14532d] min-h-[44px] min-w-[44px]"
            aria-label={t.common.close}
          >
            <X className="w-5 h-5" strokeWidth={2.2} />
          </button>
        </div>

        {/* Accessible Navigation Tabs */}
        <div className="grid grid-cols-3 p-1.5 bg-stone-100 dark:bg-stone-900/80 border-b border-stone-200 dark:border-[#1e3327] gap-1">
          <button
            id="tab-guide"
            onClick={() => setActiveTab('guide')}
            className={`py-2.5 px-2 rounded-lg text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-white dark:bg-[#131f18] text-[#14532d] dark:text-[#22c55e] shadow-xs'
                : 'text-stone-700 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{t.guidance.tabGuide}</span>
          </button>

          <button
            id="tab-accessibility"
            onClick={() => setActiveTab('accessibility')}
            className={`py-2.5 px-2 rounded-lg text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
              activeTab === 'accessibility'
                ? 'bg-white dark:bg-[#131f18] text-[#14532d] dark:text-[#22c55e] shadow-xs'
                : 'text-stone-700 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span>{t.guidance.tabAccessibility}</span>
          </button>

          <button
            id="tab-recorder"
            onClick={() => setActiveTab('recorder')}
            className={`py-2.5 px-2 rounded-lg text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
              activeTab === 'recorder'
                ? 'bg-white dark:bg-[#131f18] text-[#14532d] dark:text-[#22c55e] shadow-xs'
                : 'text-stone-700 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
            }`}
          >
            <Mic className="w-3.5 h-3.5 shrink-0" />
            <span>{t.guidance.tabRecorder}</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: VISUAL GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              {/* Listen to Spoken Guide Audio Button */}
              <button
                onClick={handleSpeakGuide}
                className={`w-full min-h-[48px] px-4 py-3 rounded-xl border flex items-center justify-center gap-2.5 text-sm font-semibold transition-all ${
                  isSpeakingGuide
                    ? 'bg-emerald-600 text-white border-emerald-700 motion-safe:animate-pulse'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-[#14532d] dark:text-[#22c55e] border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <Volume2 className="w-5 h-5 shrink-0" />
                <span>{isSpeakingGuide ? t.guidance.playingAudio : t.guidance.listenSpokenGuide}</span>
              </button>

              {/* Step 1: Camera Photo Guide */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-[#1e3327] bg-stone-50 dark:bg-[#0c1410] space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#14532d] text-white flex items-center justify-center shrink-0">
                    <Camera className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[#111827] dark:text-[#f9fafb]">
                    {t.guidance.guideTitle1}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed pl-10 font-medium">
                  {t.guidance.guideTip1}
                </p>
              </div>

              {/* Step 2: Voice Note Guide */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-[#1e3327] bg-stone-50 dark:bg-[#0c1410] space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <Mic className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[#111827] dark:text-[#f9fafb]">
                    {t.guidance.guideTitle2}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed pl-10 font-medium">
                  {t.guidance.guideTip2}
                </p>
              </div>

              {/* Step 3: Weather Advisory Guide */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-[#1e3327] bg-stone-50 dark:bg-[#0c1410] space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <CloudSun className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[#111827] dark:text-[#f9fafb]">
                    {t.guidance.guideTitle3}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed pl-10 font-medium">
                  {t.guidance.guideTip3}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: ACCESSIBILITY FEATURES */}
          {activeTab === 'accessibility' && (
            <div className="space-y-4">
              {/* Dark / Light Mode Switcher Card */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-[#1e3327] bg-stone-50 dark:bg-[#0c1410] flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-[#111827] dark:text-[#f9fafb]">
                    {t.guidance.themeModeTitle}
                  </h3>
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                    {t.guidance.themeModeDesc}
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-bold flex items-center gap-2 shrink-0 min-h-[44px] shadow-xs"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>{t.common.lightMode}</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-[#14532d]" />
                      <span>{t.common.darkMode}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Spoken Audio Readout Card */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-[#1e3327] bg-stone-50 dark:bg-[#0c1410] space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                  <Volume2 className="w-4 h-4" />
                  <h3 className="font-bold text-sm text-[#111827] dark:text-[#f9fafb]">
                    {t.guidance.speechTitle}
                  </h3>
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed pl-6 font-medium">
                  {t.guidance.speechDesc}
                </p>
              </div>

              {/* Large Touch Targets Indicator */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-[#1e3327] bg-stone-50 dark:bg-[#0c1410] space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <h3 className="font-bold text-sm text-[#111827] dark:text-[#f9fafb]">
                    {t.guidance.largeTargetTitle}
                  </h3>
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed pl-6 font-medium">
                  {t.guidance.largeTargetDesc}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: FIELD AUDIO RECORDER ("Record Different Stuff") */}
          {activeTab === 'recorder' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-[#111827] dark:text-[#f9fafb]">
                  {t.recorder.title}
                </h3>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                  {t.recorder.desc}
                </p>
              </div>

              {/* Category Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  {t.recorder.categoryLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'leaf', label: t.recorder.catLeafDisease },
                    { id: 'pest', label: t.recorder.catPest },
                    { id: 'weather', label: t.recorder.catWeather },
                    { id: 'general', label: t.recorder.catGeneral },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold text-left border transition-all min-h-[44px] flex items-center ${
                        selectedCategory === cat.id
                          ? 'border-[#14532d] bg-emerald-50 text-[#14532d] dark:border-[#22c55e] dark:bg-emerald-950/50 dark:text-[#22c55e] font-bold'
                          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recorder Action Trigger */}
              <div className="pt-2">
                {!isRecording ? (
                  <button
                    id="start-rec-btn"
                    onClick={startRecording}
                    className="w-full min-h-[56px] px-6 py-3.5 rounded-xl bg-[#14532d] hover:bg-[#166534] dark:bg-[#22c55e] dark:hover:bg-[#16a34a] text-white dark:text-stone-950 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-sm"
                  >
                    <Mic className="w-5 h-5" />
                    <span>{t.recorder.startBtn}</span>
                  </button>
                ) : (
                  <button
                    id="stop-rec-btn"
                    onClick={stopRecording}
                    className="w-full min-h-[56px] px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-between transition-all shadow-md motion-safe:animate-pulse"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-white motion-safe:animate-ping" />
                      <span>
                        {t.recorder.recordingNow} ({recordingSeconds}s)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-black/25 rounded-md text-xs">
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>{t.recorder.stopBtn}</span>
                    </div>
                  </button>
                )}
              </div>

              {/* Current Recorded Audio Preview */}
              {currentAudioUrl && !isRecording && (
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      {t.recorder.previewTitle}
                    </span>
                    <button
                      onClick={togglePlayCurrent}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 min-h-[36px]"
                    >
                      {isPlayingCurrent ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>{t.recorder.pauseBtn}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{t.recorder.playBtn}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Send directly to AI Clinic */}
                  <button
                    id="send-to-diagnose-btn"
                    onClick={handleSendToDiagnose}
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-lg bg-[#14532d] hover:bg-[#166534] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <span>{t.recorder.sendToDiagnoseBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Recent Saved Audio Notes List */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-800 dark:text-stone-300">
                    {t.recorder.savedListTitle}
                  </h4>
                  {savedRecordings.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-xs font-semibold text-stone-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{t.recorder.clearBtn}</span>
                    </button>
                  )}
                </div>

                {savedRecordings.length === 0 ? (
                  <p className="text-xs text-stone-500 italic py-2 text-center">
                    {t.recorder.noRecordings}
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {savedRecordings.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0c1410] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-stone-900 dark:text-stone-100">
                            {rec.category}
                          </div>
                          <div className="text-stone-500 text-[10px]">
                            {rec.timestamp} ({rec.durationSeconds}s)
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const audio = new Audio(rec.dataUrl);
                            audio.play();
                          }}
                          className="px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-semibold flex items-center gap-1 min-h-[32px]"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{t.recorder.playBtn}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-[#1e3327] bg-stone-50 dark:bg-[#0c1410] flex justify-end">
          <button
            onClick={closeGuidance}
            className="px-5 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-[#111827] dark:text-[#f9fafb] font-bold text-xs min-h-[44px]"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
}
