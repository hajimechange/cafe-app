import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
    if (!apiKey) return NextResponse.json({ response: "APIキーが設定されていません。" });

    // 【核心】Googleに使用可能なモデルを直接聞き出す
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(listUrl);
    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ response: `APIエラー: ${data.error.message}` });
    }

    // モデル名だけを抜き出して表示する
    const modelNames = data.models?.map((m: any) => m.name).join('\n') || "モデルが見つかりません";

    return NextResponse.json({ 
      response: `【重要：以下の名前のいずれかを使ってください】\n\n${modelNames}` 
    });

  } catch (error) {
    return NextResponse.json({ response: "リスト取得中にエラーが発生しました。" });
  }
}
