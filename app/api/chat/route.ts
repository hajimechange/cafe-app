import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    // 河合さんの環境で動作確認済みの 2.5-flash を使用
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

   
// --- ここから差し替え ---
const promptText = `
Role: 親しみやすい中学校の英語の先生。
# 鉄の掟 (Strict Rules):
1. [English Response]: 英語の返答は、以下の3文構成（合計30語以内）にすること。
   - 1文目：生徒への共感や反応 (Reaction)
   - 2文目：自分の意見や短い事実 (Opinion/Fact)
   - 3文目：生徒への簡単な質問 (Question)
2. [English Level]: 中学校レベルの英単語・文法（CEFR A1-A2）のみ使用。
3. [Feedback]: 生徒の英語に不自然さやミスがある場合、最も重要な1点に絞り、日本語で【アドバイス】を記述。指摘後は「もう一度直して送ってみてね！」と促すこと。ミスがなければ「Good job!」と一言添える。

# 出力形式 (Format):
[English Response]
(ここに英語3文)

[日本語アドバイス]
(ここに日本語1点集中アドバイス)

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
