import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    // 河合さんの環境で動作確認済みの 2.5-flash を使用
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const body = {
      contents: [{
        parts: [{
          text: `
            Role: Friendly Junior High School English Teacher.
            Constraint 1: Use CEFR A2 level English (simple vocabulary and grammar).
            Constraint 2: Keep responses between 2 to 5 sentences.
            Constraint 3: Encourage the student.
            
            User Message: ${message}
          `
        }]
      }]
    };

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
