'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  Volume2,
  RotateCcw,
  AlertCircle,
  Sparkles,
  MapPin,
  Sprout,
} from 'lucide-react';
import { INDIAN_STATES, CROPS_LIST } from '@/lib/geo-india';
import type { WeatherSnapshot } from '@/lib/weather';

type Language = 'hi' | 'bn' | 'en';

interface AdvisoryResult {
  state: string;
  district: string;
  crop: string;
  weather_snapshot: WeatherSnapshot;
  advisory_text: string;
  spoken_text: string;
  language: Language;
  audio_base64?: string;
}

const UI_STRINGS = {
  hi: {
    title: 'मौसम व फसल सलाह',
    subtitle: 'आपके जिले का सटीक पूर्वानुमान',
    selectState: 'अपना राज्य चुनें',
    selectDistrict: 'अपना जिला चुनें',
    selectCrop: 'फसल चुनें',
    step1Title: 'कदम 1: राज्य चुनें',
    step2Title: 'कदम 2: जिला चुनें',
    step3Title: 'कदम 3: फसल चुनें',
    nextBtn: 'आगे बढ़ें',
    changeBtn: 'बदलें',
    getAdvisory: 'मौसम व कृषि सलाह पाएं',
    loading: 'मौसम की जानकारी और सलाह तैयार हो रही है...',
    waitNote: 'इसमें 3 से 5 सेकंड का समय लगता है',
    weatherHeader: 'वर्तमान मौसम स्थिति:',
    temp: 'तापमान',
    humidity: 'हवा में नमी',
    rainRisk: 'बारिश की संभावना',
    wind: 'हवा की गति',
    advisoryHeader: 'किसान भाइयों के लिए समयोचित सलाह:',
    replayAudio: 'आवाज फिर से सुनें',
    checkAnother: 'दूसरे जिले या फसल की सलाह देखें',
    errorTitle: 'सलाह प्राप्त नहीं हो सकी',
    errorDesc: 'मौसम की जानकारी प्राप्त करने में असमर्थ रहे, कृपया दोबारा प्रयास करें।',
    tryAgain: 'पुनः प्रयास करें',
    backHome: 'होम पेज पर लौटें',
  },
  bn: {
    title: 'আবহাওয়া ও কৃষি পরামর্শ',
    subtitle: 'আপনার জেলার আবহাওয়া-ভিত্তিক পরামর্শ',
    selectState: 'রাজ্য নির্বাচন করুন',
    selectDistrict: 'জেলা নির্বাচন করুন',
    selectCrop: 'ফসল নির্বাচন করুন',
    step1Title: 'ধাপ ১: রাজ্য নির্বাচন',
    step2Title: 'ধাপ ২: জেলা নির্বাচন',
    step3Title: 'ধাপ ৩: ফসল নির্বাচন',
    nextBtn: 'পরবর্তী ধাপ',
    changeBtn: 'পরিবর্তন',
    getAdvisory: 'পরামর্শ দেখুন',
    loading: 'আবহাওয়া তথ্য ও পরামর্শ তৈরি হচ্ছে...',
    waitNote: 'এতে ৩ থেকে ৫ সেকেন্ড সময় লাগবে',
    weatherHeader: 'বর্তমান আবহাওয়া:',
    temp: 'তাপমাত্রা',
    humidity: 'আর্দ্রতা',
    rainRisk: 'বৃষ্টির সম্ভাবনা',
    wind: 'বাতাসের গতি',
    advisoryHeader: 'কৃষকদের জন্য প্রয়োজনীয় পরামর্শ:',
    replayAudio: 'আবার শুনুন',
    checkAnother: 'অন্য জেলা বা ফসলের পরামর্শ দেখুন',
    errorTitle: 'পরামর্শ পাওয়া যায়নি',
    errorDesc: 'আবহাওয়ার তথ্য পেতে সমস্যা হয়েছে, দয়া করে আবার চেষ্টা করুন।',
    tryAgain: 'আবার চেষ্টা করুন',
    backHome: 'হোম পেজে ফিরুন',
  },
  en: {
    title: 'Crop & Weather Advisory',
    subtitle: 'Hyperlocal forecast & farm advisory',
    selectState: 'Select State',
    selectDistrict: 'Select District',
    selectCrop: 'Select Crop',
    step1Title: 'Step 1: Select State',
    step2Title: 'Step 2: Select District',
    step3Title: 'Step 3: Select Crop',
    nextBtn: 'Continue',
    changeBtn: 'Change',
    getAdvisory: 'Get Farm Advisory',
    loading: 'Fetching weather and generating advisory...',
    waitNote: 'This usually takes 3 to 5 seconds',
    weatherHeader: 'Hyperlocal Weather Conditions:',
    temp: 'Temperature',
    humidity: 'Humidity',
    rainRisk: 'Rain Probability',
    wind: 'Wind Speed',
    advisoryHeader: 'Actionable Advice for Farmers:',
    replayAudio: 'Play Spoken Advice',
    checkAnother: 'Check Another District / Crop',
    errorTitle: 'Advisory Incomplete',
    errorDesc: "Couldn't fetch weather advisory, please try again.",
    tryAgain: 'Try Again',
    backHome: 'Return to Home',
  },
};

