"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

type Lang = "ja" | "en" | "pt" | "vi" | "ru" | "zh" | "de";

const UI: Record<string, Record<Lang, string>> = {
  subtitle: { ja: "ことばの対話パートナー", en: "Language Conversation Partner", pt: "Parceiro de Conversação", vi: "Bạn đồng hành ngôn ngữ", ru: "Партнёр по языковому общению", zh: "语言对话伙伴", de: "Sprachpartner für Gespräche" },
  description: {
    ja: "レッサーパンダのレッサーくんとおはなしして、ことばのちからをのばそう！",
    en: "Talk with Lesser-kun the red panda and grow your language skills!",
    pt: "Converse com o Lesser-kun, o panda vermelho, e melhore suas habilidades linguísticas!",
    vi: "Trò chuyện với Lesser-kun, chú gấu trúc đỏ, và phát triển khả năng ngôn ngữ của bạn!", ru: "Поговори с Лессер-куном, красной пандой, и развивай свои языковые навыки!", zh: "和小熊猫Lesser-kun聊天，提高你的语言能力吧！", de: "Sprich mit Lesser-kun, dem roten Panda, und verbessere deine Sprachfähigkeiten!",
  },
  gradeLabel: { ja: "学年段階", en: "Grade Level", pt: "Nível escolar", vi: "Cấp học", ru: "Уровень класса", zh: "年级阶段", de: "Klassenstufe" },
  startBtn: { ja: "おはなしを はじめる", en: "Start Talking", pt: "Começar a conversar", vi: "Bắt đầu nói chuyện", ru: "Начать разговор", zh: "开始聊天", de: "Gespräch beginnen" },
  micNote: {
    ja: "マイクを使います。ブラウザの許可が必要です。\nGoogle Chrome での利用を推奨します。",
    en: "Requires microphone access.\nGoogle Chrome is recommended.",
    pt: "Requer acesso ao microfone.\nRecomenda-se o Google Chrome.",
    vi: "Cần quyền truy cập micrô.\nĐề nghị sử dụng Google Chrome.", ru: "Требуется доступ к микрофону.\nРекомендуется Google Chrome.", zh: "需要麦克风权限。\n建议使用Google Chrome。", de: "Mikrofonzugriff erforderlich.\nGoogle Chrome wird empfohlen.",
  },
  enableMic: { ja: "🎤 マイクをオンにする", en: "🎤 Turn on Microphone", pt: "🎤 Ligar Microfone", vi: "🎤 Bật micrô", ru: "🎤 Включить микрофон", zh: "🎤 打开麦克风", de: "🎤 Mikrofon einschalten" },
  endBtn: { ja: "🏁 おはなし おわり", en: "🏁 End Talk", pt: "🏁 Terminar", vi: "🏁 Kết thúc", ru: "🏁 Завершить", zh: "🏁 结束", de: "🏁 Beenden" },
  sendHint: { ja: "きいているよ。おわったら ✉️ をおしてね", en: "Listening. Press ✉️ when done", pt: "Ouvindo. Aperte ✉️ quando terminar", vi: "Đang nghe. Nhấn ✉️ khi nói xong", ru: "Слушаю. Нажми ✉️ когда закончишь", zh: "正在听。说完后按 ✉️", de: "Ich höre zu. Drücke ✉️ wenn du fertig bist" },
  speaking: { ja: "レッサーくんがおはなし中...", en: "Lesser-kun is talking...", pt: "Lesser-kun está falando...", vi: "Lesser-kun đang nói...", ru: "Лессер-кун говорит...", zh: "Lesser-kun正在说话...", de: "Lesser-kun spricht..." },
  thinking: { ja: "レッサーくんがかんがえ中...", en: "Lesser-kun is thinking...", pt: "Lesser-kun está pensando...", vi: "Lesser-kun đang suy nghĩ...", ru: "Лессер-кун думает...", zh: "Lesser-kun正在思考...", de: "Lesser-kun denkt nach..." },
  waitMic: { ja: "上のボタンをおして、はじめてね", en: "Press the button above to start", pt: "Aperte o botão acima para começar", vi: "Nhấn nút ở trên để bắt đầu", ru: "Нажми кнопку выше, чтобы начать", zh: "按上面的按钮开始吧", de: "Drücke den Knopf oben, um zu beginnen" },
  preparing: { ja: "じゅんびちゅう...", en: "Preparing...", pt: "Preparando...", vi: "Đang chuẩn bị...", ru: "Подготовка...", zh: "准备中...", de: "Vorbereitung..." },
  finishedTitle: { ja: "おはなし、おしまい！", en: "Great talk!", pt: "Ótima conversa!", vi: "Cuộc trò chuyện tuyệt vời!", ru: "Отличный разговор!", zh: "聊得真开心！", de: "Tolles Gespräch!" },
  finishedSub: { ja: "たくさんおはなしできたね！", en: "You did a great job!", pt: "Você foi muito bem!", vi: "Bạn đã làm rất tốt!", ru: "Ты отлично справился!", zh: "你做得很棒！", de: "Das hast du super gemacht!" },
  fromLesser: { ja: "レッサーくんより", en: "From Lesser-kun", pt: "Do Lesser-kun", vi: "Từ Lesser-kun", ru: "От Лессер-куна", zh: "来自Lesser-kun", de: "Von Lesser-kun" },
  analyzing: { ja: "おはなしの分析をしています...", en: "Analyzing the conversation...", pt: "Analisando a conversa...", vi: "Đang phân tích cuộc trò chuyện...", ru: "Анализирую разговор...", zh: "正在分析对话...", de: "Das Gespräch wird analysiert..." },
  stageLabel: { ja: "ことばの発達ステージ", en: "Language Development Stage", pt: "Estágio de Desenvolvimento Linguístico", vi: "Giai đoạn phát triển ngôn ngữ", ru: "Стадия языкового развития", zh: "语言发展阶段", de: "Sprachentwicklungsstufe" },
  stagePosition: { ja: "ことばの発達ステージ — 全体の中の位置", en: "Language Development Stage — Position", pt: "Estágio de Desenvolvimento — Posição", vi: "Giai đoạn phát triển — Vị trí", ru: "Стадия языкового развития — Позиция", zh: "语言发展阶段 — 所处位置", de: "Sprachentwicklungsstufe — Position" },
  stepLabel: { ja: "習得ステップ", en: "Acquisition Step", pt: "Etapa de Aquisição", vi: "Bước tiếp thu", ru: "Шаг освоения", zh: "习得步骤", de: "Erwerbsschritt" },
  stepPosition: { ja: "習得ステップ — 全体の中の位置", en: "Acquisition Step — Position", pt: "Etapa de Aquisição — Posição", vi: "Bước tiếp thu — Vị trí", ru: "Шаг освоения — Позиция", zh: "习得步骤 — 所处位置", de: "Erwerbsschritt — Position" },
  stageReason: { ja: "ステージ判定の根拠", en: "Stage Assessment Rationale", pt: "Fundamentação do Estágio", vi: "Căn cứ đánh giá giai đoạn", ru: "Обоснование стадии", zh: "阶段判定依据", de: "Begründung der Stufe" },
  stepReason: { ja: "ステップ判定の根拠", en: "Step Assessment Rationale", pt: "Fundamentação da Etapa", vi: "Căn cứ đánh giá bước", ru: "Обоснование шага", zh: "步骤判定依据", de: "Begründung des Schritts" },
  strengths: { ja: "💪 つよみ", en: "💪 Strengths", pt: "💪 Pontos fortes", vi: "💪 Điểm mạnh", ru: "💪 Сильные стороны", zh: "💪 优势", de: "💪 Stärken" },
  goals: { ja: "🎯 つぎのもくひょう", en: "🎯 Next Goals", pt: "🎯 Próximos objetivos", vi: "🎯 Mục tiêu tiếp theo", ru: "🎯 Следующие цели", zh: "🎯 下一个目标", de: "🎯 Nächste Ziele" },
  support: { ja: "📖 せんせいへ", en: "📖 For Teachers", pt: "📖 Para professores", vi: "📖 Dành cho giáo viên", ru: "📖 Для учителей", zh: "📖 给老师的建议", de: "📖 Für Lehrkräfte" },
  commStrategy: { ja: "💡 コミュニケーション方略", en: "💡 Communication Strategies", pt: "💡 Estratégias de Comunicação", vi: "💡 Chiến lược giao tiếp", ru: "💡 Коммуникативные стратегии", zh: "💡 沟通策略", de: "💡 Kommunikationsstrategien" },
  codeSwitch: { ja: "🌐 コードスイッチング", en: "🌐 Code-switching", pt: "🌐 Alternância de código", vi: "🌐 Chuyển mã ngôn ngữ", ru: "🌐 Переключение кодов", zh: "🌐 语码转换", de: "🌐 Code-Switching" },
  interactive: { ja: "🤝 相互行為能力", en: "🤝 Interactive Competence", pt: "🤝 Competência Interativa", vi: "🤝 Năng lực tương tác", ru: "🤝 Интерактивная компетенция", zh: "🤝 互动能力", de: "🤝 Interaktive Kompetenz" },
  creativity: { ja: "✨ 言語的創造性", en: "✨ Linguistic Creativity", pt: "✨ Criatividade Linguística", vi: "✨ Sáng tạo ngôn ngữ", ru: "✨ Языковое творчество", zh: "✨ 语言创造力", de: "✨ Sprachliche Kreativität" },
  chatLog: { ja: "💬 おはなしのきろく", en: "💬 Conversation Log", pt: "💬 Registro da conversa", vi: "💬 Nhật ký trò chuyện", ru: "💬 Журнал разговора", zh: "💬 聊天记录", de: "💬 Gesprächsprotokoll" },
  you: { ja: "あなた", en: "You", pt: "Você", vi: "Bạn", ru: "Ты", zh: "你", de: "Du" },
  restart: { ja: "もういちど おはなしする", en: "Talk Again", pt: "Conversar novamente", vi: "Nói chuyện lại", ru: "Поговорить ещё раз", zh: "再聊一次", de: "Nochmal sprechen" },
  stageOf6: { ja: "（全6段階中）", en: "(of 6 stages)", pt: "(de 6 estágios)", vi: "(trong 6 giai đoạn)", ru: "(из 6 стадий)", zh: "（共6个阶段）", de: "(von 6 Stufen)" },
  stepOf8: { ja: "（全8段階中）", en: "(of 8 steps)", pt: "(de 8 etapas)", vi: "(trong 8 bước)", ru: "(из 8 шагов)", zh: "（共8个步骤）", de: "(von 8 Schritten)" },
  aboutMonosashi: { ja: "📏 「ことばの力のものさし」とは", en: "📏 About the Language Assessment Framework", pt: "📏 Sobre o Instrumento de Avaliação Linguística", vi: "📏 Về khung đánh giá năng lực ngôn ngữ", ru: "📏 О системе оценки языковых способностей", zh: "📏 关于语言能力评估体系", de: "📏 Über das Sprachbewertungssystem" },
};

