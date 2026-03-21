import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key not found" }, { status: 500 });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const promptText = `
Role: 中学校の英語教師。「CAFE App」のAI講師。
# Logic Flow:
1. ユーザーの英語にミスや不自然さがあるか確認せよ。
2. 【ミスがある場合】:
   - 英語の返答は一切行わない。
   - 【アドバイス】: という見出しで日本語の指摘のみを1点出力。
   - 最後に「もう一度、正しく直して送ってみてね！」と添える。
3. 【ミスがない場合】:
   - 日本語のアドバイスは一切出力しない。
   - 以下の3文構成で英語のみ出力せよ。
     1. 反応・共感 (Reaction)
     2. 自分の意見や事実 (Opinion/Fact)
     3. 質問 (Question)

# Constraints:
- 英語レベル: CEFR A1-A2（中学校レベル）。
- 同時に「会話」と「アドバイス」を出さない。

User Message: ${message}
`;

    const body = {
      contents: [{
        parts: [{ text: promptText }]
      }]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    // Geminiからの返答を抽出
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand.";

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
