import { NextResponse } from 'next/server';
import { SEED_DIAGNOSES } from '@/lib/seed-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { getLang } from '@/lib/languages';

export const dynamic = 'force-dynamic';

/**
 * GET /api/public/summary
 *
 * Read-only public endpoint returning aggregate diagnosis statistics
 * across all Indian states in the FasalSetu database.
 *
 * No authentication required. No personally identifiable information
 * is ever stored — only crop type, disease name, state, and timestamp.
 *
 * Designed to support state-level agricultural data sharing:
 * any state government, research institution, or partner platform
 * can poll this endpoint to track pathogen outbreak trends without
 * needing access to the full FasalSetu application.
 */
export async function GET() {
  try {
    // Start with the seeded multi-state dataset (always available, no DB needed)
    let allRecords = [...SEED_DIAGNOSES];

    // Merge live Supabase records on top when DB is configured
    if (isSupabaseConfigured) {
      try {
        const { data: liveData } = await supabase
          .from('diagnoses')
          .select('id, created_at, state, crop_type, diagnosis_text, language')
          .order('created_at', { ascending: false })
          .limit(500);

        if (liveData && liveData.length > 0) {
          const liveMapped = liveData.map((d) => ({
            ...SEED_DIAGNOSES[0], // carry required shape fields as safe defaults
            id: d.id,
            created_at: d.created_at,
            state: d.state || 'Maharashtra',
            district: 'N/A',
            crop_type: d.crop_type || 'Unknown',
            disease: d.diagnosis_text ? d.diagnosis_text.split(':')[0].trim() : 'Unknown',
            is_healthy: d.diagnosis_text?.toLowerCase().includes('healthy') ?? false,
            language: (d.language as 'hi' | 'bn' | 'en') || 'en',
          }));
          const existingIds = new Set(liveMapped.map((m) => m.id));
          allRecords = [...liveMapped, ...SEED_DIAGNOSES.filter((s) => !existingIds.has(s.id))];
        }
      } catch {
        // Fall through to seed data — endpoint stays live even if DB is unreachable
      }
    }

    const totalDiagnoses = allRecords.length;
    const healthyCount = allRecords.filter((r) => r.is_healthy).length;
    const diseasedCount = totalDiagnoses - healthyCount;

    // ── Diagnoses by state ──────────────────────────────────────────────────
    const stateMap: Record<string, { total: number; diseased: number; healthy: number }> = {};
    allRecords.forEach((r) => {
      if (!stateMap[r.state]) stateMap[r.state] = { total: 0, diseased: 0, healthy: 0 };
      stateMap[r.state].total += 1;
      if (r.is_healthy) stateMap[r.state].healthy += 1;
      else stateMap[r.state].diseased += 1;
    });
    const diagnoses_by_state = Object.entries(stateMap)
      .map(([state, counts]) => ({ state, ...counts }))
      .sort((a, b) => b.total - a.total);

    // ── Top diseases (pathogen surveillance) ────────────────────────────────
    const diseaseMap: Record<string, number> = {};
    allRecords.forEach((r) => {
      if (!r.is_healthy && r.disease) {
        diseaseMap[r.disease] = (diseaseMap[r.disease] || 0) + 1;
      }
    });
    const top_diseases = Object.entries(diseaseMap)
      .map(([disease, count]) => ({ disease, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // ── Crop distribution ───────────────────────────────────────────────────
    const cropMap: Record<string, number> = {};
    allRecords.forEach((r) => {
      if (r.crop_type) cropMap[r.crop_type] = (cropMap[r.crop_type] || 0) + 1;
    });
    const crop_distribution = Object.entries(cropMap)
      .map(([crop, count]) => ({ crop, count }))
      .sort((a, b) => b.count - a.count);

    // ── Language breakdown ──────────────────────────────────────────────────
    const langMap: Record<string, number> = {};
    allRecords.forEach((r) => {
      const lang = r.language || 'en';
      langMap[lang] = (langMap[lang] || 0) + 1;
    });
    const language_breakdown = Object.entries(langMap)
      .map(([language, count]) => ({
        language,
        label: getLang(language).englishName,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const response = {
      meta: {
        description:
          'FasalSetu public aggregate statistics API. ' +
          'Read-only. No PII stored. ' +
          'Designed for state government dashboards, research institutions, ' +
          'and partner platforms to track crop disease trends across India.',
        source: 'fasalsetu-theta.vercel.app',
        docs: 'https://github.com/ogMaverick12/fasalsetu#public-data-api',
        generated_at: new Date().toISOString(),
        record_count: totalDiagnoses,
        data_includes_live_db: isSupabaseConfigured,
      },
      summary: {
        total_diagnoses: totalDiagnoses,
        diseased_count: diseasedCount,
        healthy_count: healthyCount,
        disease_rate_percent: Math.round((diseasedCount / totalDiagnoses) * 100),
        active_states: diagnoses_by_state.length,
        active_districts: new Set(allRecords.map((r) => r.district)).size,
      },
      diagnoses_by_state,
      top_diseases,
      crop_distribution,
      language_breakdown,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        // Allow any state dashboard or research tool to fetch cross-origin
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('[Public Summary API Error]:', err);
    return NextResponse.json(
      { error: 'Failed to compute summary statistics' },
      { status: 500 }
    );
  }
}
