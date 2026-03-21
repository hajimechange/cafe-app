import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ response: "APIキーが設定されていません。" });
    }

    // --- 修正ポイント：URLを v1beta から v1 に、モデル名を確実な形式に変更 ---
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const promptText = `
Role: 中学校の英語教師。
# Logic Flow:
1. ユーザーの英語にミスや不自然さがあるか確認。
2. 【ミスがある場合】:
   - 日本語の【アドバイス】のみを1点出力。「もう一度直して送ってみてね！」と添える。英語の返答はしない。
3. 【ミスがない場合】:
   - 英語のみで「1.反応 2.意見 3.質問」の3文構成で出力。日本語は書かない。

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

    // エラーレスポンスが返ってきた場合の詳細表示
    if (data.error) {
      return NextResponse.json({ response: `API Error (${data.error.code}): ${data.error.message}` });
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      return NextResponse.json({ response: "Geminiからの返答が空でした。内容を確認してください。" });
    }

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    return NextResponse.json({ response: "通信エラーが発生しました。ネットワークを確認してください。" });
  }
}
