import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text, language } = await req.json();
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_CLOUD_API_KEY not set" }, { status: 500 });
  }

  const VOICE_CONFIGS: Record<string, { languageCode: string; name: string; speakingRate: number; pitch: number }> = {
    ja: { languageCode: "ja-JP", name: "ja-JP-Wavenet-A", speakingRate: 0.92, pitch: 1.5 },
    en: { languageCode: "en-US", name: "en-US-Wavenet-F", speakingRate: 0.88, pitch: 1.0 },
    pt: { languageCode: "pt-BR", name: "pt-BR-Wavenet-A", speakingRate: 0.90, pitch: 1.0 },
    vi: { languageCode: "vi-VN", name: "vi-VN-Wavenet-A", speakingRate: 0.90, pitch: 1.0 },
    ru: { languageCode: "ru-RU", name: "ru-RU-Wavenet-A", speakingRate: 0.90, pitch: 1.0 },
  };
  const voiceConfig = VOICE_CONFIGS[language] || VOICE_CONFIGS.ja;

  const body = {
    input: { text },
    voice: {
      languageCode: voiceConfig.languageCode,
      name: voiceConfig.name,
      ssmlGender: "FEMALE",
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: voiceConfig.speakingRate,
      pitch: voiceConfig.pitch,
    },
  };

  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("Google TTS error:", err);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json({ audioContent: data.audioContent });
}
