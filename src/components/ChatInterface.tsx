"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

type Lang = "ja" | "en" | "pt" | "vi";

const UI: Record<string, Record<Lang, string>> = {
  subtitle: { ja: "ことばの対話パートナー", en: "Language Conversation Partner", pt: "Parceiro de Conversação", vi: "Bạn đồng hành ngôn ngữ" },
  description: {
    ja: "レッサーパンダのレッサーくんとおはなしして、ことばのちからをのばそう！",
    en: "Talk with Lesser-kun the red panda and grow your language skills!",
    pt: "Converse com o Lesser-kun, o panda vermelho, e melhore suas habilidades linguísticas!",
    vi: "Trò chuyện với Lesser-kun, chú gấu trúc đỏ, và phát triển khả năng ngôn ngữ của bạn!",
  },
  gradeLabel: { ja: "学年段階", en: "Grade Level", pt: "Nível escolar", vi: "Cấp học" },
  startBtn: { ja: "おはなしを はじめる", en: "Start Talking", pt: "Começar a conversar", vi: "Bắt đầu nói chuyện" },
  micNote: {
    ja: "マイクを使います。ブラウザの許可が必要です。\nGoogle Chrome での利用を推奨します。",
    en: "Requires microphone access.\nGoogle Chrome is recommended.",
    pt: "Requer acesso ao microfone.\nRecomenda-se o Google Chrome.",
    vi: "Cần quyền truy cập micrô.\nĐề nghị sử dụng Google Chrome.",
  },
  enableMic: { ja: "🎤 マイクをオンにする", en: "🎤 Turn on Microphone", pt: "🎤 Ligar Microfone", vi: "🎤 Bật micrô" },
  endBtn: { ja: "🏁 おはなし おわり", en: "🏁 End Talk", pt: "🏁 Terminar", vi: "🏁 Kết thúc" },
  sendHint: { ja: "きいているよ。おわったら ✉️ をおしてね", en: "Listening. Press ✉️ when done", pt: "Ouvindo. Aperte ✉️ quando terminar", vi: "Đang nghe. Nhấn ✉️ khi nói xong" },
  speaking: { ja: "レッサーくんがおはなし中...", en: "Lesser-kun is talking...", pt: "Lesser-kun está falando...", vi: "Lesser-kun đang nói..." },
  thinking: { ja: "レッサーくんがかんがえ中...", en: "Lesser-kun is thinking...", pt: "Lesser-kun está pensando...", vi: "Lesser-kun đang suy nghĩ..." },
  waitMic: { ja: "上のボタンをおして、はじめてね", en: "Press the button above to start", pt: "Aperte o botão acima para começar", vi: "Nhấn nút ở trên để bắt đầu" },
  preparing: { ja: "じゅんびちゅう...", en: "Preparing...", pt: "Preparando...", vi: "Đang chuẩn bị..." },
  finishedTitle: { ja: "おはなし、おしまい！", en: "Great talk!", pt: "Ótima conversa!", vi: "Cuộc trò chuyện tuyệt vời!" },
  finishedSub: { ja: "たくさんおはなしできたね！", en: "You did a great job!", pt: "Você foi muito bem!", vi: "Bạn đã làm rất tốt!" },
  fromLesser: { ja: "レッサーくんより", en: "From Lesser-kun", pt: "Do Lesser-kun", vi: "Từ Lesser-kun" },
  analyzing: { ja: "おはなしの分析をしています...", en: "Analyzing the conversation...", pt: "Analisando a conversa...", vi: "Đang phân tích cuộc trò chuyện..." },
  stageLabel: { ja: "ことばの発達ステージ", en: "Language Development Stage", pt: "Estágio de Desenvolvimento Linguístico", vi: "Giai đoạn phát triển ngôn ngữ" },
  stagePosition: { ja: "ことばの発達ステージ — 全体の中の位置", en: "Language Development Stage — Position", pt: "Estágio de Desenvolvimento — Posição", vi: "Giai đoạn phát triển — Vị trí" },
  stepLabel: { ja: "習得ステップ", en: "Acquisition Step", pt: "Etapa de Aquisição", vi: "Bước tiếp thu" },
  stepPosition: { ja: "習得ステップ — 全体の中の位置", en: "Acquisition Step — Position", pt: "Etapa de Aquisição — Posição", vi: "Bước tiếp thu — Vị trí" },
  stageReason: { ja: "ステージ判定の根拠", en: "Stage Assessment Rationale", pt: "Fundamentação do Estágio", vi: "Căn cứ đánh giá giai đoạn" },
  stepReason: { ja: "ステップ判定の根拠", en: "Step Assessment Rationale", pt: "Fundamentação da Etapa", vi: "Căn cứ đánh giá bước" },
  strengths: { ja: "💪 つよみ", en: "💪 Strengths", pt: "💪 Pontos fortes", vi: "💪 Điểm mạnh" },
  goals: { ja: "🎯 つぎのもくひょう", en: "🎯 Next Goals", pt: "🎯 Próximos objetivos", vi: "🎯 Mục tiêu tiếp theo" },
  support: { ja: "📖 せんせいへ", en: "📖 For Teachers", pt: "📖 Para professores", vi: "📖 Dành cho giáo viên" },
  commStrategy: { ja: "💡 コミュニケーション方略", en: "💡 Communication Strategies", pt: "💡 Estratégias de Comunicação", vi: "💡 Chiến lược giao tiếp" },
  codeSwitch: { ja: "🌐 コードスイッチング", en: "🌐 Code-switching", pt: "🌐 Alternância de código", vi: "🌐 Chuyển mã ngôn ngữ" },
  interactive: { ja: "🤝 相互行為能力", en: "🤝 Interactive Competence", pt: "🤝 Competência Interativa", vi: "🤝 Năng lực tương tác" },
  creativity: { ja: "✨ 言語的創造性", en: "✨ Linguistic Creativity", pt: "✨ Criatividade Linguística", vi: "✨ Sáng tạo ngôn ngữ" },
  chatLog: { ja: "💬 おはなしのきろく", en: "💬 Conversation Log", pt: "💬 Registro da conversa", vi: "💬 Nhật ký trò chuyện" },
  you: { ja: "あなた", en: "You", pt: "Você", vi: "Bạn" },
  restart: { ja: "もういちど おはなしする", en: "Talk Again", pt: "Conversar novamente", vi: "Nói chuyện lại" },
  stageOf6: { ja: "（全6段階中）", en: "(of 6 stages)", pt: "(de 6 estágios)", vi: "(trong 6 giai đoạn)" },
  stepOf8: { ja: "（全8段階中）", en: "(of 8 steps)", pt: "(de 8 etapas)", vi: "(trong 8 bước)" },
};

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

