import Link from 'next/link';
import { Camera, ShieldCheck } from 'lucide-react';

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

      {/* Main Hero & One Clear Decision */}
      <main className="flex-1 flex flex-col justify-center py-10">
        <div className="space-y-4">
          <h2 className="font-display text-3xl font-medium text-[#111827] leading-[1.2]">
            Diagnose crop illness from a photo.
          </h2>
          <p className="text-base text-[#374151] leading-relaxed">
            Take a picture of an unhealthy leaf or crop to get an immediate diagnosis and plain-language treatment advice.
          </p>
          <p className="text-sm text-[#4b5563]">
            पत्ती या पौधे की तस्वीर लें और तुरंत बीमारी व समाधान जानें।
          </p>
        </div>

        {/* Primary Call To Action */}
        <div className="mt-10">
          <Link
            href="/diagnose"
            className="w-full min-h-[56px] px-6 py-4 rounded-xl bg-[#14532d] hover:bg-[#166534] active:bg-[#0f3d20] text-white font-medium text-lg flex items-center justify-center gap-3 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-[#14532d]/30"
          >
            <Camera className="w-6 h-6" strokeWidth={2} />
            <span>Check my crop</span>
          </Link>
          <p className="text-center text-xs text-[#4b5563] mt-3">
            अपनी फसल की जांच करें &bull; Simple &amp; free
          </p>
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
