import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    // 1. キーの前後の空白を徹底的に取り除く
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({ response: "APIキーが設定されていません。" });
    }

    // 2. 最も安定して疎通する「v1beta + gemini-1.5-flash-latest」を使用
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const promptText = `
Role: 中学校の英語教師。
# Logic:
1. ユーザーの英語にミスがあれば日本語の【アドバイス】のみ出力。英語の返答はしない。
2. ミスがなければ英語のみで「1.反応 2.意見 3.質問」の3文構成で出力。日本語は書かない。
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

    // 3. エラーが出た場合、その中身を画面に詳しく出す
    if (data.error) {
      console.error("Gemini API Error Detail:", data.error);
      return NextResponse.json({ response: `API Error: ${data.error.message} (Code: ${data.error.code})` });
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      return NextResponse.json({ response: "AIの返答が空でした。再度試してください。" });
    }

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    return NextResponse.json({ response: "サーバーで致命的なエラーが発生しました。" });
  }
}
