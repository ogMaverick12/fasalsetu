'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sun, Moon, HelpCircle, ArrowLeft } from 'lucide-react';
import { useApp, Language } from '@/context/AppContext';
import { I18N } from '@/lib/i18n';

interface NavbarProps {
  showBack?: boolean;
  backHref?: string;
  title?: string;
  subtitle?: string;
}

export default function Navbar({
  showBack = false,
  backHref = '/',
  title,
  subtitle,
}: NavbarProps) {
  const { theme, toggleTheme, language, setLanguage, openGuidance } = useApp();
  const t = I18N[language] || I18N.hi;

  return (
    <header className="pb-4 border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Brand Identity or Back Button */}
        <div className="flex items-center gap-2.5">
          {showBack ? (
            <Link
              href={backHref}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#111827] dark:text-[#f9fafb] bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 active:bg-stone-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#14532d] dark:focus:ring-[#22c55e] min-h-[44px] min-w-[44px]"
              aria-label={t.common.backBtn}
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2.2} />
            </Link>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#14532d] dark:focus:ring-[#22c55e] rounded-lg p-1"
            >
              <div className="w-9 h-9 rounded-lg bg-[#14532d] dark:bg-[#166534] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="font-semibold text-base tracking-tight text-[#111827] dark:text-[#f9fafb] leading-none">
                  {title || t.common.appName}
                </h1>
                <span className="text-xs text-[#1f2937] dark:text-stone-400 font-semibold">
                  {subtitle || t.common.appHindi}
                </span>
              </div>
            </Link>
          )}

          {showBack && title && (
            <div className="max-w-[140px] xs:max-w-[180px] sm:max-w-none">
              <h1 className="font-bold text-sm sm:text-base text-[#111827] dark:text-[#f9fafb] leading-tight truncate">
                {title}
              </h1>
            </div>
          )}
        </div>

        {/* Right: Language Switcher, Dark Mode & Guidance Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Native Script Language Switcher */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/90 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
            {(['hi', 'bn', 'en'] as Language[]).map((lang) => {
              const labels = { hi: 'हिन्दी', bn: 'বাংলা', en: 'EN' };
              const isSelected = language === lang;
              return (
                <button
                  key={lang}
                  id={`lang-btn-${lang}`}
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#14532d] text-white shadow-xs dark:bg-[#22c55e] dark:text-stone-950 font-extrabold'
                      : 'text-stone-800 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`Switch language to ${labels[lang]}`}
                >
                  {labels[lang]}
                </button>
              );
            })}
          </div>

          {/* Theme Toggle Button (Light/Dark) */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-[#111827] dark:text-[#f9fafb] bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 active:bg-stone-300 transition-colors border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#14532d] dark:focus:ring-[#22c55e] min-h-[44px] min-w-[44px]"
            title={theme === 'dark' ? t.common.lightMode : t.common.darkMode}
            aria-label={t.common.themeToggle}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" strokeWidth={2.2} />
            ) : (
              <Moon className="w-5 h-5 text-[#14532d]" strokeWidth={2.2} />
            )}
          </button>

          {/* Startup Guidance / Help Modal Trigger */}
          <button
            id="guidance-open-btn"
            onClick={() => openGuidance('guide')}
            className="h-11 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 text-xs font-bold text-[#14532d] dark:text-[#22c55e] bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#14532d] dark:focus:ring-[#22c55e] min-h-[44px]"
            title={t.common.guideBtn}
            aria-label={t.common.guideBtn}
          >
            <HelpCircle className="w-4 h-4 shrink-0" strokeWidth={2.4} />
            <span className="hidden xs:inline sm:inline">{t.common.guideBtn}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
