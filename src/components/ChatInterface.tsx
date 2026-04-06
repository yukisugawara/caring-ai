"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type AnalysisResult = {
  stage: string;
  stage_name: string;
  stage_reasoning: string;
  step: number;
  step_reasoning: string;
  communication_strategies: string;
  code_switching: string;
  interactive_competence: string;
  linguistic_creativity: string;
  strengths: string;
  next_goals: string;
  support_suggestions: string;
  encouragement: string;
};

const SILENCE_TIMEOUT_MS = 10000;

const ENCOURAGEMENTS = [
  "大丈夫だよ。自信を持って。",
  "ゆっくりでいいよ。レッサーくんが待っているからね。",
  "思ったことを、そのまま話してみてね。",
  "間違えてもいいんだよ。チャレンジしてみよう。",
  "何でもいいよ。好きなことを話してみて。",
  "今日のご飯、何食べた。教えてほしいな。",
  "好きな遊びは何。レッサーくんにも教えて。",
  "大丈夫、ここでは何を話してもいいんだよ。",
  "レッサーくんはね、きみの声が聞けてうれしいな。",
  "一緒にお話できて、楽しいよ。",
  "どんな言葉でもいいよ。一言だけでも大丈夫。",
  "静かに考えているんだね。それもすてきだよ。",
  "面白いこと、悲しいこと、何でも話していいよ。",
  "きみの声はとってもすてきだよ。もっと聞かせて。",
  "レッサーくんはいつでもきみの味方だよ。",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [gradeLevel, setGradeLevel] = useState("小5〜中2段階");
  const [isAutoListening, setIsAutoListening] = useState(false);
  const [silenceWarning, setSilenceWarning] = useState("");
  const [micEnabled, setMicEnabled] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const encourageCountRef = useRef(0);
  const lastSpeechTimeRef = useRef(Date.now());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentTranscript, silenceWarning]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function createRecognition(): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const recognition = new SpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.interimResults = true;
    recognition.continuous = true;
    return recognition;
  }

  // Prevent double-speak
  const speakingLockRef = useRef(false);

  // Speak using Google Cloud TTS, fallback to Web Speech API
  const speak = useCallback(async (text: string): Promise<void> => {
    // Prevent overlapping speech
    if (speakingLockRef.current) return;
    speakingLockRef.current = true;
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Pause recognition while AI speaks (prevent mic picking up speaker)
    if (recognitionRef.current) {
      stoppedManuallyRef.current = true;
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    setIsAutoListening(false);

    setIsSpeaking(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("TTS API failed");
      const data = await res.json();
      if (!data.audioContent) throw new Error("No audio");

      // Play base64 MP3
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play();
      });
    } catch {
      // Fallback to Web Speech API
      await new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ja-JP";
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        const voices = window.speechSynthesis.getVoices();
        const jpVoice =
          voices.find((v) => v.lang.startsWith("ja") && v.name.includes("Kyoko")) ||
          voices.find((v) => v.lang.startsWith("ja"));
        if (jpVoice) utterance.voice = jpVoice;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      });
    } finally {
      setIsSpeaking(false);
      speakingLockRef.current = false;
    }
  }, []);

  // Clear silence timer
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setSilenceWarning("");
  }, []);

  // Start silence timer - encourage if no speech for 10 seconds
  const startSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(async () => {
      // Don't encourage if AI is already speaking or sending
      if (speakingLockRef.current || sendingRef.current) return;

      const idx = encourageCountRef.current % ENCOURAGEMENTS.length;
      const msg = ENCOURAGEMENTS[idx];
      encourageCountRef.current++;
      setSilenceWarning(msg);
      // Use the main speak function (respects lock)
      await speak(msg);
    }, SILENCE_TIMEOUT_MS);
  }, [clearSilenceTimer, speak]);

  // Refs for managing recognition lifecycle
  const accumulatedRef = useRef("");
  const stoppedManuallyRef = useRef(false);
  const sendingRef = useRef(false);

  // Start listening
  const startAutoListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    const recognition = createRecognition();
    if (!recognition) {
      alert("このブラウザは音声認識に対応していません。Google Chromeをお使いください。");
      return;
    }
    recognitionRef.current = recognition;
    stoppedManuallyRef.current = false;
    accumulatedRef.current = "";
    setCurrentTranscript("");
    setIsAutoListening(true);
    lastSpeechTimeRef.current = Date.now();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let final = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      accumulatedRef.current = final;
      setCurrentTranscript(final + interim);

      if (final.length > 0 || interim.length > 0) {
        lastSpeechTimeRef.current = Date.now();
        clearSilenceTimer();
        startSilenceTimer();
      }
    };

    recognition.onend = () => {
      setIsAutoListening(false);
      // Only auto-restart if NOT manually stopped and NOT sending
      if (!stoppedManuallyRef.current && !sendingRef.current && !speakingLockRef.current) {
        setTimeout(() => {
          if (!stoppedManuallyRef.current && !sendingRef.current && !speakingLockRef.current) {
            startAutoListening();
          }
        }, 500);
      }
    };

    recognition.onerror = () => {};
    recognition.start();
    startSilenceTimer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearSilenceTimer, startSilenceTimer]);

  // Teacher presses mic button once
  const enableMic = useCallback(() => {
    setMicEnabled(true);
    startAutoListening();
  }, [startAutoListening]);

  // Keep a ref to latest messages to avoid stale closure issues
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  // Send text to AI, then resume listening
  const sendToAI = useCallback(
    async (userText: string) => {
      // Prevent double send
      if (sendingRef.current) return;
      sendingRef.current = true;

      const newMessages: Message[] = [...messagesRef.current, { role: "user", content: userText }];
      setMessages(newMessages);
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        });
        const data = await res.json();
        const aiMessage: Message = { role: "assistant", content: data.text };
        setMessages([...newMessages, aiMessage]);
        setIsLoading(false);
        await speak(data.text);
      } catch {
        setMessages([
          ...newMessages,
          { role: "assistant", content: "ごめんね、うまく聞き取れなかったよ。もう一回話してくれる。" },
        ]);
        setIsLoading(false);
      } finally {
        sendingRef.current = false;
        // Resume listening
        startAutoListening();
      }
    },
    [speak, startAutoListening]
  );

  // User presses send button
  const stopAndSend = useCallback(() => {
    clearSilenceTimer();
    setSilenceWarning("");
    const text = accumulatedRef.current.trim() || currentTranscript.trim();

    // Stop recognition manually
    stoppedManuallyRef.current = true;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    setIsAutoListening(false);
    setCurrentTranscript("");
    accumulatedRef.current = "";

    if (text) {
      sendToAI(text);
    } else {
      startAutoListening();
    }
  }, [currentTranscript, clearSilenceTimer, sendToAI, startAutoListening]);

  const startConversation = useCallback(async () => {
    setIsStarted(true);
    encourageCountRef.current = 0;
    const greeting = "こんにちは。わたしはレッサーパンダのレッサーくんだよ。今日はどんなお話をしようか。好きなことや、今日あったことを教えてね。";
    setMessages([{ role: "assistant", content: greeting }]);
    await speak(greeting);
    // Don't auto-start mic - wait for teacher to press the button
  }, [speak]);

  // End conversation and analyze
  const endConversation = useCallback(async () => {
    setIsConversationEnded(true);
    clearSilenceTimer();
    recognitionRef.current?.stop();
    setIsAutoListening(false);
    window.speechSynthesis.cancel();

    const childUtterances = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n");

    if (!childUtterances.trim()) {
      setAnalysisResult(null);
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: childUtterances, gradeLevel }),
      });
      const data = await res.json();
      if (!data.error) setAnalysisResult(data);
    } catch {
      // Analysis failed
    } finally {
      setIsAnalyzing(false);
    }
  }, [messages, gradeLevel, clearSilenceTimer]);

  const STAGE_COLORS: Record<string, string> = {
    A: "from-slate-400 to-slate-500",
    B: "from-blue-400 to-blue-500",
    C: "from-green-400 to-emerald-500",
    D: "from-amber-400 to-orange-500",
    E: "from-purple-400 to-violet-500",
    F: "from-pink-400 to-rose-500",
  };

  // ===== Conversation ended: show analysis =====
  if (isConversationEnded) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <Image src="/red-panda.webp" alt="レッサーくん" width={80} height={80} className="mx-auto rounded-full" />
            <h2 className="text-2xl font-black mt-2 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              おはなし、おしまい！
            </h2>
            <p className="text-slate-500 mt-1">たくさんおはなしできたね！</p>
          </div>

          {analysisResult?.encouragement && (
            <div className="flex items-start gap-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-200">
              <Image src="/red-panda.webp" alt="レッサーくん" width={48} height={48} className="rounded-full" />
              <div>
                <div className="text-xs font-bold text-orange-500 mb-1">レッサーくんより</div>
                <p className="text-slate-700 leading-relaxed">{analysisResult.encouragement}</p>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-500 mb-3" />
              <p className="text-slate-500">おはなしの分析をしています...</p>
            </div>
          )}

          {analysisResult && (
            <>
              {/* Stage position indicator */}
              <div className="bg-white/70 backdrop-blur rounded-2xl p-5 border border-white/80 shadow-sm">
                <div className="text-xs font-bold text-slate-400 mb-2">ことばの発達ステージ — 全体の中の位置</div>
                <div className="flex gap-1.5 mb-3">
                  {(["A", "B", "C", "D", "E", "F"] as const).map((s) => {
                    const isActive = s === analysisResult.stage;
                    const names: Record<string, string> = { A: "イマココ期", B: "イマココ\nから順序期", C: "順序期", D: "因果期", E: "抽象期", F: "評価・\n発展期" };
                    return (
                      <div
                        key={s}
                        className={`flex-1 text-center py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? `bg-gradient-to-r ${STAGE_COLORS[s]} text-white shadow-lg scale-105`
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <div className="text-lg">{s}</div>
                        <div className="whitespace-pre-line leading-tight mt-0.5" style={{ fontSize: "0.6rem" }}>
                          {names[s]}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={`text-center text-sm font-bold bg-gradient-to-r ${STAGE_COLORS[analysisResult.stage] || "from-indigo-400 to-purple-500"} bg-clip-text text-transparent`}>
                  ステージ {analysisResult.stage}【{analysisResult.stage_name}】（全6段階中）
                </div>
              </div>

              {/* Step position indicator */}
              <div className="bg-white/70 backdrop-blur rounded-2xl p-5 border border-white/80 shadow-sm">
                <div className="text-xs font-bold text-slate-400 mb-2">日本語の習得ステップ — 全体の中の位置（{gradeLevel}）</div>
                <div className="flex gap-1.5 mb-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
                    const isActive = n === analysisResult.step;
                    return (
                      <div
                        key={n}
                        className={`flex-1 text-center py-2.5 rounded-xl text-sm font-bold transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-pink-400 to-amber-400 text-white shadow-lg scale-105"
                            : n <= analysisResult.step
                            ? "bg-pink-100 text-pink-400"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {n}
                      </div>
                    );
                  })}
                </div>
                <div className="text-center text-sm font-bold bg-gradient-to-r from-pink-400 to-amber-400 bg-clip-text text-transparent">
                  ステップ {analysisResult.step}（全8段階中）
                </div>
              </div>

              {/* Reasoning */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/60 rounded-xl p-4 border-l-4 border-indigo-400">
                  <h4 className="font-bold text-indigo-600 text-sm mb-1">ステージ判定の根拠</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{analysisResult.stage_reasoning}</p>
                </div>
                <div className="bg-white/60 rounded-xl p-4 border-l-4 border-pink-400">
                  <h4 className="font-bold text-pink-600 text-sm mb-1">ステップ判定の根拠</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{analysisResult.step_reasoning}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/60 rounded-xl p-4 border-l-4 border-green-400">
                  <h4 className="font-bold text-green-600 text-sm mb-1">💪 つよみ</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{analysisResult.strengths}</p>
                </div>
                <div className="bg-white/60 rounded-xl p-4 border-l-4 border-amber-400">
                  <h4 className="font-bold text-amber-600 text-sm mb-1">🎯 つぎのもくひょう</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{analysisResult.next_goals}</p>
                </div>
                <div className="bg-white/60 rounded-xl p-4 border-l-4 border-purple-400">
                  <h4 className="font-bold text-purple-600 text-sm mb-1">📖 せんせいへ</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{analysisResult.support_suggestions}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 rounded-xl p-3 border border-white/60">
                  <h4 className="font-bold text-blue-500 text-xs mb-1">💡 コミュニケーション方略</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{analysisResult.communication_strategies}</p>
                </div>
                <div className="bg-white/50 rounded-xl p-3 border border-white/60">
                  <h4 className="font-bold text-violet-500 text-xs mb-1">🌐 コードスイッチング</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{analysisResult.code_switching}</p>
                </div>
                <div className="bg-white/50 rounded-xl p-3 border border-white/60">
                  <h4 className="font-bold text-emerald-500 text-xs mb-1">🤝 相互行為能力</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{analysisResult.interactive_competence}</p>
                </div>
                <div className="bg-white/50 rounded-xl p-3 border border-white/60">
                  <h4 className="font-bold text-rose-500 text-xs mb-1">✨ 言語的創造性</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{analysisResult.linguistic_creativity}</p>
                </div>
              </div>
            </>
          )}

          <details className="bg-white/50 rounded-xl p-4 border border-white/60">
            <summary className="font-bold text-slate-500 text-sm cursor-pointer">💬 おはなしのきろく</summary>
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className={`text-sm ${m.role === "user" ? "text-slate-700" : "text-orange-600"}`}>
                  <span className="font-bold">{m.role === "user" ? "あなた: " : "レッサーくん: "}</span>
                  {m.content}
                </div>
              ))}
            </div>
          </details>

          <div className="text-center pb-8">
            <button
              onClick={() => {
                setIsConversationEnded(false);
                setIsStarted(false);
                setMessages([]);
                setAnalysisResult(null);
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              もういちど おはなしする
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Start screen =====
  if (!isStarted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <Image src="/red-panda.webp" alt="レッサーくん" width={120} height={120} className="mx-auto rounded-full" />
          <h1 className="text-4xl font-black mt-4 mb-2 bg-gradient-to-r from-orange-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
            Caring AI
          </h1>
          <p className="text-lg text-slate-500 mb-1">ことばの対話パートナー</p>
          <p className="text-slate-400 mb-6 text-sm">
            レッサーパンダのレッサーくんとおはなしして、ことばのちからをのばそう！
          </p>

          <div className="mb-6">
            <label className="text-sm text-slate-500 font-bold block mb-1">学年段階</label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white/70 text-slate-700 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option>小1〜小2段階</option>
              <option>小3〜小4段階</option>
              <option>小5〜中2段階</option>
              <option>中3〜高校段階</option>
            </select>
          </div>

          <button
            onClick={startConversation}
            className="px-8 py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            おはなしを はじめる
          </button>

          <p className="mt-6 text-xs text-slate-400">
            マイクを使います。ブラウザの許可が必要です。
            <br />
            Google Chrome での利用を推奨します。
          </p>
        </div>
      </div>
    );
  }

  // ===== Chat view =====
  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between py-3 px-4">
        <div className="flex items-center gap-2">
          <Image src="/red-panda.webp" alt="レッサーくん" width={36} height={36} className={"rounded-full " + (isSpeaking ? "animate-bounce" : "")} />
          <span className="text-lg font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            レッサーくん
          </span>
        </div>
        <button
          onClick={endConversation}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all"
        >
          🏁 おはなし おわり
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="flex-shrink-0 mr-2 mt-1">
                <Image src="/red-panda.webp" alt="レッサーくん" width={32} height={32} className={"rounded-full " + (isSpeaking && i === messages.length - 1 ? "animate-bounce" : "")} />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                m.role === "user"
                  ? "bg-gradient-to-r from-indigo-400 to-purple-400 text-white"
                  : "bg-white/80 backdrop-blur text-slate-700 border border-orange-100"
              }`}
            >
              {m.role === "assistant" && (
                <div className="text-xs text-orange-400 font-bold mb-1">レッサーくん</div>
              )}
              <p className="text-sm leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}

        {/* Silence encouragement */}
        {silenceWarning && (
          <div className="flex justify-start">
            <div className="flex-shrink-0 mr-2 mt-1"><Image src="/red-panda.webp" alt="レッサーくん" width={32} height={32} className="rounded-full animate-bounce" /></div>
            <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
              <div className="text-xs text-amber-500 font-bold mb-1">レッサーくん</div>
              <p className="text-sm leading-relaxed">{silenceWarning}</p>
            </div>
          </div>
        )}

        {currentTranscript && (
          <div className="flex justify-end">
            <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-indigo-50 text-indigo-700 border-2 border-dashed border-indigo-200">
              <p className="text-sm">{currentTranscript}</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex-shrink-0 mr-2 mt-1"><Image src="/red-panda.webp" alt="レッサーくん" width={32} height={32} className="rounded-full" /></div>
            <div className="bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border border-orange-100">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2.5 h-2.5 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2.5 h-2.5 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div className="py-3 px-4 flex flex-col items-center gap-2">
        {/* Mic enable button - shown once before mic is enabled */}
        {!micEnabled && !isSpeaking && !isLoading && (
          <button
            onClick={enableMic}
            className="px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            🎤 マイクをオンにする
          </button>
        )}

        {/* Send button - visible when listening and has content */}
        {micEnabled && isAutoListening && (
          <button
            onClick={stopAndSend}
            disabled={!currentTranscript.trim()}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all ${
              currentTranscript.trim()
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:scale-110"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            ✉️
          </button>
        )}

        {/* Status */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
          isSpeaking
            ? "bg-orange-100 text-orange-600"
            : isAutoListening
            ? "bg-green-100 text-green-600"
            : isLoading
            ? "bg-purple-100 text-purple-600"
            : !micEnabled
            ? "bg-amber-50 text-amber-600"
            : "bg-slate-100 text-slate-500"
        }`}>
          {isSpeaking ? (
            <><span className="animate-pulse">🐾</span> レッサーくんがおはなし中...</>
          ) : isAutoListening ? (
            <><span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" /> きいているよ。おわったら ✉️ をおしてね</>
          ) : isLoading ? (
            <><span className="animate-pulse">🐾</span> レッサーくんがかんがえ中...</>
          ) : !micEnabled ? (
            <>下のボタンをおして、はじめてね</>
          ) : (
            <>じゅんびちゅう...</>
          )}
        </div>
      </div>
    </div>
  );
}
