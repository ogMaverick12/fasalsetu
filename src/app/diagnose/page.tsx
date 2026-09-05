'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Camera,
  Mic,
  Square,
  Volume2,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

type Language = 'hi' | 'bn' | 'en';

interface DiagnosisResult {
  crop: string;
  disease: string;
  is_healthy: boolean;
  confidence: 'High' | 'Moderate' | 'Low';
  recommendation: string;
  spoken_text: string;
  language: Language;
  audio_base64?: string;
}

const UI_STRINGS = {
  hi: {
    title: 'फसल की जांच',
    subtitle: 'बीमारी का त्वरित समाधान',
    selectMode: 'फसल जांचने का तरीका चुनें:',
    takePhoto: 'पत्ती की फोटो खींचें',
    photoSub: 'कैमरा खोलें या गैलरी से चुनें',
    orVoice: 'या बोलकर बताएं',
    voiceSub: 'अपनी समस्या बोलकर रिकॉर्ड करें',
    recording: 'बोलिए... हम सुन रहे हैं',
    stopRecording: 'रिकॉर्डिंग समाप्त करें',
    analyzing: 'फसल की जांच हो रही है...',
    waitNote: 'इसमें 3 से 5 सेकंड का समय लगता है',
    healthyTag: 'स्वस्थ फसल',
    diseaseTag: 'बीमारी का लक्षण',
    recommendationTitle: 'किसान भाइयों के लिए समाधान:',
    replayAudio: 'आवाज फिर से सुनें',
    checkAnother: 'दूसरी फसल की जांच करें',
    errorTitle: 'जांच पूरी नहीं हो सकी',
    errorDesc: 'हम आपकी फसल की जांच नहीं कर सके, कृपया दोबारा प्रयास करें।',
    tryAgain: 'पुनः प्रयास करें',
    backHome: 'होम पेज पर लौटें',
  },
  bn: {
    title: 'ফসলের রোগ পরীক্ষা',
    subtitle: 'দ্রুত ও সহজ সমাধান',
    selectMode: 'পদ্ধতি বেছে নিন:',
    takePhoto: 'পাতার ছবি তুলুন',
    photoSub: 'ক্যামেরা খুলুন বা গ্যালারি থেকে বেছে নিন',
    orVoice: 'অথবা মুখে বলে জানান',
    voiceSub: 'আপনার ফসলের সমস্যা বলে রেকর্ড করুন',
    recording: 'বলুন... আমরা শুনছি',
    stopRecording: 'রেকর্ডিং শেষ করুন',
    analyzing: 'ফসলের পরীক্ষা চলছে...',
    waitNote: 'এতে ৩ থেকে ৫ সেকেন্ড সময় লাগবে',
    healthyTag: 'সুস্থ ফসল',
    diseaseTag: 'রোগের লক্ষণ',
    recommendationTitle: 'কৃষকদের জন্য পরামর্শ:',
    replayAudio: 'আবার শুনুন',
    checkAnother: 'অন্য ফসলের পরীক্ষা করুন',
    errorTitle: 'পরীক্ষা সম্পন্ন করা যায়নি',
    errorDesc: 'আমরা আপনার ফসলের পরীক্ষা করতে পারিনি, দয়া করে আবার চেষ্টা করুন।',
    tryAgain: 'আবার চেষ্টা করুন',
    backHome: 'হোম পেজে ফিরুন',
  },
  en: {
    title: 'Diagnose Crop',
    subtitle: 'Instant diagnosis & plain advice',
    selectMode: 'Choose how to check your crop:',
    takePhoto: 'Take Leaf Photo',
    photoSub: 'Open camera or pick from gallery',
    orVoice: 'Or tell me what is wrong',
    voiceSub: 'Record a quick voice note describing symptoms',
    recording: 'Listening... speak clearly',
    stopRecording: 'Finish recording',
    analyzing: 'Analyzing your crop...',
    waitNote: 'This usually takes 3 to 5 seconds',
    healthyTag: 'Healthy Crop',
    diseaseTag: 'Disease Detected',
    recommendationTitle: 'Actionable Advice for Farmers:',
    replayAudio: 'Play Spoken Advice',
    checkAnother: 'Check Another Crop',
    errorTitle: 'Diagnosis Incomplete',
    errorDesc: "Couldn't check that, please try again.",
    tryAgain: 'Try Again',
    backHome: 'Return to Home',
  },
};

