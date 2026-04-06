import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_CLOUD_API_KEY not set" }, { status: 500 });
  }

  const body = {
    input: { text },
    voice: {
      languageCode: "ja-JP",
      name: "ja-JP-Wavenet-A", // Female, high quality wavenet voice
      ssmlGender: "FEMALE",
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: 0.92,
      pitch: 1.5,
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
  // data.audioContent is base64-encoded MP3
  return NextResponse.json({ audioContent: data.audioContent });
}
