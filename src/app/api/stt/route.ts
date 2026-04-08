import { NextRequest, NextResponse } from "next/server";

const LANG_CODES: Record<string, string> = {
  ja: "ja-JP",
  en: "en-US",
  pt: "pt-BR",
  vi: "vi-VN",
  ru: "ru-RU",
  zh: "cmn-Hans-CN",
  de: "de-DE",
  ko: "ko-KR",
  es: "es-ES",
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_CLOUD_API_KEY not set" }, { status: 500 });
  }

  const formData = await req.formData();
  const audioFile = formData.get("audio") as File;
  const language = (formData.get("language") as string) || "ja";

  if (!audioFile) {
    return NextResponse.json({ error: "No audio file" }, { status: 400 });
  }

  // Convert file to base64
  const arrayBuffer = await audioFile.arrayBuffer();
  const base64Audio = Buffer.from(arrayBuffer).toString("base64");

  const body = {
    config: {
      encoding: "WEBM_OPUS",
      sampleRateHertz: 48000,
      languageCode: LANG_CODES[language] || "en-US",
      model: "latest_long",
      enableAutomaticPunctuation: true,
    },
    audio: {
      content: base64Audio,
    },
  };

  try {
    const res = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Google STT error:", err);
      return NextResponse.json({ error: "Transcription failed", detail: err }, { status: 500 });
    }

    const data = await res.json();

    // Extract transcription from results
    const transcript = (data.results || [])
      .map((r: { alternatives?: { transcript?: string }[] }) =>
        r.alternatives?.[0]?.transcript || ""
      )
      .join(" ")
      .trim();

    return NextResponse.json({ text: transcript });
  } catch (error) {
    console.error("STT error:", error);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
