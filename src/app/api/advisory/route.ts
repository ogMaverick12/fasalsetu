import { NextRequest, NextResponse } from 'next/server';
import { getDistrictCoordinates } from '@/lib/geo-india';
import { fetchHyperlocalWeather } from '@/lib/weather';
import { generateWeatherAdvisory } from '@/lib/gemini';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { state, district, crop_type, language = 'hi' } = body;

    if (!state || !district) {
      return NextResponse.json(
        { error: 'State and district are required.' },
        { status: 400 }
      );
    }

    // 1. Geocode state/district to approximate coordinates
    const { lat, lon } = getDistrictCoordinates(state, district);

    // 2. Fetch hyperlocal real-time and forecast weather from Open-Meteo
    const weatherSnapshot = await fetchHyperlocalWeather(lat, lon);

    // 3. Generate localized agronomic advisory with Gemini 2.5 Flash
    const cropName = crop_type || 'General Crop';
    const advisory = await generateWeatherAdvisory(
      cropName,
      state,
      district,
      weatherSnapshot,
      language as 'hi' | 'bn' | 'en'
    );

    // 4. Store in Supabase advisories table
    if (isSupabaseConfigured) {
      try {
        await supabase.from('advisories').insert({
          state,
          district,
          crop_type: cropName,
          weather_snapshot: JSON.parse(JSON.stringify(weatherSnapshot)),
          advisory_text: advisory.advisory_text,
          language,
        });
      } catch (dbErr) {
        console.warn('[Supabase Advisory DB Warning]:', dbErr);
      }
    }

    return NextResponse.json(advisory, { status: 200 });
  } catch (err) {
    console.error('[Advisory API Route Error]:', err);
    return NextResponse.json(
      { error: "Couldn't check weather advisory, please try again." },
      { status: 500 }
    );
  }
}
