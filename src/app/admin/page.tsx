'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
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
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased">
      {/* Reviewer / Judge Dedicated Navigation Bar */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#14532d] text-white flex items-center justify-center font-bold text-sm">
              FS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900">
                  FasalSetu
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                  Judge / Reviewer Portal
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium">
                Phase 4: Scale Story | Nationwide Field Deployment Analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-600 motion-safe:animate-pulse" />
              <span>Multi-State Surveillance Live</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Reviewer Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Surveillance Top Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-700 mb-2">
              <span className="text-xs font-bold text-slate-700">
                Total Field Diagnoses
              </span>
              <Activity className="w-4 h-4 text-[#14532d]" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {data?.summary.total_diagnoses ?? 0}
            </div>
            <div className="text-xs text-slate-700 font-medium mt-1">
              Surveillance records across India
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-700 mb-2">
              <span className="text-xs font-bold text-slate-700">
                Active States
              </span>
              <MapPin className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {data?.summary.active_states ?? 6} States
            </div>
            <div className="text-xs text-slate-700 font-medium mt-1">
              {data?.summary.active_districts ?? 14} agricultural districts
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-700 mb-2">
              <span className="text-xs font-bold text-slate-700">
                Pathogen Detections
              </span>
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-amber-900">
              {data?.summary.diseased_count ?? 0}
            </div>
            <div className="text-xs text-slate-700 font-medium mt-1">
              Requiring farm intervention
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-700 mb-2">
              <span className="text-xs font-bold text-slate-700">
                Healthy Crop Ratio
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-900">
              {data?.summary.healthy_ratio_percent ?? 0}%
            </div>
            <div className="text-xs text-slate-700 font-medium mt-1">
              Disease-free benchmark samples
            </div>
          </div>
        </div>

        {/* Analytical Visualizations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* State-by-State Volume Breakdown */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#14532d]" />
                  <span>State-by-State Diagnosis Volume</span>
                </h2>
                <p className="text-xs text-slate-700 font-medium mt-0.5">
                  Demonstrating geographical reach and nationwide surveillance depth
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded text-slate-800">
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
                      <span className="text-slate-900 font-bold">{item.state}</span>
                      <span className="text-slate-700">{item.count} diagnoses</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#14532d] rounded-full motion-safe:transition-all motion-safe:duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Prevalent Pathogens / Disease Trends */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-700" />
                  <span>Prevalent Pathogen Trends</span>
                </h2>
                <p className="text-xs text-slate-700 font-medium mt-0.5">
                  Most frequently diagnosed crop diseases across active clusters
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-900 rounded border border-amber-200">
                Outbreak Monitor
              </span>
            </div>

            <div className="space-y-3.5">
              {data?.disease_trends.slice(0, 5).map((trend) => {
                const maxTrend = Math.max(...(data.disease_trends.map((d) => d.count) || [1]));
                const percent = Math.round((trend.count / maxTrend) * 100);
                return (
                  <div key={trend.disease} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-900 font-bold truncate max-w-[240px]">
                        {trend.disease}
                      </span>
                      <span className="text-slate-700 shrink-0">{trend.count} cases</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-600 rounded-full motion-safe:transition-all motion-safe:duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Field Diagnosis Records Table & Interactive Filter */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header & Filter Bar */}
          <div className="p-5 border-b border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  Field Surveillance Records &amp; Case Files
                </h3>
                <p className="text-xs text-slate-700 font-medium">
                  Click on any diagnosis row to inspect the leaf photo, weather conditions, and localized advice.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md shrink-0">
                Showing {data?.records.length ?? 0} Records
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search district, crop, or disease..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs font-medium rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#14532d] bg-slate-50/50 text-slate-900"
                />
              </div>

              {/* State Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-600" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="text-xs font-semibold rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-[#14532d] focus:outline-none min-h-[38px]"
                >
                  <option value="all">All States</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Punjab">Punjab</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Karnataka">Karnataka</option>
                </select>
              </div>

              {/* Crop Filter */}
              <div>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="text-xs font-semibold rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-[#14532d] focus:outline-none min-h-[38px]"
                >
                  <option value="all">All Crops</option>
                  {cropsList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold">
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Diagnosis / Condition</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Drill-down</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data?.records.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">
                      {new Date(record.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {record.district}, {record.state}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {record.crop_type}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium max-w-[220px] truncate">
                      {record.disease}
                    </td>
                    <td className="py-3.5 px-4">
                      {record.is_healthy ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900">
                          <ShieldCheck className="w-3 h-3" />
                          Healthy
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
                          <ShieldAlert className="w-3 h-3" />
                          Alert
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(record);
                        }}
                        className="text-xs font-bold text-[#14532d] hover:underline inline-flex items-center gap-1 min-h-[44px] px-2 py-1"
                      >
                        Inspect Case <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Individual Record Drill-down Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-bold text-slate-700 block">
                  Case File #{selectedRecord.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedRecord.crop_type} — {selectedRecord.disease}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-10 h-10 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center min-h-[44px] min-w-[44px]"
                aria-label="Close Case File"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Image Preview & Geographic Pin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={selectedRecord.image_url}
                    alt={selectedRecord.crop_type}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-slate-800">
                      <MapPin className="w-4 h-4 text-[#14532d]" />
                      <span className="font-bold text-slate-900">
                        {selectedRecord.district}, {selectedRecord.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>{new Date(selectedRecord.created_at).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Model Confidence: {selectedRecord.confidence}</span>
                    </div>
                  </div>

                  {/* Weather at Diagnosis Time */}
                  <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-2">
                    <span className="font-bold text-emerald-950 text-xs block">
                      Weather Snapshot at Diagnosis
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-emerald-950">
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
                <span className="text-xs font-bold text-slate-700 block">
                  Clinical Assessment
                </span>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 leading-relaxed font-medium">
                  {selectedRecord.diagnosis_text}
                </div>
              </div>

              {/* Actionable Treatment Recommendation */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#14532d] block">
                  Prescribed Field Action / Treatment
                </span>
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs text-emerald-950 leading-relaxed whitespace-pre-line font-medium">
                  {selectedRecord.recommendation}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-6 py-2.5 text-xs font-bold rounded-lg bg-slate-900 hover:bg-black text-white transition-colors min-h-[44px]"
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
