'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
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
import { useApp } from '@/context/AppContext';
import { I18N } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import StartupGuidanceModal from '@/components/StartupGuidanceModal';
import { INDIAN_STATES, CROPS_LIST } from '@/lib/geo-india';
import type { WeatherSnapshot } from '@/lib/weather';

interface AdvisoryResult {
  state: string;
  district: string;
  crop: string;
  weather_snapshot: WeatherSnapshot;
  advisory_text: string;
  spoken_text: string;
  language: string;
  audio_base64?: string;
}

export default function AdvisoryPage() {
  const { language } = useApp();
  const t = I18N[language] || I18N.hi;

  const [formStep, setFormStep] = useState<'state' | 'district' | 'crop'>('state');
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Nashik');
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advisory, setAdvisory] = useState<AdvisoryResult | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Update district dropdown when state changes
  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const foundState = INDIAN_STATES.find((s) => s.name === stateName);
    if (foundState && foundState.districts.length > 0) {
      setSelectedDistrict(foundState.districts[0].name);
    }
  };

  const currentStateObj =
    INDIAN_STATES.find((s) => s.name === selectedState) || INDIAN_STATES[0];

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

  const fetchAdvisory = async () => {
    setIsLoading(true);
    setError(null);
    setAdvisory(null);

    try {
      const response = await fetch('/api/advisory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      setError(t.advisory.errorDesc);
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
      {/* Top Header with Back Button and Universal Navbar */}
      <Navbar
        showBack
        backHref="/"
        title={t.advisory.title}
        subtitle={t.advisory.subtitle}
      />

      {/* Main Interactive Container */}
      <main className="flex-1 flex flex-col justify-center py-6">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#14532d] dark:text-[#22c55e] flex items-center justify-center mx-auto motion-safe:animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#111827] dark:text-[#f9fafb]">
                {t.advisory.analyzing}
              </h2>
              <p className="text-sm text-[#1f2937] dark:text-stone-300 font-semibold">
                {t.advisory.waitNote}
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
              <h3 className="font-bold text-[#111827] dark:text-[#f9fafb]">{t.advisory.errorTitle}</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="px-5 py-3 rounded-lg bg-[#14532d] dark:bg-[#22c55e] text-white dark:text-stone-950 font-bold text-sm hover:bg-[#166534] min-h-[44px]"
            >
              {t.common.tryAgain}
            </button>
          </div>
        )}

        {/* Advisory Output State */}
        {advisory && !isLoading && (
          <div className="space-y-6">
            {/* Header: Location & Crop Chip */}
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-stone-700 dark:text-stone-300 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-[#14532d] dark:text-[#22c55e]" />
                  <span>
                    {advisory.district}, {advisory.state}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-base font-bold text-[#111827] dark:text-[#f9fafb]">
                  <Sprout className="w-4 h-4 text-[#14532d] dark:text-[#22c55e]" />
                  <span>{advisory.crop}</span>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                Open-Meteo
              </span>
            </div>

            {/* Weather Metric Cards */}
            <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-300">
                  {t.advisory.weatherConditions}
                </span>
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {advisory.weather_snapshot.weather_description}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white/90 dark:bg-[#131f18] p-2.5 rounded-lg border border-emerald-100 dark:border-[#1e3327] flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="text-xs text-stone-700 dark:text-stone-400 font-semibold leading-none">{t.advisory.temp}</div>
                    <div className="text-sm font-bold text-stone-950 dark:text-[#f9fafb] mt-0.5">
                      {advisory.weather_snapshot.temperature_c}°C
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 dark:bg-[#131f18] p-2.5 rounded-lg border border-emerald-100 dark:border-[#1e3327] flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-xs text-stone-700 dark:text-stone-400 font-semibold leading-none">{t.advisory.humidity}</div>
                    <div className="text-sm font-bold text-stone-950 dark:text-[#f9fafb] mt-0.5">
                      {advisory.weather_snapshot.humidity_percent}%
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 dark:bg-[#131f18] p-2.5 rounded-lg border border-emerald-100 dark:border-[#1e3327] flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <div className="text-xs text-stone-700 dark:text-stone-400 font-semibold leading-none">{t.advisory.rainChance}</div>
                    <div className="text-sm font-bold text-stone-950 dark:text-[#f9fafb] mt-0.5">
                      {advisory.weather_snapshot.rain_probability_max}%
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 dark:bg-[#131f18] p-2.5 rounded-lg border border-emerald-100 dark:border-[#1e3327] flex items-center gap-2">
                  <Wind className="w-4 h-4 text-teal-600 shrink-0" />
                  <div>
                    <div className="text-xs text-stone-700 dark:text-stone-400 font-semibold leading-none">{t.advisory.wind}</div>
                    <div className="text-sm font-bold text-stone-950 dark:text-[#f9fafb] mt-0.5">
                      {advisory.weather_snapshot.wind_speed_kmh} km/h
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actionable Farmer Advice */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#111827] dark:text-[#f9fafb]">
                {t.advisory.advisoryHeader}
              </h3>
              <div className="bg-white dark:bg-[#131f18] border border-stone-200 dark:border-[#1e3327] rounded-xl p-4 text-[#111827] dark:text-stone-200 text-base leading-relaxed whitespace-pre-line font-medium shadow-xs">
                {advisory.advisory_text}
              </div>
            </div>

            {/* Voice Replay Button */}
            {advisory.audio_base64 && (
              <button
                onClick={() => playAudio(advisory.audio_base64!)}
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:bg-stone-300 border border-stone-300 dark:border-stone-700 text-[#111827] dark:text-[#f9fafb] font-bold text-base flex items-center justify-center gap-2.5 transition-colors focus:ring-2 focus:ring-[#14532d]"
              >
                <Volume2
                  className={`w-5 h-5 text-[#14532d] dark:text-[#22c55e] ${
                    isPlayingAudio ? 'motion-safe:animate-pulse text-emerald-700' : ''
                  }`}
                />
                <span>{t.advisory.replayAudio}</span>
              </button>
            )}

            {/* Reset / Check Another Button */}
            <button
              onClick={handleReset}
              className="w-full min-h-[52px] px-5 py-3.5 rounded-xl bg-[#14532d] hover:bg-[#166534] dark:bg-[#22c55e] dark:hover:bg-[#16a34a] text-white dark:text-stone-950 font-bold text-base flex items-center justify-center gap-2.5 transition-colors shadow-xs"
            >
              <RotateCcw className="w-5 h-5" />
              <span>{t.advisory.checkAnother}</span>
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
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md">
                    {t.advisory.step1Title}
                  </span>
                  <h2 className="text-xl font-bold text-[#111827] dark:text-[#f9fafb] pt-2">
                    {t.advisory.selectState}
                  </h2>
                </div>

                <div className="space-y-1.5">
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full min-h-[52px] px-4 py-3 rounded-xl bg-white dark:bg-[#131f18] border-2 border-stone-300 dark:border-[#1e3327] text-stone-900 dark:text-[#f9fafb] font-bold text-base focus:ring-2 focus:ring-[#14532d] focus:outline-none"
                  >
                    {INDIAN_STATES.map((state) => {
                      const label =
                        language === 'hi'
                          ? state.name_hi
                          : language === 'bn'
                          ? state.name_bn
                          : state.name;
                      return (
                        <option key={state.name} value={state.name} className="bg-white dark:bg-[#131f18] text-stone-900 dark:text-stone-100">
                          {label} ({state.name})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  onClick={() => setFormStep('district')}
                  className="w-full min-h-[56px] px-6 py-4 rounded-xl bg-[#14532d] hover:bg-[#166534] active:bg-[#0f3d20] dark:bg-[#22c55e] dark:hover:bg-[#16a34a] text-white dark:text-stone-950 font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-[#14532d]/30"
                >
                  <span>{t.advisory.nextBtn}</span>
                </button>
              </div>
            )}

            {/* STEP 2: Select District */}
            {formStep === 'district' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-stone-100 dark:bg-[#0c1410] px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-300">
                    राज्य: {selectedState}
                  </span>
                  <button
                    onClick={() => setFormStep('state')}
                    className="text-xs font-bold text-[#14532d] dark:text-[#22c55e] hover:underline px-2 py-1 min-h-[36px]"
                  >
                    {t.advisory.changeBtn}
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md">
                    {t.advisory.step2Title}
                  </span>
                  <h2 className="text-xl font-bold text-[#111827] dark:text-[#f9fafb] pt-2">
                    {t.advisory.selectDistrict}
                  </h2>
                </div>

                <div className="space-y-1.5">
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full min-h-[52px] px-4 py-3 rounded-xl bg-white dark:bg-[#131f18] border-2 border-stone-300 dark:border-[#1e3327] text-stone-900 dark:text-[#f9fafb] font-bold text-base focus:ring-2 focus:ring-[#14532d] focus:outline-none"
                  >
                    {currentStateObj.districts.map((district) => {
                      const label =
                        language === 'hi'
                          ? district.name_hi
                          : language === 'bn'
                          ? district.name_bn
                          : district.name;
                      return (
                        <option key={district.name} value={district.name} className="bg-white dark:bg-[#131f18] text-stone-900 dark:text-stone-100">
                          {label} ({district.name})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  onClick={() => setFormStep('crop')}
                  className="w-full min-h-[56px] px-6 py-4 rounded-xl bg-[#14532d] hover:bg-[#166534] active:bg-[#0f3d20] dark:bg-[#22c55e] dark:hover:bg-[#16a34a] text-white dark:text-stone-950 font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-[#14532d]/30"
                >
                  <span>{t.advisory.nextBtn}</span>
                </button>
              </div>
            )}

            {/* STEP 3: Select Crop */}
            {formStep === 'crop' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-stone-100 dark:bg-[#0c1410] px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-300">
                    स्थान: {selectedDistrict}, {selectedState}
                  </span>
                  <button
                    onClick={() => setFormStep('district')}
                    className="text-xs font-bold text-[#14532d] dark:text-[#22c55e] hover:underline px-2 py-1 min-h-[36px]"
                  >
                    {t.advisory.changeBtn}
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md">
                    {t.advisory.step3Title}
                  </span>
                  <h2 className="text-xl font-bold text-[#111827] dark:text-[#f9fafb] pt-2">
                    {t.advisory.selectCrop}
                  </h2>
                </div>

                <div className="space-y-1.5">
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full min-h-[52px] px-4 py-3 rounded-xl bg-white dark:bg-[#131f18] border-2 border-stone-300 dark:border-[#1e3327] text-stone-900 dark:text-[#f9fafb] font-bold text-base focus:ring-2 focus:ring-[#14532d] focus:outline-none"
                  >
                    {CROPS_LIST.map((crop) => {
                      const label =
                        language === 'hi'
                          ? crop.name_hi
                          : language === 'bn'
                          ? crop.name_bn
                          : crop.name_en;
                      return (
                        <option key={crop.id} value={crop.name_en} className="bg-white dark:bg-[#131f18] text-stone-900 dark:text-stone-100">
                          {label} ({crop.name_en})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={fetchAdvisory}
                    className="w-full min-h-[56px] px-6 py-4 rounded-xl bg-[#14532d] hover:bg-[#166534] active:bg-[#0f3d20] dark:bg-[#22c55e] dark:hover:bg-[#16a34a] text-white dark:text-stone-950 font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-[#14532d]/30"
                  >
                    <CloudSun className="w-6 h-6" strokeWidth={2} />
                    <span>{t.advisory.getAdvisory}</span>
                  </button>
                </div>
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
