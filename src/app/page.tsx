'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, CloudSun, BookOpen } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { I18N } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import StartupGuidanceModal from '@/components/StartupGuidanceModal';

export default function HomePage() {
  const { language, openGuidance } = useApp();
  const t = I18N[language] || I18N.hi;

  return (
    <div className="flex flex-col min-h-screen justify-between max-w-md mx-auto w-full px-5 py-6">
      {/* Top Navigation Bar with Logo, Language Switcher, Dark Mode & Guidance button */}
      <Navbar />

      {/* Main Hero & Actions */}
      <main className="flex-1 flex flex-col justify-center py-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-stone-200 dark:bg-stone-800 text-[#111827] dark:text-[#f9fafb] text-xs font-bold">
            <span>🌾</span>
            <span>{t.common.farmerHelp}</span>
          </div>

          <h2 className="font-display text-3xl font-medium text-[#111827] dark:text-[#f9fafb] leading-[1.25]">
            {t.home.heroTitle}
          </h2>

          <p className="text-base text-[#1f2937] dark:text-stone-300 leading-relaxed font-medium">
            {t.home.heroDesc}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          {/* Primary CTA: Crop Diagnosis */}
          <Link
            href="/diagnose"
            className="w-full min-h-[56px] px-6 py-4 rounded-xl bg-[#14532d] hover:bg-[#166534] active:bg-[#0f3d20] dark:bg-[#22c55e] dark:hover:bg-[#16a34a] dark:active:bg-[#15803d] text-white dark:text-stone-950 font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-[#14532d]/30"
          >
            <Camera className="w-6 h-6 shrink-0" strokeWidth={2.2} />
            <span>{t.home.checkCropBtn}</span>
          </Link>

          {/* Standalone Advisory Action */}
          <Link
            href="/advisory"
            className="w-full min-h-[52px] px-6 py-3.5 rounded-xl bg-white dark:bg-[#131f18] hover:bg-stone-100 dark:hover:bg-[#1a2b21] active:bg-stone-200 border-2 border-[#14532d] dark:border-[#22c55e] text-[#14532d] dark:text-[#22c55e] font-bold text-base flex items-center justify-center gap-2.5 transition-all focus:outline-none focus:ring-4 focus:ring-[#14532d]/20"
          >
            <CloudSun className="w-5 h-5 shrink-0" strokeWidth={2.2} />
            <span>{t.home.advisoryBtn}</span>
          </Link>

          {/* Quick Guide & Field Audio Recorder Button */}
          <button
            onClick={() => openGuidance('guide')}
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#14532d]"
          >
            <BookOpen className="w-4 h-4 text-[#14532d] dark:text-[#22c55e]" strokeWidth={2.2} />
            <span>{t.home.guideBtn}</span>
          </button>
        </div>
      </main>

      {/* Footer info for field accessibility */}
      <footer className="pt-6 border-t border-stone-200 dark:border-stone-800 text-center">
        <p className="text-xs text-[#374151] dark:text-stone-400 font-semibold">
          {t.home.footerText}
        </p>
      </footer>

      {/* Startup Guidance & Field Audio Recorder Modal */}
      <StartupGuidanceModal />
    </div>
  );
}
