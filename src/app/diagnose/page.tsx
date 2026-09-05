import Link from 'next/link';
import { ArrowLeft, Camera, UploadCloud } from 'lucide-react';

export default function DiagnosePage() {
  return (
    <div className="flex flex-col min-h-screen justify-between max-w-md mx-auto w-full px-5 py-6">
      {/* Header with back navigation */}
      <header className="flex items-center gap-3 pb-6 border-b border-stone-200">
        <Link
          href="/"
          className="w-11 h-11 rounded-lg flex items-center justify-center text-[#111827] hover:bg-stone-200 active:bg-stone-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#14532d]"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-6 h-6" strokeWidth={2.2} />
        </Link>
        <div>
          <h1 className="font-semibold text-lg text-[#111827] leading-none">
            Diagnose Crop
          </h1>
          <span className="text-xs text-[#4b5563] font-medium">
            फसल की जांच
          </span>
        </div>
      </header>

      {/* Main Content Area / Placeholder for Phase 1 */}
      <main className="flex-1 flex flex-col justify-center py-8">
        <div className="border-2 border-dashed border-stone-300 rounded-2xl p-8 text-center bg-stone-100 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center text-[#14532d]">
            <Camera className="w-8 h-8" strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <h2 className="font-medium text-lg text-[#111827]">
              Camera &amp; Upload Ready
            </h2>
            <p className="text-sm text-[#4b5563]">
              Photo diagnosis pipeline initializes in Phase 1.
            </p>
          </div>
          <div className="pt-2">
            <button
              disabled
              className="px-5 py-3 rounded-lg bg-stone-300 text-stone-600 font-medium text-sm flex items-center gap-2 cursor-not-allowed"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Capture Photo (Coming in Phase 1)</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer back button */}
      <footer className="pt-6 border-t border-stone-200 text-center">
        <Link
          href="/"
          className="text-sm font-medium text-[#14532d] hover:underline"
        >
          &larr; Return to Home
        </Link>
      </footer>
    </div>
  );
}
