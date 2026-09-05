'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  BarChart3,
  MapPin,
  Calendar,
  CloudRain,
  Droplets,
  Thermometer,
  Search,
  Filter,
  X,
  ExternalLink,
  Activity,
  Layers,
  Sparkles,
  Sun,
  Moon,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { SeedDiagnosis } from '@/lib/seed-data';

interface DashboardStats {
  summary: {
    total_diagnoses: number;
    active_states: number;
    active_districts: number;
    healthy_ratio_percent: number;
    diseased_count: number;
  };
  state_breakdown: { state: string; count: number }[];
  disease_trends: { disease: string; count: number }[];
  records: SeedDiagnosis[];
}

export default function AdminDashboardPage() {
  const { theme, toggleTheme } = useApp();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<SeedDiagnosis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedState !== 'all') params.set('state', selectedState);
      if (selectedCrop !== 'all') params.set('crop', selectedCrop);
      if (searchQuery) params.set('q', searchQuery);

      const res = await fetch(`/api/admin/stats?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load stats');
      const json: DashboardStats = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedState, selectedCrop, searchQuery]);

  // Extract unique crop list from records
  const cropsList = Array.from(new Set(data?.records.map((r) => r.crop_type) || []));

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-[#0f172a] dark:text-[#f8fafc] font-sans antialiased transition-colors duration-200">
      {/* Reviewer / Judge Dedicated Navigation Bar */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] sticky top-0 z-30 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-8 h-8 rounded-lg bg-[#14532d] dark:bg-[#22c55e] text-white dark:text-stone-950 flex items-center justify-center font-bold text-sm hover:opacity-90 transition-opacity"
              title="Return to Farmer Home"
            >
              FS
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">
                  FasalSetu
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-700">
                  Judge / Reviewer Portal
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-400 font-medium">
                Phase 4: Scale Story | Nationwide Field Deployment Analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 motion-safe:animate-pulse" />
              <span>Multi-State Surveillance Live</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 min-h-[44px] min-w-[44px]"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#14532d]" />
              )}
            </button>

            {/* Farmer View Link */}
            <Link
              href="/"
              className="text-xs font-bold text-[#14532d] dark:text-[#22c55e] hover:underline flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Farmer View</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Reviewer Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Surveillance Top Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#111927] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-400">
                Total Field Diagnoses
              </span>
              <Activity className="w-4 h-4 text-[#14532d] dark:text-[#22c55e]" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {data?.summary.total_diagnoses ?? 0}
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-400 font-medium mt-1">
              Surveillance records across India
            </div>
          </div>

          <div className="bg-white dark:bg-[#111927] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-400">
                Active States
              </span>
              <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {data?.summary.active_states ?? 6} States
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-400 font-medium mt-1">
              {data?.summary.active_districts ?? 14} agricultural districts
            </div>
          </div>

          <div className="bg-white dark:bg-[#111927] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-400">
                Pathogen Detections
              </span>
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-900 dark:text-amber-400">
              {data?.summary.diseased_count ?? 0}
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-400 font-medium mt-1">
              Requiring farm intervention
            </div>
          </div>

          <div className="bg-white dark:bg-[#111927] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-400">
                Healthy Crop Ratio
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-400">
              {data?.summary.healthy_ratio_percent ?? 0}%
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-400 font-medium mt-1">
              Disease-free benchmark samples
            </div>
          </div>
        </div>

        {/* Analytical Visualizations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* State-by-State Volume Breakdown */}
          <div className="bg-white dark:bg-[#111927] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#14532d] dark:text-[#22c55e]" />
                  <span>State-by-State Diagnosis Volume</span>
                </h2>
                <p className="text-xs text-slate-700 dark:text-slate-400 font-medium mt-0.5">
                  Demonstrating geographical reach and nationwide surveillance depth
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-800 dark:text-slate-200">
                6 States Tracked
              </span>
            </div>

            <div className="space-y-3.5">
              {data?.state_breakdown.map((item) => {
                const maxCount = Math.max(...(data.state_breakdown.map((s) => s.count) || [1]));
                const percent = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={item.state} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-900 dark:text-slate-100 font-bold">{item.state}</span>
                      <span className="text-slate-700 dark:text-slate-400">{item.count} diagnoses</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#14532d] dark:bg-[#22c55e] rounded-full motion-safe:transition-all motion-safe:duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Prevalent Pathogens / Disease Trends */}
          <div className="bg-white dark:bg-[#111927] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>Prevalent Pathogen Trends</span>
                </h2>
                <p className="text-xs text-slate-700 dark:text-slate-400 font-medium mt-0.5">
                  Most frequently diagnosed crop diseases across active clusters
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded text-amber-900 dark:text-amber-300">
                Outbreak Monitor
              </span>
            </div>

            <div className="space-y-3">
              {data?.disease_trends.slice(0, 5).map((trend) => (
                <div
                  key={trend.disease}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <span className="font-bold text-slate-900 dark:text-slate-100">{trend.disease}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-400">
                      {trend.count} {trend.count === 1 ? 'case' : 'cases'}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Surveillance Logs Table with Filters */}
        <div className="bg-white dark:bg-[#111927] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Table Header & Controls */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Field Surveillance Records &amp; Case Files
                </h2>
                <p className="text-xs text-slate-700 dark:text-slate-400 font-medium mt-0.5">
                  Click on any diagnosis row to inspect the leaf photo, weather conditions, and localized advice.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-400 self-start sm:self-auto">
                Showing {data?.records.length ?? 0} Records
              </span>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search district, crop, or disease..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
              </div>

              {/* State Filter Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedState('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors min-h-[36px] ${
                    selectedState === 'all'
                      ? 'bg-[#14532d] text-white dark:bg-[#22c55e] dark:text-stone-950'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  All States
                </button>
                {['Maharashtra', 'Punjab', 'West Bengal', 'Uttar Pradesh', 'Madhya Pradesh', 'Karnataka'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedState(st)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors min-h-[36px] ${
                      selectedState === st
                        ? 'bg-[#14532d] text-white dark:bg-[#22c55e] dark:text-stone-950 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                <tr>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Diagnosis / Condition</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Drill-down</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Loading surveillance telemetry...
                    </td>
                  </tr>
                ) : data?.records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No records matched the selected filters.
                    </td>
                  </tr>
                ) : (
                  data?.records.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedRecord(row)}
                    >
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-400 font-medium whitespace-nowrap">
                        {new Date(row.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {row.district}, {row.state}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-300">{row.crop_type}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {row.disease}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {row.is_healthy ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Healthy
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            Alert
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(row);
                          }}
                          className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 group-hover:text-[#14532d] dark:group-hover:text-[#22c55e] font-bold min-h-[44px] px-2 py-1"
                        >
                          <span>Inspect Case</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Individual Record Drill-down Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#111927] text-slate-900 dark:text-slate-100 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#111927] z-10">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-400 block">
                  Case File #{selectedRecord.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {selectedRecord.crop_type} — {selectedRecord.disease}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-10 h-10 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center min-h-[44px] min-w-[44px]"
                aria-label="Close Case File"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Image Preview & Geographic Pin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img
                    src={selectedRecord.image_url}
                    alt={selectedRecord.crop_type}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <MapPin className="w-4 h-4 text-[#14532d] dark:text-[#22c55e]" />
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {selectedRecord.district}, {selectedRecord.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-400">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>{new Date(selectedRecord.created_at).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-400">
                      <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Model Confidence: {selectedRecord.confidence}</span>
                    </div>
                  </div>

                  {/* Weather at Diagnosis Time */}
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 space-y-2">
                    <span className="font-bold text-emerald-950 dark:text-emerald-300 text-xs block">
                      Weather Snapshot at Diagnosis
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-emerald-950 dark:text-emerald-200">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                        <span>{selectedRecord.temperature_c}°C</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Droplets className="w-3.5 h-3.5 text-blue-600" />
                        <span>{selectedRecord.humidity_percent}% humidity</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2 font-semibold">
                        <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                        <span>Rain risk: {selectedRecord.rain_probability}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnosis Assessment */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Clinical Assessment
                </span>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
                  {selectedRecord.diagnosis_text}
                </div>
              </div>

              {/* Actionable Treatment Recommendation */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#14532d] dark:text-[#22c55e] block">
                  Prescribed Field Action / Treatment
                </span>
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed whitespace-pre-line font-medium">
                  {selectedRecord.recommendation}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-6 py-2.5 text-xs font-bold rounded-lg bg-slate-900 dark:bg-[#22c55e] hover:bg-black dark:hover:bg-[#16a34a] text-white dark:text-stone-950 transition-colors min-h-[44px]"
              >
                Close Case File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
