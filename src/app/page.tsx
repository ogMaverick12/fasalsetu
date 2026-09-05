import Link from 'next/link';
import { Camera, ShieldCheck, CloudSun } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen justify-between max-w-md mx-auto w-full px-5 py-6">
      {/* Top Header / App Identity */}
      <header className="flex items-center justify-between pb-6 border-b border-stone-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-[#14532d] text-white flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="font-semibold text-lg tracking-tight text-[#111827] leading-none">
              FasalSetu
            </h1>
            <span className="text-xs text-[#4b5563] font-medium">
              फसल सेतु
            </span>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-stone-200 text-stone-800 rounded">
          किसान सहायता
        </span>
      </header>

      {/* Main Hero & Actions */}
      <main className="flex-1 flex flex-col justify-center py-8">
        <div className="space-y-4">
          <h2 className="font-display text-3xl font-medium text-[#111827] leading-[1.2]">
            Diagnose crop illness &amp; get weather advice.
          </h2>
          <p className="text-base text-[#374151] leading-relaxed">
            Take a picture of an unhealthy leaf or check local weather-based irrigation and disease advisories.
          </p>
          <p className="text-sm text-[#4b5563]">
            पत्ती की फोटो से बीमारी पहचानें या अपने जिले का मौसम पूर्वानुमान व कृषि सलाह जानें।
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          {/* Primary CTA: Crop Diagnosis */}
          <Link
            href="/diagnose"
            className="w-full min-h-[56px] px-6 py-4 rounded-xl bg-[#14532d] hover:bg-[#166534] active:bg-[#0f3d20] text-white font-medium text-lg flex items-center justify-center gap-3 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-[#14532d]/30"
          >
            <Camera className="w-6 h-6" strokeWidth={2} />
            <span>Check my crop (फसल जांचें)</span>
          </Link>

          {/* Standalone Advisory Action */}
          <Link
            href="/advisory"
            className="w-full min-h-[52px] px-6 py-3.5 rounded-xl bg-white hover:bg-stone-100 active:bg-stone-200 border-2 border-[#14532d] text-[#14532d] font-semibold text-base flex items-center justify-center gap-2.5 transition-colors focus:outline-none focus:ring-4 focus:ring-[#14532d]/20"
          >
            <CloudSun className="w-5 h-5" strokeWidth={2.2} />
            <span>Weather Advisory (मौसम सलाह)</span>
          </Link>
        </div>
      </main>

      {/* Footer info for field accessibility */}
      <footer className="pt-6 border-t border-stone-200 text-center">
        <p className="text-xs text-[#4b5563]">
          Built for Indian agriculture &bull; Works in outdoor daylight
        </p>
      </footer>
    </div>
  );
}
