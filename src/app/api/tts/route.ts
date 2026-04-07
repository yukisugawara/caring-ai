import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text, language } = await req.json();
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_CLOUD_API_KEY not set" }, { status: 500 });
  }

  const isEnglish = language === "en";

  const body = {
    input: { text },
    voice: {
      languageCode: isEnglish ? "en-US" : "ja-JP",
      name: isEnglish ? "en-US-Wavenet-F" : "ja-JP-Wavenet-A",
      ssmlGender: "FEMALE",
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: isEnglish ? 0.88 : 0.92,
      pitch: isEnglish ? 1.0 : 1.5,
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
