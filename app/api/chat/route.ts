import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key not found" }, { status: 500 });
    }

    // 安定版の1.5-flashを使用
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const promptText = `
Role: 中学校の英語教師。
# Logic Flow:
1. ユーザーの英語にミスや不自然さがあるか確認せよ。
2. 【ミスがある場合】:
   - 日本語の【アドバイス】のみを1点出力。「もう一度直して送ってみてね！」と添える。
3. 【ミスがない場合】:
   - 英語のみで「1.反応 2.意見 3.質問」の3文構成で出力。

User Message: ${message}
`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      }),
    });

    const data = await response.json();

    // --- ここが修正ポイント：Geminiのデータ構造に厳密に合わせる ---
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      console.error("Gemini Error Detail:", JSON.stringify(data));
      return NextResponse.json({ response: "AIからの返答が空でした。設定を確認してください。" });
    }

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ response: "サーバーでエラーが発生しました。" });
  }
}
