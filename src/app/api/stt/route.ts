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
  fr: "fr-FR",
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_CLOUD_API_KEY not set" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const language = (formData.get("language") as string) || "ja";

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file" }, { status: 400 });
    }

    // Convert file to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    if (base64Audio.length < 100) {
      return NextResponse.json({ text: "" });
    }

    // Use v1p1beta1 for auto-detect encoding support
    const body = {
      config: {
        languageCode: LANG_CODES[language] || "en-US",
        model: "default",
        enableAutomaticPunctuation: true,
        // No encoding specified = auto-detect from file header
      },
      audio: {
        content: base64Audio,
      },
    };

    // Estimate audio duration. WebM/Opus ~16-32 kbps → ~2-4 KB/sec.
    // Sync `speech:recognize` is capped at ~60s; use longrunningrecognize
    // when the payload could exceed that, so long speech isn't truncated.
    const sizeBytes = arrayBuffer.byteLength;
    const useLongRunning = sizeBytes > 200 * 1024; // >~200KB → likely >60s

    let data: { results?: { alternatives?: { transcript?: string }[] }[] };

    if (!useLongRunning) {
      const res = await fetch(
        `https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${apiKey}`,
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
      data = await res.json();
    } else {
      // Start long-running operation
      const startRes = await fetch(
        `https://speech.googleapis.com/v1p1beta1/speech:longrunningrecognize?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (!startRes.ok) {
        const err = await startRes.text();
        console.error("Google STT longrunning start error:", err);
        return NextResponse.json({ error: "Transcription failed", detail: err }, { status: 500 });
      }
      const op = await startRes.json();
      const opName: string | undefined = op.name;
      if (!opName) {
        return NextResponse.json({ error: "No operation name returned" }, { status: 500 });
      }

      // Poll the operation until done (or timeout ~2.5 min)
      const deadline = Date.now() + 150_000;
      let opData: {
        done?: boolean;
        response?: { results?: { alternatives?: { transcript?: string }[] }[] };
        error?: { message?: string };
      } = {};
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch(
          `https://speech.googleapis.com/v1/operations/${encodeURIComponent(opName)}?key=${apiKey}`
        );
        if (!pollRes.ok) {
          const err = await pollRes.text();
          console.error("Google STT poll error:", err);
          continue;
        }
        opData = await pollRes.json();
        if (opData.done) break;
      }

      if (!opData.done) {
        return NextResponse.json({ error: "Transcription timed out" }, { status: 504 });
      }
      if (opData.error) {
        console.error("Google STT longrunning error:", opData.error);
        return NextResponse.json(
          { error: "Transcription failed", detail: opData.error.message },
          { status: 500 }
        );
      }
      data = opData.response || {};
    }

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
    return NextResponse.json({ error: "Transcription failed", detail: String(error) }, { status: 500 });
  }
}
