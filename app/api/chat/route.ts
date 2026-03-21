import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({ response: "APIキーが設定されていません。" });
    }

    // 1.5-flash は無料枠が広く、429エラーが最も起きにくいモデルです
    const modelName = "models/gemini-1.5-flash";
    const apiUrl = `https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${apiKey}`;

    const promptText = `
Role: 中学校の英語教師。
# Logic:
1. 英語にミスがあれば日本語の【アドバイス】のみ出力。
2. ミスがなければ英語のみで「1.反応 2.意見 3.質問」の3文で出力。
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

    if (data.error) {
      // 429エラーが出た場合、具体的な待ち時間を表示する
      return NextResponse.json({ 
        response: `API制限中です (${data.error.code})。少し時間を置いて再試行してください。理由: ${data.error.message}` 
      });
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      return NextResponse.json({ response: "AIの返答が空でした。もう一度送信してください。" });
    }

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    return NextResponse.json({ response: "通信エラーが発生しました。" });
  }
}
