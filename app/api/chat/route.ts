import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // 1. 環境変数のカンマ区切りキーを配列化
    const rawKeys = process.env.GEMINI_API_KEY || "";
    const apiKeys = rawKeys.split(',').map(k => k.trim()).filter(k => k !== "");

    if (apiKeys.length === 0) {
      return NextResponse.json({ response: "APIキーが設定されていません。Vercelを確認してください。" });
    }

    let lastError = "";

    // 2. 利用可能なキーを順番に試行（ローテーション）
    for (const apiKey of apiKeys) {
      try {
        // --- 修正ポイント：モデル名を最新の gemini-3-flash-preview に変更 ---
        const model = "gemini-3-flash-preview";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
          signal: AbortSignal.timeout(8000) // 8秒でタイムアウトして次のキーへ
        });

        const data = await response.json();

        // 制限(429)やその他のエラーが出た場合、次のキーへ飛ばす
        if (data.error) {
          console.warn(`Key ${apiKey.substring(0, 8)} failed: ${data.error.message}`);
          lastError = data.error.message;
          continue; 
        }

        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiResponse) {
          // 成功したら即座に返信
          return NextResponse.json({ response: aiResponse });
        }

      } catch (e) {
        console.error("Connection error with a key, trying next...");
        continue;
      }
    }

    // 3. 全てのキーが制限に達していた場合
    return NextResponse.json({ 
      response: `現在、アクセスが集中しています。40秒ほど待ってからもう一度送ってみてね！ (Error: ${lastError})` 
    });

  } catch (error) {
    return NextResponse.json({ response: "サーバーで予期せぬエラーが発生しました。" });
  }
}
