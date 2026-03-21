import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({ response: "Error: APIキーが読み込めていません。" });
    }

    // 1. まず、このAPIキーで「本当に使えるモデル」をGoogleに問い合わせる (診断モード)
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listRes = await fetch(listUrl);
    const listData = await listRes.json();

    if (listData.error) {
      return NextResponse.json({ response: `API Key Error: ${listData.error.message}` });
    }

    // 2. 利用可能なモデル名の中から、flash または pro を探す
    // ※ ここでGoogleが返してきた「正しい名前」を自動で選択します
    const availableModels = listData.models || [];
    const targetModel = availableModels.find((m: any) => 
      m.name.includes('gemini-1.5-flash') || m.name.includes('gemini-pro')
    );

    if (!targetModel) {
      return NextResponse.json({ 
        response: `利用可能なモデルが見つかりません。リスト取得結果: ${JSON.stringify(availableModels.map((m:any) => m.name))}` 
      });
    }

    // 3. 特定した「正しいモデル名」を使って実行
    const modelName = targetModel.name; // 例: "models/gemini-1.5-flash"
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

    const promptText = `
Role: 中学校の英語教師。
# Logic:
1. 英語にミスがあれば日本語の【アドバイス】のみ出力。
2. ミスがなければ英語のみで「1.反応 2.意見 3.質問」の3文で出力.
User Message: ${message}
`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: promptText }] }]
      }),
    });

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      return NextResponse.json({ response: `診断成功(Model: ${modelName})。しかし返答が空でした。Error: ${JSON.stringify(data.error || "unknown")}` });
    }

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    return NextResponse.json({ response: "通信エラーが発生しました。" });
  }
}