// Language names in each display language
const LANG_NAMES: Record<Lang, Record<Lang, string>> = {
  ja: { ja: "日本語", en: "日本語", pt: "日本語", vi: "日本語", ru: "日本語", zh: "日本語", de: "Japanisch" },
  en: { ja: "英語", en: "English", pt: "Inglês", vi: "Tiếng Anh", ru: "Английский", zh: "英语", de: "Englisch" },
  pt: { ja: "ポルトガル語", en: "Portuguese", pt: "Português", vi: "Tiếng Bồ Đào Nha", ru: "Португальский", zh: "葡萄牙语", de: "Portugiesisch" },
  vi: { ja: "ベトナム語", en: "Vietnamese", pt: "Vietnamita", vi: "Tiếng Việt", ru: "Вьетнамский", zh: "越南语", de: "Vietnamesisch" },
  ru: { ja: "ロシア語", en: "Russian", pt: "Russo", vi: "Tiếng Nga", ru: "Русский", zh: "俄语", de: "Russisch" },
  zh: { ja: "中国語", en: "Chinese", pt: "Chinês", vi: "Tiếng Trung", ru: "Китайский", zh: "中文", de: "Chinesisch" },
  de: { ja: "ドイツ語", en: "German", pt: "Alemão", vi: "Tiếng Đức", ru: "Немецкий", zh: "德语", de: "Deutsch" },
};

