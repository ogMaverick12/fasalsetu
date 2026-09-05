import { NextRequest, NextResponse } from 'next/server';
import { diagnoseCropImage, diagnoseCropAudio } from '@/lib/gemini';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    const audioFile = formData.get('audio') as File | null;
    const language = (formData.get('language') as 'hi' | 'bn' | 'en') || 'en';

    if (!imageFile && !audioFile) {
      return NextResponse.json(
        { error: 'Please provide either a leaf image or a voice note.' },
        { status: 400 }
      );
    }

    let diagnosis;
    let storedImageUrl: string | null = null;

    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const mimeType = imageFile.type || 'image/jpeg';
      
      // Call Gemini multimodal diagnosis
      diagnosis = await diagnoseCropImage(buffer, mimeType, language);

      // Attempt Supabase storage upload if configured
      if (isSupabaseConfigured) {
        try {
          const fileName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('crop-images')
            .upload(fileName, buffer, {
              contentType: mimeType,
              upsert: false,
            });

          if (!uploadError && uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from('crop-images')
              .getPublicUrl(fileName);
            storedImageUrl = publicUrlData.publicUrl;
          }
        } catch (storageErr) {
          console.warn('[Supabase Storage Warning]:', storageErr);
        }
      }
    } else if (audioFile) {
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      const mimeType = audioFile.type || 'audio/webm';

      // Call Gemini native audio understanding
      diagnosis = await diagnoseCropAudio(buffer, mimeType, language);
    }

    if (!diagnosis) {
      return NextResponse.json(
        { error: "Couldn't check that, please try again." },
        { status: 500 }
      );
    }

    // Persist diagnosis in Supabase diagnoses table
    if (isSupabaseConfigured) {
      try {
        await supabase.from('diagnoses').insert({
          image_url: storedImageUrl,
          crop_type: diagnosis.crop,
          diagnosis_text: `${diagnosis.disease}: ${diagnosis.recommendation}`,
          state: null,
          language: language,
        });
      } catch (dbErr) {
        console.warn('[Supabase DB Warning]:', dbErr);
      }
    }

    return NextResponse.json(diagnosis, { status: 200 });
  } catch (err) {
    console.error('[Diagnose API Route Error]:', err);
    return NextResponse.json(
      { error: "Couldn't check that, please try again." },
      { status: 500 }
    );
  }
}
