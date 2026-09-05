import { NextRequest, NextResponse } from 'next/server';
import { SEED_DIAGNOSES, SeedDiagnosis } from '@/lib/seed-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filterState = searchParams.get('state');
    const filterCrop = searchParams.get('crop');
    const search = searchParams.get('q')?.toLowerCase();

    let allRecords: SeedDiagnosis[] = [...SEED_DIAGNOSES];

    // Attempt to merge newly added live diagnoses from Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { data: dbData } = await supabase
          .from('diagnoses')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbData && dbData.length > 0) {
          const liveMapped: SeedDiagnosis[] = dbData.map((d, index) => ({
            id: d.id,
            created_at: d.created_at,
            state: d.state || 'Maharashtra',
            district: 'Nashik',
            crop_type: d.crop_type || 'Tomato',
            disease: d.diagnosis_text ? d.diagnosis_text.split(':')[0] : 'Early Blight',
            is_healthy: d.diagnosis_text?.toLowerCase().includes('healthy') || false,
            confidence: 'High',
            diagnosis_text: d.diagnosis_text || 'Field Diagnosis',
            recommendation: 'Follow standard bio-fungicide treatment and ensure soil aeration.',
            language: (d.language as 'hi' | 'bn' | 'en') || 'en',
            image_url: d.image_url || SEED_DIAGNOSES[index % SEED_DIAGNOSES.length].image_url,
            temperature_c: 26.5,
            humidity_percent: 74,
            rain_probability: 60,
          }));

          // Prepend live records while maintaining unique IDs
          const existingIds = new Set(liveMapped.map((m) => m.id));
          allRecords = [...liveMapped, ...SEED_DIAGNOSES.filter((s) => !existingIds.has(s.id))];
        }
      } catch (dbErr) {
        console.warn('[Admin Stats] Supabase fetch fallback to seed data:', dbErr);
      }
    }

    // Compute Overall Analytics (unfiltered for nationwide surveillance charts)
    const totalCount = allRecords.length;
    const healthyCount = allRecords.filter((r) => r.is_healthy).length;
    const diseasedCount = totalCount - healthyCount;

    // State Breakdown
    const stateCounts: Record<string, number> = {};
    allRecords.forEach((r) => {
      stateCounts[r.state] = (stateCounts[r.state] || 0) + 1;
    });

    const stateBreakdown = Object.entries(stateCounts)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count);

    // Disease Trends
    const diseaseCounts: Record<string, number> = {};
    allRecords.forEach((r) => {
      if (!r.is_healthy) {
        diseaseCounts[r.disease] = (diseaseCounts[r.disease] || 0) + 1;
      }
    });

    const diseaseTrends = Object.entries(diseaseCounts)
      .map(([disease, count]) => ({ disease, count }))
      .sort((a, b) => b.count - a.count);

    // Apply Filters for table view
    let filtered = [...allRecords];

    if (filterState && filterState !== 'all') {
      filtered = filtered.filter((r) => r.state.toLowerCase() === filterState.toLowerCase());
    }

    if (filterCrop && filterCrop !== 'all') {
      filtered = filtered.filter((r) => r.crop_type.toLowerCase() === filterCrop.toLowerCase());
    }

    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.district.toLowerCase().includes(search) ||
          r.crop_type.toLowerCase().includes(search) ||
          r.disease.toLowerCase().includes(search) ||
          r.state.toLowerCase().includes(search)
      );
    }

    return NextResponse.json(
      {
        summary: {
          total_diagnoses: totalCount,
          active_states: Object.keys(stateCounts).length,
          active_districts: new Set(allRecords.map((r) => r.district)).size,
          healthy_ratio_percent: Math.round((healthyCount / totalCount) * 100),
          diseased_count: diseasedCount,
        },
        state_breakdown: stateBreakdown,
        disease_trends: diseaseTrends,
        records: filtered,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[Admin Stats API Error]:', err);
    return NextResponse.json({ error: 'Failed to compute dashboard analytics' }, { status: 500 });
  }
}