const MONOSASHI_DETAIL: Record<Lang, { intro: string; stages: { label: string; desc: string }[]; stepsIntro: string; steps: { label: string; desc: string }[]; source: string }> = {
  ja: {
    intro: "「ことばの力のものさし」（正式名称：ことばの発達と習得のものさし）は、文部科学省が2025年に策定した、文化的言語的に多様な背景を持つ外国人児童生徒等のためのことばの評価枠組みです。日本語も母語も含め、子どもが持っているすべてのことばのレパートリーを使って最大限にできることを評価します。",
    stages: [
      { label: "ステージA【イマココ期】", desc: "対話による支援を得て、身近なことや経験したことについて覚えている場面を断片的に話せる。ごく簡単な質問（誰が、何が/を、どんな/どうした等）に答えられる。" },
      { label: "ステージB【イマココから順序期】", desc: "対話による支援を得て、身近なことや経験したことについて順序にそっておおまかに話せる。学習内容を聞いておおむね理解し、ひとこと程度の感想が言える。自分が聞きたいことを質問できる。" },
      { label: "ステージC【順序期】", desc: "自分に関係のあることや体験したことについて順序にそってくわしく話せる。学習内容を聞いて話の流れを理解し、感想とその理由が言える。話し合いの場で教師や友達の話を聞いて発言できる。" },
      { label: "ステージD【因果期】", desc: "教科学習内容の基本的な概念について因果関係を含めて説明できる。集めた情報を示しながら授業で発表できる。具体的な事例とともに理由を挙げながら自分の意見を述べられる。" },
      { label: "ステージE【抽象期】", desc: "抽象的な概念について事実と意見の違いを意識しつつ、共通点や相違点を整理して議論できる。構成を意識したわかりやすいプレゼンテーションができる。場面や相手に応じて適切な語彙や表現を選択できる。" },
      { label: "ステージF【評価・発展期】", desc: "中学から高校の教科学習内容について多角的・批判的視点をもった議論ができる。論理的構成を意識し根拠に基づいた効果的なプレゼンテーションができる。反論できる論理の展開を考え説得力のある意見を述べられる。" },
    ],
    stepsIntro: "日本語固有の知識・技能の習得状況を、「聞く・話す」の観点から8段階で評価します。ステップの進み具合は個人差が大きく、数ヶ月で複数のステップを進めるケースもあれば、数年同じステップにとどまるケースもあります。学年段階ごとに異なる基準で判定します。",
    steps: [
      { label: "ステップ1", desc: "単語の断片的な理解。質問に答えられず沈黙する場合がある。" },
      { label: "ステップ2", desc: "限られた単語での応答。定型表現が使える。" },
      { label: "ステップ3", desc: "支援付きで単文による意思疎通ができる。" },
      { label: "ステップ4", desc: "支援付きで単文・簡単な複文で話せる。" },
      { label: "ステップ5", desc: "日常語彙を幅広く使い自由に発話できる。" },
      { label: "ステップ6", desc: "教科学習の基本概念を既習語彙で説明できる。" },
      { label: "ステップ7", desc: "慣用表現・敬語・話体選択ができる。" },
      { label: "ステップ8", desc: "抽象的概念語彙を幅広く運用できる。" },
    ],
    source: "出典：文部科学省「ことばの発達と習得のものさし まるわかりガイド」（2025年4月）",
  },
  en: {
    intro: 'The "Language Development and Acquisition Scale" (Kotoba no Chikara no Monosashi) is a language assessment framework established by the Japanese Ministry of Education in 2025. It is designed for children with diverse cultural and linguistic backgrounds, evaluating the full range of their language repertoire — including both their native language and the language being learned.',
    stages: [
      { label: "Stage A (Here and Now)", desc: "With conversational support, can talk fragmentarily about familiar things and experiences. Can answer very simple questions (who, what, how, etc.)." },
      { label: "Stage B (Here-and-Now to Sequential)", desc: "With conversational support, can talk roughly in order about familiar things and experiences. Can generally understand learning content and express brief impressions. Can ask questions about things they want to know." },
      { label: "Stage C (Sequential)", desc: "Can talk in detail and in order about things related to themselves and their experiences. Can understand the flow of learning content and express impressions with reasons. Can participate in discussions." },
      { label: "Stage D (Causal)", desc: "Can explain basic concepts including cause-and-effect relationships. Can present using collected information. Can state opinions with specific examples and reasons." },
      { label: "Stage E (Abstract)", desc: "Can discuss abstract concepts while distinguishing facts from opinions. Can give well-structured presentations. Can select appropriate vocabulary for the situation and audience." },
      { label: "Stage F (Evaluative/Advanced)", desc: "Can engage in discussions with multiple and critical perspectives. Can give effective evidence-based presentations with logical structure. Can develop persuasive arguments considering counterpoints." },
    ],
    stepsIntro: "Evaluates the acquisition of language-specific knowledge and skills in 8 steps from the perspective of 'listening and speaking.' Progress varies greatly among individuals — some advance through multiple steps in months, while others may stay at the same step for years. Assessment criteria differ by grade level.",
    steps: [
      { label: "Step 1", desc: "Fragmentary understanding of words. May remain silent when asked questions." },
      { label: "Step 2", desc: "Can respond with limited words. Can use set expressions." },
      { label: "Step 3", desc: "With support, can communicate using simple sentences." },
      { label: "Step 4", desc: "With support, can speak using simple and basic compound sentences." },
      { label: "Step 5", desc: "Can speak freely using a wide range of everyday vocabulary." },
      { label: "Step 6", desc: "Can explain basic academic concepts using learned vocabulary." },
      { label: "Step 7", desc: "Can use idiomatic expressions, honorifics, and register selection." },
      { label: "Step 8", desc: "Can broadly use abstract conceptual vocabulary." },
    ],
    source: "Source: Ministry of Education, Japan — \"Language Development and Acquisition Scale Guide\" (April 2025)",
  },
  pt: {
    intro: 'A "Escala de Desenvolvimento e Aquisição Linguística" (Kotoba no Chikara no Monosashi) é um instrumento de avaliação linguística estabelecido pelo Ministério da Educação do Japão em 2025. Foi projetado para crianças com origens culturais e linguísticas diversas, avaliando todo o repertório linguístico da criança — incluindo tanto a língua materna quanto a língua em aprendizagem.',
    stages: [
      { label: "Estágio A (Aqui e Agora)", desc: "Com apoio na conversa, consegue falar fragmentariamente sobre coisas familiares e experiências. Consegue responder perguntas muito simples." },
      { label: "Estágio B (Do Aqui-e-Agora à Sequência)", desc: "Com apoio na conversa, consegue falar de forma aproximadamente ordenada sobre coisas familiares. Consegue compreender conteúdos de aprendizagem e expressar breves impressões." },
      { label: "Estágio C (Sequencial)", desc: "Consegue falar em detalhe e em ordem sobre coisas relacionadas a si mesmo e suas experiências. Consegue compreender o fluxo do conteúdo e expressar impressões com razões." },
      { label: "Estágio D (Causal)", desc: "Consegue explicar conceitos básicos incluindo relações de causa e efeito. Consegue apresentar usando informações coletadas. Consegue expressar opiniões com exemplos e razões." },
      { label: "Estágio E (Abstrato)", desc: "Consegue discutir conceitos abstratos distinguindo fatos de opiniões. Consegue fazer apresentações bem estruturadas. Consegue selecionar vocabulário adequado." },
      { label: "Estágio F (Avaliativo/Avançado)", desc: "Consegue participar de discussões com perspectivas múltiplas e críticas. Consegue fazer apresentações eficazes baseadas em evidências. Consegue desenvolver argumentos persuasivos." },
    ],
    stepsIntro: "Avalia a aquisição de conhecimentos e habilidades específicos da língua em 8 etapas, na perspectiva de 'ouvir e falar.' O progresso varia muito entre os indivíduos. Os critérios de avaliação diferem por nível escolar.",
    steps: [
      { label: "Etapa 1", desc: "Compreensão fragmentária de palavras. Pode permanecer em silêncio quando questionado." },
      { label: "Etapa 2", desc: "Responde com palavras limitadas. Usa expressões fixas." },
      { label: "Etapa 3", desc: "Com apoio, comunica-se usando frases simples." },
      { label: "Etapa 4", desc: "Com apoio, fala usando frases simples e compostas básicas." },
      { label: "Etapa 5", desc: "Fala livremente usando amplo vocabulário cotidiano." },
      { label: "Etapa 6", desc: "Explica conceitos acadêmicos básicos com vocabulário aprendido." },
      { label: "Etapa 7", desc: "Usa expressões idiomáticas, formas de respeito e registros variados." },
      { label: "Etapa 8", desc: "Usa amplamente vocabulário conceitual abstrato." },
    ],
    source: "Fonte: Ministério da Educação do Japão — \"Guia da Escala de Desenvolvimento e Aquisição Linguística\" (abril de 2025)",
  },
  vi: {
    intro: '"Thước đo Phát triển và Tiếp thu Ngôn ngữ" (Kotoba no Chikara no Monosashi) là khung đánh giá ngôn ngữ do Bộ Giáo dục Nhật Bản xây dựng năm 2025. Khung này được thiết kế cho trẻ em có nền tảng văn hóa và ngôn ngữ đa dạng, đánh giá toàn bộ vốn ngôn ngữ của trẻ — bao gồm cả tiếng mẹ đẻ và ngôn ngữ đang học.',
    stages: [
      { label: "Giai đoạn A (Ở đây và Bây giờ)", desc: "Với sự hỗ trợ trong hội thoại, có thể nói rời rạc về những điều quen thuộc và trải nghiệm. Có thể trả lời các câu hỏi rất đơn giản." },
      { label: "Giai đoạn B (Từ Hiện tại đến Trình tự)", desc: "Với sự hỗ trợ, có thể nói theo trình tự sơ lược về những điều quen thuộc. Có thể hiểu nội dung học tập và bày tỏ cảm nhận ngắn gọn." },
      { label: "Giai đoạn C (Trình tự)", desc: "Có thể nói chi tiết và theo trình tự về những điều liên quan đến bản thân. Có thể hiểu nội dung và bày tỏ cảm nhận kèm lý do." },
      { label: "Giai đoạn D (Nhân quả)", desc: "Có thể giải thích các khái niệm cơ bản bao gồm quan hệ nhân quả. Có thể trình bày ý kiến với ví dụ cụ thể và lý do." },
      { label: "Giai đoạn E (Trừu tượng)", desc: "Có thể thảo luận các khái niệm trừu tượng, phân biệt sự thật và ý kiến. Có thể thuyết trình có cấu trúc. Có thể chọn từ vựng phù hợp." },
      { label: "Giai đoạn F (Đánh giá/Nâng cao)", desc: "Có thể tham gia thảo luận với nhiều góc nhìn phản biện. Có thể thuyết trình hiệu quả dựa trên bằng chứng. Có thể phát triển lập luận thuyết phục." },
    ],
    stepsIntro: "Đánh giá mức độ tiếp thu kiến thức và kỹ năng ngôn ngữ qua 8 bước, từ góc độ 'nghe và nói.' Tốc độ tiến bộ khác nhau rất nhiều giữa các cá nhân. Tiêu chí đánh giá khác nhau theo cấp học.",
    steps: [
      { label: "Bước 1", desc: "Hiểu từ vựng rời rạc. Có thể im lặng khi được hỏi." },
      { label: "Bước 2", desc: "Trả lời bằng từ vựng hạn chế. Sử dụng được biểu thức cố định." },
      { label: "Bước 3", desc: "Với hỗ trợ, giao tiếp bằng câu đơn giản." },
      { label: "Bước 4", desc: "Với hỗ trợ, nói bằng câu đơn và câu ghép cơ bản." },
      { label: "Bước 5", desc: "Nói tự do với vốn từ vựng hàng ngày phong phú." },
      { label: "Bước 6", desc: "Giải thích khái niệm học thuật cơ bản bằng từ vựng đã học." },
      { label: "Bước 7", desc: "Sử dụng thành ngữ, kính ngữ và lựa chọn ngữ vực." },
      { label: "Bước 8", desc: "Sử dụng rộng rãi từ vựng khái niệm trừu tượng." },
    ],
    source: "Nguồn: Bộ Giáo dục Nhật Bản — \"Hướng dẫn Thước đo Phát triển và Tiếp thu Ngôn ngữ\" (tháng 4 năm 2025)",
  },
  ru: {
    intro: '«Шкала развития и усвоения речи» (Котоба но Тикара но Моносаси) — это система оценки языковых способностей, разработанная Министерством образования Японии в 2025 году. Она предназначена для детей с разнообразным культурным и языковым происхождением и оценивает весь языковой репертуар ребёнка — включая родной язык и изучаемый язык.',
    stages: [
      { label: "Стадия A (Здесь и сейчас)", desc: "С поддержкой в разговоре может фрагментарно рассказывать о знакомых вещах и переживаниях. Может отвечать на очень простые вопросы." },
      { label: "Стадия B (От настоящего к последовательности)", desc: "С поддержкой может примерно по порядку рассказывать о знакомых вещах. Может в целом понимать учебный материал и выражать краткие впечатления." },
      { label: "Стадия C (Последовательная)", desc: "Может подробно и по порядку рассказывать о вещах, связанных с собой. Может понимать ход содержания и выражать впечатления с причинами." },
      { label: "Стадия D (Причинная)", desc: "Может объяснять базовые понятия, включая причинно-следственные связи. Может представлять информацию и высказывать мнение с примерами и обоснованием." },
      { label: "Стадия E (Абстрактная)", desc: "Может обсуждать абстрактные понятия, различая факты и мнения. Может делать структурированные презентации. Может подбирать подходящую лексику." },
      { label: "Стадия F (Оценочная/Продвинутая)", desc: "Может участвовать в дискуссиях с множественными и критическими перспективами. Может делать убедительные презентации на основе доказательств." },
    ],
    stepsIntro: "Оценивает усвоение языковых знаний и навыков в 8 шагов с точки зрения «слушания и говорения». Прогресс сильно варьируется. Критерии оценки различаются по уровню класса.",
    steps: [
      { label: "Шаг 1", desc: "Фрагментарное понимание слов. Может молчать при вопросах." },
      { label: "Шаг 2", desc: "Отвечает ограниченными словами. Использует шаблонные выражения." },
      { label: "Шаг 3", desc: "С поддержкой общается простыми предложениями." },
      { label: "Шаг 4", desc: "С поддержкой говорит простыми и базовыми сложными предложениями." },
      { label: "Шаг 5", desc: "Свободно говорит, используя широкий повседневный словарный запас." },
      { label: "Шаг 6", desc: "Объясняет базовые учебные понятия выученной лексикой." },
      { label: "Шаг 7", desc: "Использует идиомы, вежливые формы и выбор регистра." },
      { label: "Шаг 8", desc: "Широко использует абстрактную концептуальную лексику." },
    ],
    source: "Источник: Министерство образования Японии — «Руководство по шкале развития и усвоения речи» (апрель 2025)",
  },
  zh: {
    intro: "「语言能力量尺」（Kotoba no Chikara no Monosashi）是日本文部科学省于2025年制定的语言评估体系。该体系面向具有多元文化和语言背景的儿童，评估儿童的全部语言资源——包括母语和正在学习的语言。",
    stages: [
      { label: "阶段A（当下期）", desc: "在对话支持下，能够片段性地讲述熟悉的事物和经历。能回答非常简单的问题。" },
      { label: "阶段B（从当下到顺序期）", desc: "在对话支持下，能大致按顺序讲述熟悉的事物。能大体理解学习内容并表达简短感想。" },
      { label: "阶段C（顺序期）", desc: "能详细、有序地讲述与自己相关的事情。能理解内容的脉络并表达感想及其原因。" },
      { label: "阶段D（因果期）", desc: "能解释包含因果关系的基本概念。能用具体事例和理由表达自己的意见。" },
      { label: "阶段E（抽象期）", desc: "能讨论抽象概念，区分事实与观点。能进行有结构的演讲。能选择恰当的词汇。" },
      { label: "阶段F（评价·发展期）", desc: "能从多角度、批判性视角参与讨论。能进行有说服力的、基于证据的演讲。" },
    ],
    stepsIntro: "从「听与说」的角度，分8个步骤评估语言知识和技能的习得情况。个体之间的进度差异很大。评估标准因年级而异。",
    steps: [
      { label: "步骤1", desc: "对词汇的片段性理解。被提问时可能沉默。" },
      { label: "步骤2", desc: "用有限的词汇回答。能使用固定表达。" },
      { label: "步骤3", desc: "在支持下用简单句子交流。" },
      { label: "步骤4", desc: "在支持下用简单句和基本复句说话。" },
      { label: "步骤5", desc: "能自由使用广泛的日常词汇说话。" },
      { label: "步骤6", desc: "能用已学词汇解释基本学科概念。" },
      { label: "步骤7", desc: "能使用惯用表达、敬语和语体选择。" },
      { label: "步骤8", desc: "能广泛运用抽象概念词汇。" },
    ],
    source: "来源：日本文部科学省——《语言发展与习得量尺指南》（2025年4月）",
  },
  de: {
    intro: "Die Skala zur Sprachentwicklung und zum Spracherwerb (Kotoba no Chikara no Monosashi) ist ein Bewertungsinstrument für Sprachfähigkeiten, das 2025 vom japanischen Bildungsministerium entwickelt wurde. Es ist für Kinder mit vielfältigem kulturellem und sprachlichem Hintergrund konzipiert und bewertet das gesamte Sprachrepertoire des Kindes.",
    stages: [
      { label: "Stufe A (Hier und Jetzt)", desc: "Kann mit Gesprächsunterstützung fragmentarisch über Vertrautes und Erlebtes sprechen. Kann sehr einfache Fragen beantworten." },
      { label: "Stufe B (Vom Jetzt zur Reihenfolge)", desc: "Kann mit Unterstützung ungefähr in Reihenfolge über Vertrautes sprechen. Kann Lerninhalte verstehen und kurze Eindrücke äußern." },
      { label: "Stufe C (Reihenfolge)", desc: "Kann ausführlich und geordnet über eigene Angelegenheiten sprechen. Kann Eindrücke mit Begründungen äußern." },
      { label: "Stufe D (Kausal)", desc: "Kann grundlegende Konzepte einschließlich Ursache-Wirkung erklären. Kann Meinungen mit Beispielen und Begründungen äußern." },
      { label: "Stufe E (Abstrakt)", desc: "Kann abstrakte Konzepte diskutieren und Fakten von Meinungen unterscheiden. Kann strukturierte Präsentationen halten." },
      { label: "Stufe F (Bewertend/Fortgeschritten)", desc: "Kann an Diskussionen mit vielfältigen und kritischen Perspektiven teilnehmen. Kann überzeugende, evidenzbasierte Präsentationen halten." },
    ],
    stepsIntro: "Bewertet den Erwerb sprachlicher Kenntnisse und Fähigkeiten in 8 Schritten aus der Perspektive des Hörens und Sprechens. Der Fortschritt variiert stark zwischen Individuen. Die Bewertungskriterien unterscheiden sich nach Klassenstufe.",
    steps: [
      { label: "Schritt 1", desc: "Fragmentarisches Wortverständnis. Kann bei Fragen schweigen." },
      { label: "Schritt 2", desc: "Antwortet mit begrenzten Wörtern. Verwendet feste Ausdrücke." },
      { label: "Schritt 3", desc: "Kommuniziert mit Unterstützung in einfachen Sätzen." },
      { label: "Schritt 4", desc: "Spricht mit Unterstützung in einfachen und grundlegenden zusammengesetzten Sätzen." },
      { label: "Schritt 5", desc: "Spricht frei mit breitem Alltagswortschatz." },
      { label: "Schritt 6", desc: "Erklärt grundlegende Fachkonzepte mit gelerntem Wortschatz." },
      { label: "Schritt 7", desc: "Verwendet Redewendungen, Höflichkeitsformen und Registerwahl." },
      { label: "Schritt 8", desc: "Verwendet umfassend abstrakten konzeptuellen Wortschatz." },
    ],
    source: "Quelle: Japanisches Bildungsministerium — Leitfaden zur Skala für Sprachentwicklung und Spracherwerb (April 2025)",
  },
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

// Grade-level keys for encouragement lookup
type GradeKey = "g12" | "g34" | "g58" | "g912";
const GRADE_TO_KEY: Record<string, GradeKey> = {
  "小1〜小2段階": "g12",
  "小3〜小4段階": "g34",
  "小5〜中2段階": "g58",
  "中3〜高校段階": "g912",
};

// Encouragements by language and grade level
const ENCOURAGEMENTS: Record<Lang, Record<GradeKey, string[]>> = {
  ja: {
    g12: [
      "だいじょうぶだよ。",
      "ゆっくりでいいよ。",
      "すごいね。もっとおしえて。",
      "がんばってるね。えらいよ。",
      "なんでもいいよ。すきなこと、はなしてみて。",
      "きょうのおひるごはん、なにたべた。",
      "すきなあそび、おしえて。",
      "レッサーくん、きみのこえがだいすきだよ。",
      "いっしょにおはなしできて、たのしいな。",
      "ひとことだけでもいいよ。",
    ],
    g34: [
      "大丈夫だよ。自信を持って。",
      "ゆっくりでいいよ。レッサーくんが待ってるからね。",
      "思ったことを話してみてね。",
      "間違えてもいいんだよ。チャレンジしてみよう。",
      "好きなことを話してみて。",
      "今日のご飯、何食べた。教えてほしいな。",
      "好きな遊びは何。レッサーくんにも教えて。",
      "ここでは何を話してもいいんだよ。",
      "きみの声、すてきだよ。もっと聞かせて。",
      "レッサーくんはいつでもきみの味方だよ。",
    ],
    g58: [
      "大丈夫。自信を持って話してみよう。",
      "ゆっくりでいいよ。待っているからね。",
      "思ったことを、そのまま言葉にしてみて。",
      "間違いを恐れなくていいよ。大事なのは伝えようとすること。",
      "何でもいいよ。最近面白かったこととか。",
      "よく考えてるね。その調子。",
      "自分の言葉で表現できてるよ。すごいね。",
      "いい視点だね。もっと聞かせて。",
      "レッサーくんはきみの挑戦を応援してるよ。",
      "きみの考え、聞けてうれしいな。",
    ],
    g912: [
      "大丈夫。自分のペースで話してみて。",
      "焦らなくていいよ。じっくり考えて。",
      "自分の考えを言葉にしてみよう。",
      "完璧じゃなくていい。伝えようとする気持ちが大事。",
      "最近気になっていることとか、何でも話してみて。",
      "深く考えているんだね。それはとても大切なこと。",
      "自分の意見を持てているのは素晴らしいよ。",
      "いろんな角度から考えられているね。",
      "きみの表現力、どんどん伸びてるよ。",
      "レッサーくんはきみの成長を見守ってるよ。",
    ],
  },
  en: {
    g12: [
      "It's okay.",
      "Take your time.",
      "Wow, great job. Tell me more.",
      "You're doing so well.",
      "Anything is fine. What do you like.",
      "What did you eat today.",
      "What's your favorite game.",
      "Lesser-kun loves your voice.",
      "This is so fun.",
      "Even one word is great.",
    ],
    g34: [
      "It's okay. You can do it.",
      "Take your time. Lesser-kun is waiting.",
      "Just say what you're thinking.",
      "It's okay to make mistakes. Let's try.",
      "Tell me about something you like.",
      "What did you eat today. I'd love to know.",
      "What's your favorite game. Tell Lesser-kun.",
      "You can talk about anything here.",
      "Your voice is lovely. Let me hear more.",
      "Lesser-kun is always on your side.",
    ],
    g58: [
      "Don't worry. Just speak at your own pace.",
      "Take your time. I'm listening.",
      "Try putting your thoughts into words.",
      "Mistakes are fine. What matters is trying.",
      "What's been interesting to you lately.",
      "You're thinking deeply. That's great.",
      "You're expressing yourself really well.",
      "That's an interesting perspective. Tell me more.",
      "Lesser-kun supports your effort.",
      "I'm glad to hear your thoughts.",
    ],
    g912: [
      "It's okay. Take your time to think.",
      "No need to rush. Think it through.",
      "Try to put your ideas into words.",
      "It doesn't have to be perfect. The effort counts.",
      "What's been on your mind lately.",
      "You're thinking carefully. That's valuable.",
      "It's great that you have your own opinions.",
      "You're considering different angles. Well done.",
      "Your ability to express yourself is growing.",
      "Lesser-kun is here to support your growth.",
    ],
  },
  pt: {
    g12: ["Tudo bem.", "Pode ir devagar.", "Muito bem. Me conta mais.", "Você está indo super bem.", "Qualquer coisa serve. O que você gosta.", "O que você comeu hoje.", "Qual é sua brincadeira favorita.", "O Lesser-kun adora sua voz.", "Que divertido.", "Até uma palavra está ótimo."],
    g34: ["Tudo bem. Você consegue.", "Pode ir devagar. O Lesser-kun está esperando.", "Fala o que você está pensando.", "Errar não tem problema. Vamos tentar.", "Me conta algo que você gosta.", "O que você comeu hoje. Quero saber.", "Qual é sua brincadeira favorita. Conta pro Lesser-kun.", "Aqui você pode falar sobre qualquer coisa.", "Sua voz é muito bonita. Me conta mais.", "O Lesser-kun está sempre do seu lado."],
    g58: ["Não se preocupe. Fale no seu ritmo.", "Pode ir devagar. Estou ouvindo.", "Tente colocar seus pensamentos em palavras.", "Erros são normais. O importante é tentar.", "O que tem sido interessante pra você.", "Você está pensando bem. Isso é ótimo.", "Você se expressa muito bem.", "Que perspectiva interessante. Me conta mais.", "O Lesser-kun apoia seu esforço.", "Fico feliz de ouvir suas ideias."],
    g912: ["Tudo bem. Pense com calma.", "Não precisa ter pressa. Reflita.", "Tente colocar suas ideias em palavras.", "Não precisa ser perfeito. O esforço importa.", "O que tem ocupado sua mente.", "Você está refletindo com cuidado. Isso é valioso.", "É ótimo que você tenha suas próprias opiniões.", "Você considera diferentes ângulos. Muito bom.", "Sua capacidade de expressão está crescendo.", "O Lesser-kun acompanha seu desenvolvimento."],
  },
  vi: {
    g12: ["Không sao đâu.", "Từ từ thôi nhé.", "Giỏi lắm. Kể thêm đi.", "Bạn làm tốt lắm.", "Gì cũng được. Bạn thích gì.", "Hôm nay bạn ăn gì.", "Trò chơi yêu thích là gì.", "Lesser-kun thích giọng của bạn lắm.", "Vui quá.", "Một từ thôi cũng tuyệt rồi."],
    g34: ["Không sao đâu. Bạn làm được mà.", "Từ từ thôi nhé. Lesser-kun đang đợi.", "Cứ nói những gì bạn đang nghĩ.", "Sai cũng không sao. Hãy thử nhé.", "Kể cho mình nghe điều bạn thích.", "Hôm nay bạn ăn gì. Mình muốn biết.", "Trò chơi yêu thích là gì. Kể cho Lesser-kun.", "Ở đây bạn nói gì cũng được.", "Giọng bạn rất hay. Cho mình nghe thêm.", "Lesser-kun luôn ở bên bạn."],
    g58: ["Đừng lo. Nói theo tốc độ của bạn nhé.", "Từ từ thôi. Mình đang nghe.", "Thử diễn đạt suy nghĩ bằng lời nhé.", "Sai cũng được. Quan trọng là bạn đã cố gắng.", "Gần đây có gì thú vị không.", "Bạn đang suy nghĩ sâu đấy. Tốt lắm.", "Bạn diễn đạt rất tốt.", "Góc nhìn hay đấy. Kể thêm đi.", "Lesser-kun ủng hộ nỗ lực của bạn.", "Mình vui khi nghe suy nghĩ của bạn."],
    g912: ["Không sao. Suy nghĩ thật kỹ nhé.", "Không cần vội. Hãy suy ngẫm.", "Thử đặt ý tưởng vào lời nói.", "Không cần hoàn hảo. Nỗ lực mới quan trọng.", "Gần đây bạn nghĩ gì.", "Bạn đang cân nhắc kỹ. Điều đó rất quý.", "Thật tuyệt khi bạn có ý kiến riêng.", "Bạn xem xét từ nhiều góc độ. Giỏi lắm.", "Khả năng diễn đạt của bạn đang phát triển.", "Lesser-kun theo dõi sự trưởng thành của bạn."],
  },
  ru: {
    g12: ["Всё хорошо.", "Не спеши.", "Молодец. Расскажи ещё.", "У тебя отлично получается.", "Что угодно. Что тебе нравится.", "Что ты сегодня ел.", "Какая любимая игра.", "Лессер-кун любит твой голос.", "Как весело.", "Даже одно слово отлично."],
    g34: ["Всё хорошо. У тебя получится.", "Не спеши. Лессер-кун ждёт.", "Скажи, что думаешь.", "Ошибаться нормально. Давай попробуем.", "Расскажи, что тебе нравится.", "Что ты ел сегодня. Мне интересно.", "Какая любимая игра. Расскажи Лессер-куну.", "Здесь можно говорить обо всём.", "Твой голос красивый. Расскажи ещё.", "Лессер-кун всегда на твоей стороне."],
    g58: ["Не переживай. Говори в своём темпе.", "Не торопись. Я слушаю.", "Попробуй выразить мысли словами.", "Ошибки это нормально. Главное пытаться.", "Что тебя интересовало в последнее время.", "Ты глубоко думаешь. Это здорово.", "Ты хорошо выражаешь свои мысли.", "Интересная точка зрения. Расскажи больше.", "Лессер-кун поддерживает тебя.", "Рад слышать твои мысли."],
    g912: ["Не спеши. Подумай спокойно.", "Не торопись. Обдумай.", "Попробуй сформулировать свои идеи.", "Не обязательно идеально. Усилие важнее.", "Что тебя сейчас волнует.", "Ты тщательно обдумываешь. Это ценно.", "Здорово, что у тебя есть своё мнение.", "Ты рассматриваешь разные стороны. Молодец.", "Твоя способность выражаться растёт.", "Лессер-кун следит за твоим развитием."],
  },
  zh: {
    g12: ["没关系。", "慢慢来。", "真棒。再多说一些。", "你做得很好。", "什么都可以。你喜欢什么。", "今天吃了什么。", "最喜欢的游戏是什么。", "Lesser-kun很喜欢你的声音。", "好开心。", "一个词也很好。"],
    g34: ["没关系。你可以的。", "慢慢来。Lesser-kun在等你。", "想到什么就说什么。", "说错也没关系。试试看。", "说说你喜欢的东西。", "今天吃了什么。我想知道。", "最喜欢的游戏是什么。告诉Lesser-kun。", "在这里什么都可以说。", "你的声音很好听。再多说一些。", "Lesser-kun一直在你身边。"],
    g58: ["别担心。按自己的节奏来。", "慢慢来。我在听。", "试着把想法变成语言。", "说错没关系。重要的是努力。", "最近有什么有趣的事。", "你思考得很深入。真不错。", "你表达得很好。", "很有趣的观点。多说一些。", "Lesser-kun支持你的努力。", "很高兴听到你的想法。"],
    g912: ["没关系。好好想一想。", "不用着急。慢慢思考。", "试着把想法表达出来。", "不需要完美。努力最重要。", "最近在想什么。", "你在认真思考。这很有价值。", "有自己的观点真好。", "你从不同角度思考。很棒。", "你的表达能力在成长。", "Lesser-kun关注着你的进步。"],
  },
  de: {
    g12: ["Alles gut.", "Lass dir Zeit.", "Toll. Erzähl mir mehr.", "Das machst du super.", "Alles ist okay. Was magst du.", "Was hast du heute gegessen.", "Was ist dein Lieblingsspiel.", "Lesser-kun mag deine Stimme.", "Das macht Spass.", "Auch ein Wort ist toll."],
    g34: ["Alles gut. Du schaffst das.", "Lass dir Zeit. Lesser-kun wartet.", "Sag einfach, was du denkst.", "Fehler sind okay. Lass es uns versuchen.", "Erzähl mir von etwas, das du magst.", "Was hast du heute gegessen. Ich will es wissen.", "Was ist dein Lieblingsspiel. Erzähl es Lesser-kun.", "Hier kannst du über alles reden.", "Deine Stimme ist schön. Erzähl mehr.", "Lesser-kun ist immer auf deiner Seite."],
    g58: ["Keine Sorge. Sprich in deinem Tempo.", "Lass dir Zeit. Ich höre zu.", "Versuch deine Gedanken in Worte zu fassen.", "Fehler sind normal. Hauptsache du versuchst es.", "Was hat dich in letzter Zeit interessiert.", "Du denkst gründlich nach. Das ist toll.", "Du drückst dich gut aus.", "Interessanter Blickwinkel. Erzähl mehr.", "Lesser-kun unterstützt dich.", "Ich freue mich, deine Gedanken zu hören."],
    g912: ["Keine Eile. Denk in Ruhe nach.", "Nimm dir Zeit. Überleg dir gut.", "Versuch deine Ideen in Worte zu fassen.", "Es muss nicht perfekt sein. Der Versuch zählt.", "Was beschäftigt dich gerade.", "Du denkst sorgfältig nach. Das ist wertvoll.", "Es ist toll, dass du eigene Meinungen hast.", "Du betrachtest verschiedene Seiten. Gut gemacht.", "Deine Ausdrucksfähigkeit wächst.", "Lesser-kun begleitet deine Entwicklung."],
  },
};

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
    const LANG_CODES: Record<Lang, string> = { ja: "ja-JP", en: "en-US", pt: "pt-BR", vi: "vi-VN", ru: "ru-RU", zh: "zh-CN", de: "de-DE" };
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
        const FALLBACK_LANGS: Record<Lang, string> = { ja: "ja-JP", en: "en-US", pt: "pt-BR", vi: "vi-VN", ru: "ru-RU", zh: "zh-CN", de: "de-DE" };
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

      const gKey = GRADE_TO_KEY[gradeLevel] || "g34";
      const encouragements = ENCOURAGEMENTS[language]?.[gKey] || ENCOURAGEMENTS.ja.g34;
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
      ru: "Привет. Я Лессер-кун, красная панда. О чём поговорим сегодня. Расскажи мне о том, что тебе нравится, или что произошло сегодня.",
      zh: "你好。我是小熊猫Lesser-kun。今天我们聊什么呢。告诉我你喜欢的东西，或者今天发生了什么事吧。",
      de: "Hallo. Ich bin Lesser-kun, ein roter Panda. Worüber wollen wir heute sprechen. Erzähl mir von etwas, das du magst, oder was heute passiert ist.",
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

          {/* Monosashi detail explanation */}
          <details className="bubble-card">
            <summary className="font-black text-slate-400 text-sm cursor-pointer">{UI.aboutMonosashi[uiLang]}</summary>
            <div className="mt-4 space-y-5">
              {/* Introduction */}
              <p className="text-sm text-slate-500 leading-relaxed">{MONOSASHI_DETAIL[uiLang].intro}</p>

              {/* Stages */}
              <div>
                <h4 className="font-black text-violet-500 text-sm mb-3">{UI.stagePosition[uiLang]}</h4>
                <div className="space-y-2">
                  {MONOSASHI_DETAIL[uiLang].stages.map((s, i) => (
                    <div key={i} className={`rounded-2xl p-3 border-l-4 ${
                      ["border-slate-300 bg-slate-50/50", "border-blue-300 bg-blue-50/50", "border-green-300 bg-green-50/50", "border-amber-300 bg-amber-50/50", "border-purple-300 bg-purple-50/50", "border-pink-300 bg-pink-50/50"][i]
                    }`}>
                      <div className="font-black text-xs text-slate-600 mb-1">{s.label}</div>
                      <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div>
                <h4 className="font-black text-pink-500 text-sm mb-2">{UI.stepPosition[uiLang]}</h4>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">{MONOSASHI_DETAIL[uiLang].stepsIntro}</p>
                <div className="grid grid-cols-2 gap-2">
                  {MONOSASHI_DETAIL[uiLang].steps.map((s, i) => (
                    <div key={i} className="rounded-xl bg-white/60 p-2.5 border border-white/80">
                      <div className="font-black text-xs text-pink-400 mb-0.5">{s.label}</div>
                      <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source */}
              <p className="text-xs text-slate-300 italic">{MONOSASHI_DETAIL[uiLang].source}</p>
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
      "小1〜小2段階": { ja: "小1〜小2段階", en: "Grade 1-2", pt: "1º-2º ano", vi: "Lớp 1-2", zh: "1-2年级", de: "Klasse 1-2", ru: "1-2 класс" },
      "小3〜小4段階": { ja: "小3〜小4段階", en: "Grade 3-4", pt: "3º-4º ano", vi: "Lớp 3-4", zh: "3-4年级", de: "Klasse 3-4", ru: "3-4 класс" },
      "小5〜中2段階": { ja: "小5〜中2段階", en: "Grade 5-8", pt: "5º-8º ano", vi: "Lớp 5-8", zh: "5-8年级", de: "Klasse 5-8", ru: "5-8 класс" },
      "中3〜高校段階": { ja: "中3〜高校段階", en: "Grade 9-12", pt: "9º ano-Ensino Médio", vi: "Lớp 9-12", zh: "9-12年级", de: "Klasse 9-12", ru: "9-12 класс" },
    };
    const LANG_COLORS: Record<Lang, string> = {
      ja: "from-orange-400 to-pink-400",
      en: "from-blue-400 to-indigo-400",
      pt: "from-green-400 to-teal-400",
      vi: "from-red-400 to-yellow-400",
      ru: "from-sky-400 to-blue-500",
      zh: "from-red-500 to-amber-500",
      de: "from-yellow-500 to-red-500",
    };

    return (
      <div className="flex-1 flex flex-col">
        {/* Top-right UI language dropdown */}
        <div className="flex justify-end p-4">
          <select
            value={uiLang}
            onChange={(e) => setUiLang(e.target.value as Lang)}
            className="px-3 py-1.5 rounded-xl border-2 border-slate-100 bg-white/80 text-slate-500 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-violet-300 cursor-pointer"
          >
            {(["ja", "en", "pt", "vi", "ru", "zh", "de"] as const).map((l) => (
              <option key={l} value={l}>{LANG_NAMES[l][l]}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
          <div className="text-center max-w-lg w-full">
            {/* Mascot */}
            <div className="animate-float inline-block">
              <Image src="/red-panda.webp" alt="Lesser-kun" width={120} height={120} className="mx-auto rounded-full shadow-xl ring-4 ring-orange-200/50" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-black mt-4 mb-1 bg-gradient-to-r from-orange-400 via-pink-400 to-violet-400 bg-clip-text text-transparent pb-2 leading-tight" style={{ WebkitTextFillColor: "transparent" }}>
              Caring AI
            </h1>
            <p className="text-base text-slate-400 mb-1 font-bold">{UI.subtitle[uiLang]}</p>
            <p className="text-slate-400/70 mb-6 text-sm">
              {UI.description[uiLang]}
            </p>

            {/* Conversation language - card grid */}
            <div className="mb-5">
              <label className="text-xs text-slate-400 font-black block mb-3 tracking-wide">
                {uiLang === "ja" ? "おはなしの言語" : uiLang === "pt" ? "Idioma da conversa" : uiLang === "vi" ? "Ngôn ngữ trò chuyện" : uiLang === "ru" ? "Язык беседы" : uiLang === "zh" ? "对话语言" : uiLang === "de" ? "Gesprächssprache" : "Conversation Language"}
              </label>
              <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
                {(["ja", "en", "pt", "vi", "ru", "zh", "de"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={`rounded-2xl py-3 px-2 text-center transition-all ${
                      language === l
                        ? `bg-gradient-to-br ${LANG_COLORS[l]} text-white shadow-lg scale-105 ring-2 ring-white`
                        : "bg-white/70 text-slate-400 border-2 border-slate-100 hover:bg-white/90"
                    }`}
                  >
                    <div className="text-sm font-black">{LANG_NAMES[l][l]}</div>
                    {l !== uiLang && (
                      <div className={`text-xs mt-0.5 ${language === l ? "text-white/80" : "text-slate-300"}`}>{LANG_NAMES[l][uiLang]}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade selector */}
            <div className="mb-6 max-w-xs mx-auto">
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