export default function AdvisoryPage() {
  const [language, setLanguage] = useState<Language>('hi');
  const [formStep, setFormStep] = useState<'state' | 'district' | 'crop'>('state');
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Nashik');
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advisory, setAdvisory] = useState<AdvisoryResult | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Restore saved language preference
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

  // Available districts based on selected state
  const currentStateObj = INDIAN_STATES.find(
    (s) => s.name === selectedState || s.name_hi === selectedState || s.name_bn === selectedState
  ) || INDIAN_STATES[0];

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const matchedState = INDIAN_STATES.find((s) => s.name === stateName);
    if (matchedState && matchedState.districts.length > 0) {
      setSelectedDistrict(matchedState.districts[0].name);
    }
  };

  // Play audio
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

  // Fetch Advisory
  const fetchAdvisory = async () => {
    setIsLoading(true);
    setError(null);
    setAdvisory(null);

    try {
      const response = await fetch('/api/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: selectedState,
          district: selectedDistrict,
          crop_type: selectedCrop,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch advisory');
      }

      const data: AdvisoryResult = await response.json();
      setAdvisory(data);

      if (data.audio_base64) {
        playAudio(data.audio_base64);
      }
    } catch {
      setError(t.errorDesc);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAdvisory(null);
    setError(null);
    setFormStep('state');
    if (currentAudioRef.current) currentAudioRef.current.pause();
  };

  return (
    <div className="flex flex-col min-h-screen justify-between max-w-md mx-auto w-full px-5 py-6">
      {/* Top Header with Back Button and Language Switcher */}
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
              <span className="text-xs text-[#1f2937] font-semibold">
                {t.subtitle}
              </span>
            </div>
          </div>

          {/* Native Script Language Switcher with >=44px touch targets & >=8px gap */}
          <div className="flex items-center gap-2">
            {(['hi', 'bn', 'en'] as Language[]).map((lang) => {
              const labels = { hi: 'हिन्दी', bn: 'বাংলা', en: 'EN' };
              const isSelected = language === lang;
              return (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all min-h-[44px] min-w-[48px] flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#14532d] text-white shadow-xs'
                      : 'bg-stone-200 text-stone-900 hover:bg-stone-300'
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center py-6">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#14532d] flex items-center justify-center mx-auto motion-safe:animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-[#111827]">
                {t.loading}
              </h2>
              <p className="text-sm text-[#1f2937] font-medium">{t.waitNote}</p>
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
              <p className="text-sm text-red-700 mt-1 font-medium">{error}</p>
            </div>
            <button
              onClick={handleReset}
              className="px-5 py-3 rounded-lg bg-[#14532d] text-white font-semibold text-sm hover:bg-[#166534] min-h-[44px]"
            >
              {t.tryAgain}
            </button>
          </div>
        )}

        {/* Advisory Result State */}
        {advisory && !isLoading && (
          <div className="space-y-5">
            {/* Location & Crop Banner */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-900">
                <MapPin className="w-5 h-5 text-[#14532d]" />
                <div>
                  <div className="font-bold text-base leading-tight">
                    {advisory.district}, {advisory.state}
                  </div>
                  <div className="text-xs text-[#1f2937] font-semibold flex items-center gap-1 mt-0.5">
                    <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{advisory.crop}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-stone-100 text-stone-800 rounded-md">
                Open-Meteo
              </span>
            </div>

            {/* Hyperlocal Weather Metrics Grid */}
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950">
                  {t.weatherHeader}
                </span>
                <span className="text-xs text-emerald-900 font-semibold">
                  {advisory.weather_snapshot.weather_description}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-emerald-950">
                <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-100 flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="text-xs text-stone-700 font-semibold leading-none">{t.temp}</div>
                    <div className="text-sm font-bold text-stone-950 mt-0.5">
                      {advisory.weather_snapshot.temperature_c}°C
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-100 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-xs text-stone-700 font-semibold leading-none">{t.humidity}</div>
                    <div className="text-sm font-bold text-stone-950 mt-0.5">
                      {advisory.weather_snapshot.humidity_percent}%
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-100 flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <div className="text-xs text-stone-700 font-semibold leading-none">{t.rainRisk}</div>
                    <div className="text-sm font-bold text-stone-950 mt-0.5">
                      {advisory.weather_snapshot.rain_probability_max}%
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-100 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-teal-600 shrink-0" />
                  <div>
                    <div className="text-xs text-stone-700 font-semibold leading-none">{t.wind}</div>
                    <div className="text-sm font-bold text-stone-950 mt-0.5">
                      {advisory.weather_snapshot.wind_speed_kmh} km/h
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actionable Farmer Advice in Large Typography */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-[#111827]">
                {t.advisoryHeader}
              </h3>
              <div className="bg-white border border-stone-200 rounded-xl p-4 text-[#111827] text-base leading-relaxed whitespace-pre-line font-medium">
                {advisory.advisory_text}
              </div>
            </div>

            {/* Voice Replay Button */}
            {advisory.audio_base64 && (
              <button
                onClick={() => playAudio(advisory.audio_base64!)}
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 active:bg-stone-300 border border-stone-300 text-[#111827] font-semibold text-base flex items-center justify-center gap-2.5 transition-colors focus:ring-2 focus:ring-[#14532d]"
              >
                <Volume2
                  className={`w-5 h-5 text-[#14532d] ${
                    isPlayingAudio ? 'motion-safe:animate-pulse text-emerald-700' : ''
                  }`}
                />
                <span>{t.replayAudio}</span>
              </button>
            )}

            {/* Reset / Check Another Button */}
            <button
              onClick={handleReset}
              className="w-full min-h-[52px] px-5 py-3.5 rounded-xl bg-[#14532d] hover:bg-[#166534] text-white font-medium text-base flex items-center justify-center gap-2.5 transition-colors shadow-xs"
            >
              <RotateCcw className="w-5 h-5" />
              <span>{t.checkAnother}</span>
            </button>
          </div>
        )}

        {/* Progressive Disclosure Form: One Decision at a Time */}
        {!isLoading && !advisory && !error && (
          <div className="space-y-5">
            {/* STEP 1: Select State */}
            {formStep === 'state' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-md">
                    {t.step1Title}
                  </span>
                  <h2 className="text-xl font-bold text-[#111827] pt-2">
                    {t.selectState}
                  </h2>
                </div>

                <div className="space-y-1.5">
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full min-h-[52px] px-4 py-3 rounded-xl bg-white border-2 border-stone-300 text-stone-900 font-semibold text-base focus:ring-2 focus:ring-[#14532d] focus:outline-none"
                  >
                    {INDIAN_STATES.map((state) => {
                      const label =
                        language === 'hi'
                          ? state.name_hi
                          : language === 'bn'
                          ? state.name_bn
                          : state.name;
                      return (
                        <option key={state.name} value={state.name}>
                          {label} ({state.name})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  onClick={() => setFormStep('district')}
                  className="w-full min-h-[56px] px-6 py-4 rounded-xl bg-[#14532d] hover:bg-[#166534] active:bg-[#0f3d20] text-white font-semibold text-lg flex items-center justify-center gap-3 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-[#14532d]/30"
                >
                  <span>{t.nextBtn}</span>
                </button>
              </div>
            )}

            {/* STEP 2: Select District */}
            {formStep === 'district' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-stone-100 px-3 py-2 rounded-lg border border-stone-200">
                  <span className="text-xs font-semibold text-stone-900">
                    राज्य: {selectedState}
                  </span>
                  <button
                    onClick={() => setFormStep('state')}
                    className="text-xs font-bold text-[#14532d] hover:underline px-2 py-1 min-h-[36px]"
                  >
                    {t.changeBtn}
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-md">
                    {t.step2Title}
                  </span>
                  <h2 className="text-xl font-bold text-[#111827] pt-2">
                    {t.selectDistrict}
                  </h2>
                </div>

                <div className="space-y-1.5">
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full min-h-[52px] px-4 py-3 rounded-xl bg-white border-2 border-stone-300 text-stone-900 font-semibold text-base focus:ring-2 focus:ring-[#14532d] focus:outline-none"
                  >
                    {currentStateObj.districts.map((district) => {
                      const label =
                        language === 'hi'
                          ? district.name_hi
                          : language === 'bn'
                          ? district.name_bn
                          : district.name;
                      return (
                        <option key={district.name} value={district.name}>
                          {label} ({district.name})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  onClick={() => setFormStep('crop')}
                  className="w-full min-h-[56px] px-6 py-4 rounded-xl bg-[#14532d] hover:bg-[#166534] active:bg-[#0f3d20] text-white font-semibold text-lg flex items-center justify-center gap-3 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-[#14532d]/30"
                >
                  <span>{t.nextBtn}</span>
                </button>
              </div>
            )}

            {/* STEP 3: Select Crop */}
            {formStep === 'crop' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-stone-100 px-3 py-2 rounded-lg border border-stone-200">
                  <span className="text-xs font-semibold text-stone-900">
                    स्थान: {selectedDistrict}, {selectedState}
                  </span>
                  <button
                    onClick={() => setFormStep('district')}
                    className="text-xs font-bold text-[#14532d] hover:underline px-2 py-1 min-h-[36px]"
                  >
                    {t.changeBtn}
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-md">
                    {t.step3Title}
                  </span>
                  <h2 className="text-xl font-bold text-[#111827] pt-2">
                    {t.selectCrop}
                  </h2>
                </div>

                <div className="space-y-1.5">
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full min-h-[52px] px-4 py-3 rounded-xl bg-white border-2 border-stone-300 text-stone-900 font-semibold text-base focus:ring-2 focus:ring-[#14532d] focus:outline-none"
                  >
                    {CROPS_LIST.map((crop) => {
                      const label =
                        language === 'hi'
                          ? crop.name_hi
                          : language === 'bn'
                          ? crop.name_bn
                          : crop.name_en;
                      return (
                        <option key={crop.id} value={crop.name_en}>
                          {label} ({crop.name_en})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={fetchAdvisory}
                    className="w-full min-h-[56px] px-6 py-4 rounded-xl bg-[#14532d] hover:bg-[#166534] active:bg-[#0f3d20] text-white font-semibold text-lg flex items-center justify-center gap-3 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-[#14532d]/30"
                  >
                    <CloudSun className="w-6 h-6" strokeWidth={2} />
                    <span>{t.getAdvisory}</span>
                  </button>
                </div>
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
