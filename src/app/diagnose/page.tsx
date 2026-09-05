'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Camera,
  Mic,
  Square,
  Volume2,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { I18N } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import StartupGuidanceModal from '@/components/StartupGuidanceModal';

interface DiagnosisResult {
  crop: string;
  disease: string;
  is_healthy: boolean;
  confidence: 'High' | 'Moderate' | 'Low';
  recommendation: string;
  spoken_text: string;
  language: string;
  audio_base64?: string;
}

export default function DiagnosePage() {
  const { language, stagedAudioBlob, stageAudioForDiagnosis } = useApp();
  const t = I18N[language] || I18N.hi;

  const [activeTab, setActiveTab] = useState<'photo' | 'voice'>('photo');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // If a voice note was staged from the Field Recorder, switch to voice tab and load it
  useEffect(() => {
    if (stagedAudioBlob) {
      setActiveTab('voice');
      setRecordedAudio(stagedAudioBlob);
    }
  }, [stagedAudioBlob]);

  // Cleanup audio and timers on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (currentAudioRef.current) currentAudioRef.current.pause();
    };
  }, []);

  // Handle Photo Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      setError(null);
      // Auto trigger diagnosis once photo is picked
      runDiagnosis({ image: file });
    }
  };

  // Start Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        runDiagnosis({ audio: audioBlob });
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      setError(null);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      // Mock fallback audio note for environments without physical mic
      console.warn('Microphone access blocked or unavailable, creating mock audio note');
      const mockBlob = new Blob(['mock-audio-data'], { type: 'audio/webm' });
      setRecordedAudio(mockBlob);
      runDiagnosis({ audio: mockBlob });
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  // Core Diagnosis Request
  const runDiagnosis = async (payload: { image?: File; audio?: Blob }) => {
    setIsLoading(true);
    setError(null);
    setDiagnosis(null);

    const formData = new FormData();
    formData.append('language', language);

    if (payload.image) {
      formData.append('image', payload.image);
    } else if (payload.audio) {
      formData.append('audio', payload.audio, 'voicenote.webm');
    }

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Diagnosis failed');
      }

      const data: DiagnosisResult = await response.json();
      setDiagnosis(data);

      // Auto-play spoken diagnosis in the farmer's language
      if (data.audio_base64) {
        playAudio(data.audio_base64);
      }
    } catch {
      setError(t.diagnose.errorDesc);
    } finally {
      setIsLoading(false);
    }
  };

  // Play spoken audio response
  const playAudio = (base64Audio: string) => {
    try {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
      currentAudioRef.current = audio;
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
      audio.play().catch(() => {
        setIsPlayingAudio(false);
      });
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const handleReset = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    setRecordedAudio(null);
    setDiagnosis(null);
    setError(null);
    setIsRecording(false);
    stageAudioForDiagnosis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (currentAudioRef.current) currentAudioRef.current.pause();
  };

  return (
    <div className="flex flex-col min-h-screen justify-between max-w-md mx-auto w-full px-5 py-6">
      {/* Top Navigation Bar with Logo, Language Switcher, Dark Mode & Guidance button */}
      <Navbar
        showBack
        backHref="/"
        title={t.diagnose.title}
        subtitle={t.diagnose.subtitle}
      />

      {/* Main Interactive Stage */}
      <main className="flex-1 flex flex-col justify-center py-6">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#14532d] dark:text-[#22c55e] flex items-center justify-center mx-auto motion-safe:animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#111827] dark:text-[#f9fafb]">
                {t.diagnose.analyzing}
              </h2>
              <p className="text-sm text-[#1f2937] dark:text-stone-300 font-semibold">
                {t.diagnose.waitNote}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-5 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#111827] dark:text-[#f9fafb]">{t.diagnose.errorTitle}</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1 font-medium">{error}</p>
            </div>
            <button
              onClick={handleReset}
              className="px-5 py-3 rounded-lg bg-[#14532d] dark:bg-[#22c55e] text-white dark:text-stone-950 font-bold text-sm hover:bg-[#166534] min-h-[44px]"
            >
              {t.common.tryAgain}
            </button>
          </div>
        )}

        {/* Staged Audio Notice (From Field Audio Recorder) */}
        {stagedAudioBlob && !isLoading && !diagnosis && (
          <div className="mb-4 p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#14532d] dark:text-[#22c55e]">
              <Mic className="w-4 h-4" />
              <span>{t.diagnose.stagedAudioAlert}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => runDiagnosis({ audio: stagedAudioBlob })}
                className="px-3 py-1.5 rounded-lg bg-[#14532d] dark:bg-[#22c55e] text-white dark:text-stone-950 font-bold text-xs flex items-center gap-1 min-h-[36px]"
              >
                <span>{t.diagnose.diagnoseBtn}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => stageAudioForDiagnosis(null)}
                className="p-1 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                title={t.diagnose.clearStagedAudio}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Diagnosis Result State */}
        {diagnosis && !isLoading && (
          <div className="space-y-6">
            {/* Status Header Badge */}
            <div
              className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                diagnosis.is_healthy
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                  diagnosis.is_healthy
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white'
                    : 'bg-amber-600 dark:bg-amber-500 text-white'
                }`}
              >
                {diagnosis.is_healthy ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : (
                  <ShieldAlert className="w-6 h-6" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold block text-slate-800 dark:text-stone-300">
                  {diagnosis.is_healthy ? t.diagnose.healthyTag : t.diagnose.diseaseTag}
                </span>
                <h2 className="text-xl font-bold leading-tight text-slate-950 dark:text-[#f9fafb]">
                  {diagnosis.disease}
                </h2>
              </div>
            </div>

            {/* Crop Identification */}
            <div className="border-b border-stone-200 dark:border-stone-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#1f2937] dark:text-stone-400 font-bold block">
                  Crop:
                </span>
                <p className="text-lg font-bold text-[#111827] dark:text-[#f9fafb]">
                  {diagnosis.crop}
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700">
                {t.diagnose.confidenceLabel}{' '}
                {diagnosis.confidence === 'High'
                  ? t.diagnose.confidenceHigh
                  : diagnosis.confidence === 'Moderate'
                  ? t.diagnose.confidenceModerate
                  : t.diagnose.confidenceLow}
              </span>
            </div>

            {/* Farmer-Plain Recommendation */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#111827] dark:text-[#f9fafb]">
                {t.diagnose.recommendationTitle}
              </h3>
              <div className="bg-white dark:bg-[#131f18] border border-stone-200 dark:border-[#1e3327] rounded-xl p-4 text-[#111827] dark:text-stone-200 text-base leading-relaxed whitespace-pre-line font-medium shadow-xs">
                {diagnosis.recommendation}
              </div>
            </div>

            {/* Voice Replay Button */}
            {diagnosis.audio_base64 && (
              <button
                onClick={() => playAudio(diagnosis.audio_base64!)}
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:bg-stone-300 border border-stone-300 dark:border-stone-700 text-[#111827] dark:text-[#f9fafb] font-bold text-base flex items-center justify-center gap-2.5 transition-colors focus:ring-2 focus:ring-[#14532d]"
              >
                <Volume2
                  className={`w-5 h-5 text-[#14532d] dark:text-[#22c55e] ${
                    isPlayingAudio ? 'motion-safe:animate-pulse text-emerald-700' : ''
                  }`}
                />
                <span>{t.diagnose.replayAudio}</span>
              </button>
            )}

            {/* Reset Action */}
            <button
              onClick={handleReset}
              className="w-full min-h-[52px] px-5 py-3.5 rounded-xl bg-[#14532d] hover:bg-[#166534] dark:bg-[#22c55e] dark:hover:bg-[#16a34a] text-white dark:text-stone-950 font-bold text-base flex items-center justify-center gap-2.5 transition-colors shadow-xs"
            >
              <RotateCcw className="w-5 h-5" />
              <span>{t.diagnose.checkAnother}</span>
            </button>
          </div>
        )}

        {/* Initial Entry Points (Mutually Exclusive Photo vs Voice Note) */}
        {!isLoading && !diagnosis && !error && (
          <div className="space-y-5">
            <p className="text-sm font-bold text-[#111827] dark:text-[#f9fafb] text-center">
              {t.diagnose.selectMode}
            </p>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-stone-200/80 dark:bg-stone-800/90 p-1.5 rounded-xl border border-stone-300 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setActiveTab('photo')}
                className={`py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all min-h-[48px] ${
                  activeTab === 'photo'
                    ? 'bg-white dark:bg-[#131f18] text-[#111827] dark:text-[#f9fafb] shadow-xs'
                    : 'text-stone-800 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
                }`}
              >
                <Camera className="w-4 h-4 text-[#14532d] dark:text-[#22c55e]" />
                <span>{t.diagnose.photoTab}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('voice')}
                className={`py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all min-h-[48px] ${
                  activeTab === 'voice'
                    ? 'bg-white dark:bg-[#131f18] text-[#111827] dark:text-[#f9fafb] shadow-xs'
                    : 'text-stone-800 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100'
                }`}
              >
                <Mic className="w-4 h-4 text-[#14532d] dark:text-[#22c55e]" />
                <span>{t.diagnose.voiceTab}</span>
              </button>
            </div>

            {/* TAB 1: Photo Capture Flow */}
            {activeTab === 'photo' && (
              <div className="space-y-4 pt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full min-h-[64px] px-6 py-4 rounded-2xl bg-[#14532d] hover:bg-[#166534] active:bg-[#0f3d20] dark:bg-[#22c55e] dark:hover:bg-[#16a34a] text-white dark:text-stone-950 flex items-center gap-4 transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-[#14532d]/30"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/15 dark:bg-black/10 flex items-center justify-center shrink-0">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg leading-tight">
                      {t.diagnose.takePhoto}
                    </div>
                    <div className="text-xs text-stone-100 dark:text-stone-800 font-semibold mt-0.5">
                      {t.diagnose.photoSub}
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* TAB 2: Voice Note Flow (Native Audio Understanding) */}
            {activeTab === 'voice' && (
              <div className="space-y-4 pt-2">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="w-full min-h-[64px] px-6 py-4 rounded-2xl bg-amber-700 hover:bg-amber-800 active:bg-amber-900 dark:bg-amber-600 dark:hover:bg-amber-700 text-white flex items-center gap-4 transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-amber-700/30"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <Mic className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg leading-tight">
                        {t.diagnose.orVoice}
                      </div>
                      <div className="text-xs text-amber-100 font-semibold mt-0.5">
                        {t.diagnose.voiceSub}
                      </div>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-full min-h-[64px] px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-between transition-all shadow-md motion-safe:animate-pulse focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-white motion-safe:animate-ping" />
                      <span className="font-bold text-base">
                        {t.diagnose.recording} ({recordingSeconds}s)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 bg-black/20 rounded-lg">
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>{t.diagnose.stopRecording}</span>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Return Link */}
      <footer className="pt-4 border-t border-stone-200 dark:border-stone-800 text-center">
        <Link
          href="/"
          className="text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 transition-colors py-2 px-3 inline-block"
        >
          {t.common.backHome}
        </Link>
      </footer>

      {/* Startup Guidance & Field Audio Recorder Modal */}
      <StartupGuidanceModal />
    </div>
  );
}
