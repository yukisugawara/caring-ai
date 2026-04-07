import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildAnalyzePrompt(gradeLevel: string, language: string): string {
  const targetLang = language === "en" ? "English" : "Japanese";
  const langLabel = language === "en" ? "英語" : "日本語";

  return `あなたは「ことばの力のものさし」（文部科学省, 2025年）に基づいて、\
児童生徒の${langLabel}の発話を評価する専門家です。

対話型AIとの会話から抽出された児童生徒の発話テキスト（${targetLang}）が与えられます。
対象の学年段階は「${gradeLevel}」です。
「聞く・話す」の観点から、以下の2つの軸で評価してください。
※ 「ことばの力のものさし」は多言語に対応した枠組みです。${targetLang}の発話に対しても同じステージ基準を適用してください。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 軸1: 包括的なことばの発達ステージ（A〜F）
思考・判断・表現を支える包括的なことばの力（複数言語での力）を「聞く・話す」の観点から判定します。

- ステージA【イマココ期】: 対話による支援を得て、身近なことや経験したことについて覚えている場面を断片的に話せる。ごく簡単な質問に答えられる。
- ステージB【イマココから順序期】: 対話による支援を得て、身近なことや経験したことについて順序にそっておおまかに話せる。ひとこと程度の感想が言える。
- ステージC【順序期】: 自分に関係のあることや体験したことについて順序にそってくわしく話せる。感想とその理由が言える。
- ステージD【因果期】: 教科学習内容の基本的な概念について因果関係を含めて説明できる。具体的な事例とともに理由を挙げながら自分の意見を述べられる。
- ステージE【抽象期】: 抽象的な概念について事実と意見の違いを意識しつつ議論できる。構成を意識したプレゼンテーションができる。
- ステージF【評価・発展期】: 多角的・批判的視点をもった議論ができる。論理的構成を意識し説得力のある意見を述べられる。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 軸2: ${langLabel}の習得ステップ（1〜8）
${langLabel}固有の知識・技能の習得状況を評価します。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 追加の分析観点
- コミュニケーション方略: 言い換えや迂回表現の使用
- コードスイッチング: L1/L2の混用パターン
- 相互行為能力: 応答の適切さ、相槌の使用
- 言語的創造性: 創造的な表現、言葉遊び

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 出力フォーマット（厳守）
挨拶・前置き・説明文などは一切含めず、純粋な JSON だけを出力してください。
フィードバックはすべて日本語で記述してください。

\`\`\`json
{
  "stage": "<A〜Fのいずれか>",
  "stage_name": "<ステージの名称>",
  "stage_reasoning": "<ステージ判定の根拠（日本語、2〜3文）>",
  "step": <1〜8の整数>,
  "step_reasoning": "<ステップ判定の根拠（日本語、2〜3文）>",
  "communication_strategies": "<コミュニケーション方略の分析（日本語、1〜2文）>",
  "code_switching": "<コードスイッチングの分析（日本語、1〜2文）>",
  "interactive_competence": "<相互行為能力の分析（日本語、1〜2文）>",
  "linguistic_creativity": "<言語的創造性の分析（日本語、1〜2文）>",
  "strengths": "<この児童の強み（日本語、2〜3文）>",
  "next_goals": "<次の目標（日本語、2〜3文）>",
  "support_suggestions": "<支援のアドバイス（日本語、2〜3文）>",
  "encouragement": "<子ども本人へのやさしい励ましメッセージ（日本語、1〜2文、ひらがな多め）>"
}
\`\`\``;
}

export async function POST(req: NextRequest) {
  const { transcript, gradeLevel, language } = await req.json();

  const systemPrompt = buildAnalyzePrompt(gradeLevel, language || "ja");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: transcript }],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "";

  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const textToParse = match ? match[1].trim() : raw.trim();

  try {
    const result = JSON.parse(textToParse);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "分析結果の解析に失敗しました", raw }, { status: 500 });
  }
}
