import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const SYSTEM_PROMPT = `You are the Conduit Ventures Revenue Stream Advisor. When given a specific revenue stream/scenario from a Monetization Map, you expand it into a detailed, actionable deep dive.

GUARDRAILS — STRICT:
Same as the Idea Synthesizer. Only expand ideas that solve real problems, help people grow, and would pass the Brother Nick test. Reject anything that conflicts with human dignity.

OUTPUT FORMAT: Return ONLY valid JSON. No markdown. No code fences.
{
  "stream_name": "Name of the revenue stream",
  "business_model": {
    "overview": "2-3 sentence summary of the full business model",
    "revenue_type": "one-time | recurring | hybrid",
    "price_range": "$X - $Y",
    "target_customers": "specific description of ideal customer",
    "delivery_method": "how the product/service is delivered",
    "tools_needed": ["tool 1", "tool 2", "tool 3"]
  },
  "first_customer_script": {
    "intro": "Opening line when reaching out to potential first customer",
    "pitch": "2-3 sentence pitch explaining the value",
    "ask": "The specific call-to-action / ask",
    "objection_handling": ["If they say X, respond with Y", "If they say A, respond with B"]
  },
  "pricing_calculator": {
    "base_price": "$X",
    "at_5_clients": "$X/month",
    "at_20_clients": "$X/month",
    "at_50_clients": "$X/month",
    "pricing_notes": "1-2 sentences on pricing strategy"
  },
  "thirty_day_plan": [
    { "day_range": "Days 1-3", "action": "specific action", "outcome": "expected result" },
    { "day_range": "Days 4-7", "action": "specific action", "outcome": "expected result" },
    { "day_range": "Days 8-14", "action": "specific action", "outcome": "expected result" },
    { "day_range": "Days 15-21", "action": "specific action", "outcome": "expected result" },
    { "day_range": "Days 22-30", "action": "specific action", "outcome": "expected result" }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stream_label, stream_description, stream_monthly, context } = body;

    if (!stream_label) {
      return NextResponse.json({ error: "No revenue stream provided" }, { status: 400 });
    }

    const userMessage = `Expand this revenue stream into a detailed deep dive.

Revenue Stream: ${stream_label}
Description: ${stream_description || ""}
Monthly Target: ${stream_monthly || ""}

Context about the person's idea and expertise:
${context || "No additional context provided."}

Generate a detailed, actionable expansion of this specific revenue stream.`;

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SYSTEM_PROMPT,
      prompt: userMessage,
      maxTokens: 2500,
    });

    let diveData;
    try {
      let text = result.text.trim();
      const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenceMatch) {
        text = fenceMatch[1].trim();
      }
      diveData = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Could not parse the revenue stream expansion. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ dive: diveData });
  } catch (err) {
    console.error("[revenue-stream-dive] Error:", err);
    return NextResponse.json(
      { error: "Failed to expand the revenue stream. Please try again." },
      { status: 500 }
    );
  }
}
