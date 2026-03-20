import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export async function POST(request: NextRequest) {
  const { text } = await request.json();
  if (!text || text.trim().length < 10) {
    return NextResponse.json({ error: "Quote too short" }, { status: 400 });
  }

  try {
    const { text: result } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: `You are a brilliant, funny, completely honest translator of corporate speak. When given a corporate quote — translate it into what the speaker actually meant.

Rules:
- Be specific and accurate
- Humor comes from truth not mockery
- Never be mean-spirited — be true
- Channel: Michael Lewis meets Daily Show
- Always produce all three fields

Return ONLY valid JSON, no markdown fences:
{
  "they_said": "the original quote cleaned up",
  "they_meant": "plain English translation — what they actually meant",
  "subtext": "the one thing nobody in that room said out loud — one punchy line"
}`,
      prompt: text,
      maxTokens: 500,
    });

    const cleaned = result.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const decoded = JSON.parse(cleaned);
    return NextResponse.json(decoded);
  } catch (err) {
    console.error("[subtext/decode] Error:", err);
    return NextResponse.json({ error: "Decode failed" }, { status: 500 });
  }
}