const ENCOURAGEMENTS_JA = [
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

const ENCOURAGEMENTS_EN = [
  "It's okay. You can do it.",
  "Take your time. Lesser-kun is waiting for you.",
  "Just say what you're thinking.",
  "It's okay to make mistakes. Let's try.",
  "Anything is fine. Tell me about something you like.",
  "What did you eat today? I'd love to know.",
  "What's your favorite game? Tell Lesser-kun too.",
  "Don't worry, you can talk about anything here.",
  "Lesser-kun is so happy to hear your voice.",
  "I'm having fun talking with you.",
  "Any words are fine. Even just one word is great.",
  "You're thinking quietly. That's wonderful too.",
  "Happy things, sad things, you can talk about anything.",
  "Your voice is really lovely. Let me hear more.",
  "Lesser-kun is always on your side.",
];

const ENCOURAGEMENTS_VI = [
  "Không sao đâu. Bạn làm được mà.",
  "Từ từ thôi nhé. Lesser-kun đang đợi bạn.",
  "Cứ nói những gì bạn đang nghĩ nhé.",
  "Sai cũng không sao. Hãy thử nhé.",
  "Gì cũng được. Kể cho mình nghe điều bạn thích.",
  "Hôm nay bạn ăn gì. Mình muốn biết lắm.",
  "Trò chơi yêu thích của bạn là gì. Kể cho Lesser-kun nghe nhé.",
  "Đừng lo, ở đây bạn có thể nói về bất cứ điều gì.",
  "Lesser-kun rất vui khi được nghe giọng của bạn.",
  "Mình rất vui khi được nói chuyện với bạn.",
  "Từ nào cũng được. Chỉ một từ thôi cũng tuyệt rồi.",
  "Bạn đang suy nghĩ trong im lặng. Điều đó cũng rất tuyệt.",
  "Chuyện vui, chuyện buồn, bạn có thể nói về bất cứ điều gì.",
  "Giọng của bạn rất dễ thương. Cho mình nghe thêm nhé.",
  "Lesser-kun luôn ở bên bạn.",
];

const ENCOURAGEMENTS_PT = [
  "Tudo bem. Você consegue.",
  "Pode ir devagar. O Lesser-kun está esperando por você.",
  "Fala o que você está pensando.",
  "Não tem problema errar. Vamos tentar.",
  "Qualquer coisa serve. Me conta algo que você gosta.",
  "O que você comeu hoje? Quero saber.",
  "Qual é a sua brincadeira favorita? Conta pro Lesser-kun.",
  "Não se preocupe, aqui você pode falar sobre qualquer coisa.",
  "O Lesser-kun fica muito feliz de ouvir sua voz.",
  "Estou me divertindo conversando com você.",
  "Qualquer palavra serve. Até uma só palavra está ótimo.",
  "Você está pensando em silêncio. Isso também é legal.",
  "Coisas legais, coisas tristes, pode falar de tudo.",
  "Sua voz é muito bonita. Quero ouvir mais.",
  "O Lesser-kun está sempre do seu lado.",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  const conversationEndedRef = useRef(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [gradeLevel, setGradeLevel] = useState("小5〜中2段階");
  const [isAutoListening, setIsAutoListening] = useState(false);
  const [silenceWarning, setSilenceWarning] = useState("");
  const [micEnabled, setMicEnabled] = useState(false);
  const [language, setLanguage] = useState<Lang>("ja");
  const [uiLang, setUiLang] = useState<Lang>("ja");

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
    const LANG_CODES: Record<Lang, string> = { ja: "ja-JP", en: "en-US", pt: "pt-BR", vi: "vi-VN" };
    recognition.lang = LANG_CODES[language];
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
        body: JSON.stringify({ text, language }),
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
        const FALLBACK_LANGS: Record<Lang, string> = { ja: "ja-JP", en: "en-US", pt: "pt-BR", vi: "vi-VN" };
        utterance.lang = FALLBACK_LANGS[language];
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        const voices = window.speechSynthesis.getVoices();
        const langPrefix = language.substring(0, 2);
        const preferredVoice =
          voices.find((v) => v.lang.startsWith(langPrefix)) ||
          voices.find((v) => v.lang.startsWith(langPrefix.substring(0, 2)));
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      });
    } finally {
      setIsSpeaking(false);
      speakingLockRef.current = false;
    }
  }, [language]);

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

      const ENCMAP: Record<Lang, string[]> = { ja: ENCOURAGEMENTS_JA, en: ENCOURAGEMENTS_EN, pt: ENCOURAGEMENTS_PT, vi: ENCOURAGEMENTS_VI };
      const encouragements = ENCMAP[language];
      const idx = encourageCountRef.current % encouragements.length;
      const msg = encouragements[idx];
      encourageCountRef.current++;
      setSilenceWarning(msg);
      // Use the main speak function (respects lock)
      await speak(msg);
    }, SILENCE_TIMEOUT_MS);
  }, [clearSilenceTimer, speak, language]);

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
      // Only auto-restart if NOT manually stopped, NOT sending, NOT ended
      if (!stoppedManuallyRef.current && !sendingRef.current && !speakingLockRef.current && !conversationEndedRef.current) {
        setTimeout(() => {
          if (!stoppedManuallyRef.current && !sendingRef.current && !speakingLockRef.current && !conversationEndedRef.current) {
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
          body: JSON.stringify({ messages: newMessages, language }),
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
        // Resume listening only if conversation is still going
        if (!conversationEndedRef.current) {
          startAutoListening();
        }
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
    const GREETINGS: Record<Lang, string> = {
      ja: "こんにちは。わたしはレッサーパンダのレッサーくんだよ。今日はどんなお話をしようか。好きなことや、今日あったことを教えてね。",
      en: "Hello. I'm Lesser-kun, a red panda. What shall we talk about today. Tell me about something you like, or what happened today.",
      pt: "Olá. Eu sou o Lesser-kun, um panda vermelho. Sobre o que vamos conversar hoje. Me conta algo que você gosta, ou o que aconteceu hoje.",
      vi: "Xin chào. Mình là Lesser-kun, một chú gấu trúc đỏ. Hôm nay chúng mình nói chuyện về gì nhé. Kể cho mình nghe điều bạn thích, hoặc chuyện gì đã xảy ra hôm nay nhé.",
    };
    const greeting = GREETINGS[language];
    setMessages([{ role: "assistant", content: greeting }]);
    await speak(greeting);
    // Don't auto-start mic - wait for teacher to press the button
  }, [speak]);

  // End conversation and analyze
  const endConversation = useCallback(async () => {
    setIsConversationEnded(true);
    conversationEndedRef.current = true;
    setMicEnabled(false);
    clearSilenceTimer();
    stoppedManuallyRef.current = true;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    setIsAutoListening(false);
    setCurrentTranscript("");
    window.speechSynthesis.cancel();
    speakingLockRef.current = false;

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
        body: JSON.stringify({ transcript: childUtterances, gradeLevel, language, uiLang }),
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
          {/* Celebration header */}
          <div className="text-center animate-pop-in">
            <div className="animate-float inline-block">
              <Image src="/red-panda.webp" alt="Lesser-kun" width={100} height={100} className="mx-auto rounded-full shadow-lg ring-4 ring-orange-200" />
            </div>
            <h2 className="text-3xl font-black mt-3 bg-gradient-to-r from-orange-400 via-pink-400 to-violet-400 bg-clip-text text-transparent pb-1" style={{ WebkitTextFillColor: "transparent" }}>
              {UI.finishedTitle[uiLang]}
            </h2>
            <p className="text-slate-400 mt-1 text-lg">{UI.finishedSub[uiLang]}</p>
          </div>

          {/* Encouragement from Lesser-kun */}
          {analysisResult?.encouragement && (
            <div className="bubble-card flex items-start gap-4 animate-slide-up" style={{ background: "linear-gradient(135deg, rgba(255,237,213,0.7), rgba(255,228,230,0.7))" }}>
              <div className="animate-wiggle flex-shrink-0">
                <Image src="/red-panda.webp" alt="Lesser-kun" width={56} height={56} className="rounded-full shadow-md ring-2 ring-orange-200" />
              </div>
              <div>
                <div className="text-xs font-black text-orange-400 mb-1 tracking-wide">{UI.fromLesser[uiLang]}</div>
                <p className="text-slate-600 leading-relaxed text-base">{analysisResult.encouragement}</p>
              </div>
            </div>
          )}

          {/* Analyzing spinner */}
          {isAnalyzing && (
            <div className="text-center py-12">
              <div className="animate-float inline-block mb-4">
                <Image src="/red-panda.webp" alt="Lesser-kun" width={64} height={64} className="rounded-full" />
              </div>
              <div className="flex justify-center gap-2 mb-3">
                <div className="w-3 h-3 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-3 h-3 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-3 h-3 bg-violet-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-slate-400 font-bold">{UI.analyzing[uiLang]}</p>
            </div>
          )}

          {analysisResult && (
            <>
              {/* Stage position indicator */}
              <div className="bubble-card animate-slide-up">
                <div className="text-xs font-black text-violet-400 mb-3 tracking-wide">{UI.stagePosition[uiLang]}</div>
                <div className="flex gap-2 mb-3">
                  {(["A", "B", "C", "D", "E", "F"] as const).map((s) => {
                    const isActive = s === analysisResult.stage;
                    return (
                      <div
                        key={s}
                        className={`flex-1 text-center py-3 px-1 rounded-2xl font-black transition-all ${
                          isActive
                            ? `bg-gradient-to-b ${STAGE_COLORS[s]} text-white shadow-lg scale-110 ring-2 ring-white`
                            : "bg-white/50 text-slate-300"
                        }`}
                      >
                        <div className="text-xl">{s}</div>
                      </div>
                    );
                  })}
                </div>
                <div className={`text-center text-base font-black bg-gradient-to-r ${STAGE_COLORS[analysisResult.stage] || "from-indigo-400 to-purple-500"} bg-clip-text text-transparent pb-0.5`} style={{ WebkitTextFillColor: "transparent" }}>
                  {UI.stageLabel[uiLang]} {analysisResult.stage} — {analysisResult.stage_name} {UI.stageOf6[uiLang]}
                </div>
              </div>

              {/* Step position indicator */}
              <div className="bubble-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <div className="text-xs font-black text-pink-400 mb-3 tracking-wide">{UI.stepPosition[uiLang]}（{gradeLevel}）</div>
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
                    const isActive = n === analysisResult.step;
                    return (
                      <div
                        key={n}
                        className={`flex-1 text-center py-3 rounded-2xl font-black transition-all ${
                          isActive
                            ? "bg-gradient-to-b from-pink-400 to-orange-400 text-white shadow-lg scale-110 ring-2 ring-white"
                            : n <= analysisResult.step
                            ? "bg-pink-100 text-pink-300"
                            : "bg-white/50 text-slate-300"
                        }`}
                      >
                        {n}
                      </div>
                    );
                  })}
                </div>
                <div className="text-center text-base font-black bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent pb-0.5" style={{ WebkitTextFillColor: "transparent" }}>
                  {UI.stepLabel[uiLang]} {analysisResult.step} {UI.stepOf8[uiLang]}
                </div>
              </div>

              {/* Reasoning */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bubble-card animate-slide-up border-l-4 border-violet-300" style={{ animationDelay: "0.15s" }}>
                  <h4 className="font-black text-violet-500 text-sm mb-2">{UI.stageReason[uiLang]}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{analysisResult.stage_reasoning}</p>
                </div>
                <div className="bubble-card animate-slide-up border-l-4 border-pink-300" style={{ animationDelay: "0.2s" }}>
                  <h4 className="font-black text-pink-500 text-sm mb-2">{UI.stepReason[uiLang]}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{analysisResult.step_reasoning}</p>
                </div>
              </div>

              {/* Strengths / Goals / Support */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: "strengths" as const, color: "emerald", icon: "💪", value: analysisResult.strengths },
                  { key: "goals" as const, color: "amber", icon: "🎯", value: analysisResult.next_goals },
                  { key: "support" as const, color: "violet", icon: "📖", value: analysisResult.support_suggestions },
                ].map((item, idx) => (
                  <div key={item.key} className={`bubble-card animate-slide-up border-t-4 border-${item.color}-300`} style={{ animationDelay: `${0.25 + idx * 0.05}s` }}>
                    <h4 className={`font-black text-${item.color}-500 text-sm mb-2`}>{UI[item.key][uiLang]}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Extended analysis */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "commStrategy" as const, color: "blue", value: analysisResult.communication_strategies },
                  { key: "codeSwitch" as const, color: "violet", value: analysisResult.code_switching },
                  { key: "interactive" as const, color: "emerald", value: analysisResult.interactive_competence },
                  { key: "creativity" as const, color: "rose", value: analysisResult.linguistic_creativity },
                ].map((item) => (
                  <div key={item.key} className="bubble-card animate-slide-up" style={{ padding: "1rem" }}>
                    <h4 className={`font-black text-${item.color}-400 text-xs mb-1`}>{UI[item.key][uiLang]}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.value}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Chat log */}
          <details className="bubble-card">
            <summary className="font-black text-slate-400 text-sm cursor-pointer">{UI.chatLog[uiLang]}</summary>
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className={`text-sm rounded-xl px-3 py-2 ${m.role === "user" ? "bg-violet-50 text-violet-700" : "bg-orange-50 text-orange-600"}`}>
                  <span className="font-black">{m.role === "user" ? `${UI.you[uiLang]}: ` : "Lesser-kun: "}</span>
                  {m.content}
                </div>
              ))}
            </div>
          </details>

          {/* Restart */}
          <div className="text-center pb-8">
            <button
              onClick={() => {
                setIsConversationEnded(false);
                conversationEndedRef.current = false;
                setIsStarted(false);
                setMessages([]);
                setAnalysisResult(null);
                setMicEnabled(false);
              }}
              className="btn-fun px-8 py-4 bg-gradient-to-r from-orange-400 via-pink-400 to-violet-400 text-white text-lg"
            >
              {UI.restart[uiLang]}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Start screen =====
  if (!isStarted) {
    const GRADE_LABELS: Record<string, Record<Lang, string>> = {
      "小1〜小2段階": { ja: "小1〜小2段階", en: "Grade 1-2", pt: "1º-2º ano", vi: "Lớp 1-2" },
      "小3〜小4段階": { ja: "小3〜小4段階", en: "Grade 3-4", pt: "3º-4º ano", vi: "Lớp 3-4" },
      "小5〜中2段階": { ja: "小5〜中2段階", en: "Grade 5-8", pt: "5º-8º ano", vi: "Lớp 5-8" },
      "中3〜高校段階": { ja: "中3〜高校段階", en: "Grade 9-12", pt: "9º ano-Ensino Médio", vi: "Lớp 9-12" },
    };
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-lg">
          {/* Mascot */}
          <div className="animate-float inline-block">
            <Image src="/red-panda.webp" alt="Lesser-kun" width={140} height={140} className="mx-auto rounded-full shadow-xl ring-4 ring-orange-200/50" />
          </div>

          <h1 className="text-5xl font-black mt-5 mb-2 bg-gradient-to-r from-orange-400 via-pink-400 to-violet-400 bg-clip-text text-transparent pb-2 leading-tight" style={{ WebkitTextFillColor: "transparent" }}>
            Caring AI
          </h1>
          <p className="text-lg text-slate-400 mb-1 font-bold">{UI.subtitle[uiLang]}</p>
          <p className="text-slate-400/70 mb-8 text-sm">
            {UI.description[uiLang]}
          </p>

          <div className="bubble-card max-w-md mx-auto space-y-5 mb-6">
            {/* UI Language selector */}
            <div>
              <label className="text-xs text-slate-400 font-black block mb-2 tracking-wide">
                {uiLang === "ja" ? "表示言語" : uiLang === "pt" ? "Idioma da tela" : uiLang === "vi" ? "Ngôn ngữ hiển thị" : "Display Language"}
              </label>
              <div className="flex justify-center gap-2">
                {(["ja", "en", "pt", "vi"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setUiLang(l)}
                    className={`btn-fun px-4 py-2 text-xs ${
                      uiLang === l
                        ? "bg-gradient-to-r from-slate-600 to-slate-700 text-white"
                        : "bg-white/80 text-slate-400 border-2 border-slate-100 shadow-none"
                    }`}
                  >
                    {l === "ja" ? "日本語" : l === "en" ? "English" : l === "pt" ? "Português" : "Tiếng Việt"}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation language selector */}
            <div>
              <label className="text-xs text-slate-400 font-black block mb-2 tracking-wide">
                {uiLang === "ja" ? "おはなしの言語" : uiLang === "pt" ? "Idioma da conversa" : uiLang === "vi" ? "Ngôn ngữ trò chuyện" : "Conversation Language"}
              </label>
              <div className="flex justify-center gap-2">
                {(["ja", "en", "pt", "vi"] as const).map((l) => {
                  const colors: Record<string, string> = {
                    ja: "from-orange-400 to-pink-400",
                    en: "from-blue-400 to-indigo-400",
                    pt: "from-green-400 to-teal-400",
                    vi: "from-red-400 to-yellow-400",
                  };
                  return (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`btn-fun px-5 py-2.5 text-sm ${
                        language === l
                          ? `bg-gradient-to-r ${colors[l]} text-white`
                          : "bg-white/80 text-slate-400 border-2 border-slate-100 shadow-none"
                      }`}
                    >
                      {l === "ja" ? "日本語" : l === "en" ? "English" : l === "pt" ? "Português" : "Tiếng Việt"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grade selector */}
            <div>
              <label className="text-xs text-slate-400 font-black block mb-2 tracking-wide">
                {UI.gradeLabel[uiLang]}
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-white/80 text-slate-600 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
              >
                {Object.entries(GRADE_LABELS).map(([value, labels]) => (
                  <option key={value} value={value}>{labels[uiLang]}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={startConversation}
            className="btn-fun px-10 py-5 bg-gradient-to-r from-orange-400 via-pink-400 to-violet-400 text-white text-xl"
          >
            {UI.startBtn[uiLang]}
          </button>

          <p className="mt-6 text-xs text-slate-400/70 whitespace-pre-line">
            {UI.micNote[uiLang]}
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
        <div className="flex items-center gap-3">
          <Image src="/red-panda.webp" alt="Lesser-kun" width={40} height={40} className={"rounded-full shadow-md ring-2 ring-orange-200 " + (isSpeaking ? "animate-wiggle" : "")} />
          <span className="text-lg font-black bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent" style={{ WebkitTextFillColor: "transparent" }}>
            Lesser-kun
          </span>
        </div>
        <button
          onClick={endConversation}
          className="btn-fun px-5 py-2.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm"
        >
          {UI.endBtn[uiLang]}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}>
            {m.role === "assistant" && (
              <div className="flex-shrink-0 mr-2 mt-1">
                <Image src="/red-panda.webp" alt="Lesser-kun" width={36} height={36} className={"rounded-full shadow-sm ring-2 ring-orange-100 " + (isSpeaking && i === messages.length - 1 ? "animate-wiggle" : "")} />
              </div>
            )}
            <div className={`max-w-[75%] px-4 py-3 ${m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`}>
              {m.role === "assistant" && (
                <div className="text-xs text-orange-400 font-black mb-1">Lesser-kun</div>
              )}
              <p className="text-sm leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}

        {/* Silence encouragement */}
        {silenceWarning && (
          <div className="flex justify-start animate-pop-in">
            <div className="flex-shrink-0 mr-2 mt-1">
              <Image src="/red-panda.webp" alt="Lesser-kun" width={36} height={36} className="rounded-full shadow-sm ring-2 ring-amber-200 animate-wiggle" />
            </div>
            <div className="max-w-[75%] px-4 py-3 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200/50 shadow-sm">
              <div className="text-xs text-amber-400 font-black mb-1">Lesser-kun</div>
              <p className="text-sm leading-relaxed text-amber-700">{silenceWarning}</p>
            </div>
          </div>
        )}

        {/* Current transcript */}
        {currentTranscript && (
          <div className="flex justify-end animate-slide-up">
            <div className="max-w-[75%] rounded-3xl px-4 py-3 bg-violet-50 text-violet-600 border-2 border-dashed border-violet-200">
              <p className="text-sm">{currentTranscript}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-start animate-pop-in">
            <div className="flex-shrink-0 mr-2 mt-1">
              <Image src="/red-panda.webp" alt="Lesser-kun" width={36} height={36} className="rounded-full shadow-sm" />
            </div>
            <div className="chat-bubble-ai px-5 py-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-3 h-3 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-3 h-3 bg-violet-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div className="py-4 px-4 flex flex-col items-center gap-3">
        {/* Mic enable button */}
        {!micEnabled && !isSpeaking && !isLoading && (
          <button
            onClick={enableMic}
            className="btn-fun px-8 py-4 bg-gradient-to-r from-emerald-400 to-teal-400 text-white text-lg animate-pop-in"
          >
            {UI.enableMic[uiLang]}
          </button>
        )}

        {/* Send button */}
        {micEnabled && isAutoListening && (
          <button
            onClick={stopAndSend}
            disabled={!currentTranscript.trim()}
            className={`btn-fun w-20 h-20 flex items-center justify-center text-3xl ${
              currentTranscript.trim()
                ? "bg-gradient-to-r from-violet-400 to-indigo-400 text-white animate-pop-in"
                : "bg-white/50 text-slate-300 cursor-not-allowed shadow-none"
            }`}
          >
            ✉️
          </button>
        )}

        {/* Status pill */}
        <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black ${
          isSpeaking
            ? "bg-gradient-to-r from-orange-100 to-pink-100 text-orange-500"
            : isAutoListening
            ? "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-500"
            : isLoading
            ? "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-500"
            : !micEnabled
            ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-500"
            : "bg-slate-100 text-slate-400"
        }`}>
          {isSpeaking ? (
            <><span className="animate-wiggle inline-block">🐾</span> {UI.speaking[uiLang]}</>
          ) : isAutoListening ? (
            <><span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" /> {UI.sendHint[uiLang]}</>
          ) : isLoading ? (
            <><span className="animate-wiggle inline-block">🐾</span> {UI.thinking[uiLang]}</>
          ) : !micEnabled ? (
            <>{UI.waitMic[uiLang]}</>
          ) : (
            <>{UI.preparing[uiLang]}</>
          )}
        </div>
      </div>
    </div>
  );
}