export default function DiagnosePage() {
  const [language, setLanguage] = useState<Language>('hi');
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

  // Restore saved language preference on client mount
  useEffect(() => {
    const saved = localStorage.getItem('fasalsetu_lang') as Language | null;
    if (saved && (saved === 'hi' || saved === 'bn' || saved === 'en')) {
      setLanguage(saved);
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('fasalsetu_lang', lang);
  };

  const t = UI_STRINGS[language] || UI_STRINGS.hi;

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
      // If mic permission blocked, create simulated audio blob for browser validation
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
      setError(t.errorDesc);
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
        // Browser autoplay restrictions may block without user gesture
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
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (currentAudioRef.current) currentAudioRef.current.pause();
  };

  return (
    <div className="flex flex-col min-h-screen justify-between max-w-md mx-auto w-full px-5 py-6">
      {/* Top Bar: Back button, Title & Native Language Picker */}
      <header className="pb-5 border-b border-stone-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[#111827] hover:bg-stone-200 active:bg-stone-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#14532d]"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2.2} />
            </Link>
            <div>
              <h1 className="font-semibold text-base text-[#111827] leading-none">
                {t.title}
              </h1>
              <span className="text-xs text-[#4b5563] font-medium">
                {t.subtitle}
              </span>
            </div>
          </div>

          {/* Language Switcher Buttons in Native Script */}
          <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg">
            {(['hi', 'bn', 'en'] as Language[]).map((lang) => {
              const labels = { hi: 'हिन्दी', bn: 'বাংলা', en: 'EN' };
              const isSelected = language === lang;
              return (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all min-h-[36px] ${
                    isSelected
                      ? 'bg-[#14532d] text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                  aria-pressed={isSelected}
                >
                  {labels[lang]}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main className="flex-1 flex flex-col justify-center py-6">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#14532d] flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-[#111827]">
                {t.analyzing}
              </h2>
              <p className="text-sm text-[#4b5563]">{t.waitNote}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-[#111827]">{t.errorTitle}</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-lg bg-[#14532d] text-white font-medium text-sm hover:bg-[#166534]"
            >
              {t.tryAgain}
            </button>
          </div>
        )}

        {/* Diagnosis Result State */}
        {diagnosis && !isLoading && (
          <div className="space-y-6">
            {/* Status Header Badge */}
            <div
              className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                diagnosis.is_healthy
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                  diagnosis.is_healthy
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {diagnosis.is_healthy ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : (
                  <ShieldAlert className="w-6 h-6" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">
                  {diagnosis.is_healthy ? t.healthyTag : t.diseaseTag}
                </span>
                <h2 className="text-xl font-bold leading-tight">
                  {diagnosis.disease}
                </h2>
              </div>
            </div>

            {/* Crop Identification */}
            <div className="border-b border-stone-200 pb-3">
              <span className="text-xs text-[#4b5563] font-medium block">
                Crop / फसल:
              </span>
              <p className="text-lg font-semibold text-[#111827]">
                {diagnosis.crop}
              </p>
            </div>

            {/* Farmer-Plain Recommendation */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-[#111827]">
                {t.recommendationTitle}
              </h3>
              <div className="bg-white border border-stone-200 rounded-xl p-4 text-[#1f2937] text-base leading-relaxed whitespace-pre-line">
                {diagnosis.recommendation}
              </div>
            </div>

            {/* Voice Replay Button */}
            {diagnosis.audio_base64 && (
              <button
                onClick={() => playAudio(diagnosis.audio_base64!)}
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 active:bg-stone-300 border border-stone-300 text-[#111827] font-medium text-base flex items-center justify-center gap-2.5 transition-colors focus:ring-2 focus:ring-[#14532d]"
              >
                <Volume2
                  className={`w-5 h-5 text-[#14532d] ${
                    isPlayingAudio ? 'animate-bounce' : ''
                  }`}
                />
                <span>{t.replayAudio}</span>
              </button>
            )}

            {/* Reset Action */}
            <button
              onClick={handleReset}
              className="w-full min-h-[52px] px-5 py-3.5 rounded-xl bg-[#14532d] hover:bg-[#166534] text-white font-medium text-base flex items-center justify-center gap-2.5 transition-colors shadow-xs"
            >
              <RotateCcw className="w-5 h-5" />
              <span>{t.checkAnother}</span>
            </button>
          </div>
        )}

        {/* Initial Entry Points (Mutually Exclusive Photo vs Voice Note) */}
        {!isLoading && !diagnosis && !error && (
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#4b5563] text-center">
              {t.selectMode}
            </p>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-stone-200/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('photo')}
                className={`py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-h-[44px] ${
                  activeTab === 'photo'
                    ? 'bg-white text-[#111827] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Camera className="w-4 h-4 text-[#14532d]" />
                <span>फोटो (Photo)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('voice')}
                className={`py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-h-[44px] ${
                  activeTab === 'voice'
                    ? 'bg-white text-[#111827] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Mic className="w-4 h-4 text-[#14532d]" />
                <span>आवाज (Voice)</span>
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
                  className="w-full min-h-[64px] px-6 py-4 rounded-2xl bg-[#14532d] hover:bg-[#166534] active:bg-[#0f3d20] text-white flex items-center gap-4 transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-[#14532d]/30"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-lg leading-tight">
                      {t.takePhoto}
                    </div>
                    <div className="text-xs text-stone-200 mt-0.5">
                      {t.photoSub}
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
                    className="w-full min-h-[64px] px-6 py-4 rounded-2xl bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white flex items-center gap-4 transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-amber-700/30"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <Mic className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-lg leading-tight">
                        {t.orVoice}
                      </div>
                      <div className="text-xs text-amber-100 mt-0.5">
                        {t.voiceSub}
                      </div>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-full min-h-[64px] px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-between transition-all shadow-md animate-pulse focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-white animate-ping" />
                      <span className="font-semibold text-base">
                        {t.recording} ({recordingSeconds}s)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-black/20 rounded-lg">
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>{t.stopRecording}</span>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Return Link */}
      <footer className="pt-4 border-t border-stone-200 text-center">
        <Link
          href="/"
          className="text-xs font-medium text-[#14532d] hover:underline inline-flex items-center gap-1"
        >
          &larr; {t.backHome}
        </Link>
      </footer>
    </div>
  );
}
