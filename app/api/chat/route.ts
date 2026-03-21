import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({ response: "APIキーが設定されていません。" });
    }

    // --- 修正ポイント：リストに存在した「gemini-2.5-flash」を正確に指定 ---
    const model = "gemini-2.5-flash";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const promptText = `
Role: 中学校の英語教師。生徒の英語をチェックし、会話を広げる「CAFE App」のAIです。
# Logic:
1. ユーザーの英語にミスや不自然さがあるか確認.
2. 【ミスがある場合】:
   - 日本語の【アドバイス】を1点出力。「もう一度直して送ってみてね！」と添える。英語の返答はしない。
3. 【ミスがない場合】:
   - 日本語は一切書かず、英語のみで以下の3文構成で返答する。
     1. Reaction (反応・共感)
     2. Opinion/Fact (自分の意見や事実)
     3. Question (質問)

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
      // 429エラーなどが出た場合の対策
      return NextResponse.json({ 
        response: `API Error: ${data.error.message} (Code: ${data.error.code})` 
      });
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      return NextResponse.json({ response: "AIからの返答が空でした。" });
    }

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    return NextResponse.json({ response: "通信エラーが発生しました。" });
  }
}
