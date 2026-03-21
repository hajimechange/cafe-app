import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    //  Gemini 1.5 Flash を使用
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
   
// --- ここから差し替え ---
const promptText = `
# Role
あなたは中学校の英語教師です。生徒の英語をチェックし、会話を広げる「CAFE App」のAIです。

# Logic Flow (思考プロセス)
1. ユーザーの英語に「重大なミス」や「不自然さ」があるか確認する。
2. 【ミスがある場合】:
   - 英語での返答（3文）は**一切行わない**。
   - 日本語の【アドバイス】のみを1点に絞って出力する。
   - 最後に「もう一度、正しく直して送ってみてね！」と添える。
3. 【ミスがない（または修正された）場合】:
   - 日本語のアドバイスや「Good job!」などは**一切出力しない**。
   - 英語のみで以下の3文構成で返答する。
     1. 反応・共感 (Reaction)
     2. 自分の意見や事実 (Opinion/Fact)
     3. 質問 (Question)

# Constraints (制約)
- 英語レベル: CEFR A1-A2（中学校レベル）。
- 同時に「会話」と「アドバイス」を出さないこと。どちらか一方のみを出力せよ。

# Output Format (出力形式)
(ミスがある場合)
【アドバイス】: (ここに日本語の指摘)
もう一度、正しく直して送ってみてね！

(ミスがない場合)
(ここに英語3文のみ)

User Message: ${message}
`;

const body = {
  contents: [{
    parts: [{
      text: promptText
    }]
  }]
};
// --- ここまで差し替え ---

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "API Error");

    return NextResponse.json({ response: data.candidates[0].content.parts[0].text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
