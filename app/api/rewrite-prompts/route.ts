import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const BASE_PROMPTS = {
  q2: "Has anyone ever said to you: you should teach this, or write a book about this? What was the topic?",
  q3: "Think about someone who is right where you were 5 years ago \u2014 same struggle, same confusion, same starting point. What is the one piece of advice, shortcut, or insight you wish someone had given you?",
  q4: "If you were at a fire pit with your closest friends for one hour talking about any idea \u2014 what would it be?",
  q5: "If 1,000 people needed what you know \u2014 could you help all of them personally?",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answer_1 } = body;

    if (!answer_1 || typeof answer_1 !== "string" || !answer_1.trim()) {
      return NextResponse.json({ error: "Missing answer_1" }, { status: 400 });
    }

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: `The user just told you: "${answer_1}"

Rewrite the following 4 questions so they feel like they were written specifically for this person and this idea. Keep the same intent of each question but change every word so it speaks directly to their context.

The original questions:
Q2: ${BASE_PROMPTS.q2}
Q3: ${BASE_PROMPTS.q3}
Q4: ${BASE_PROMPTS.q4}
Q5: ${BASE_PROMPTS.q5}

Return as JSON: {"q2": "", "q3": "", "q4": "", "q5": ""}
No preamble. JSON only.`,
      prompt: "Rewrite the questions now.",
      maxTokens: 800,
    });

    let parsed;
    try {
      let text = result.text.trim();
      const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenceMatch) {
        text = fenceMatch[1].trim();
      }
      parsed = JSON.parse(text);
    } catch {
      // Fallback to originals if parsing fails
      return NextResponse.json({ prompts: BASE_PROMPTS });
    }

    return NextResponse.json({
      prompts: {
        q2: parsed.q2 || BASE_PROMPTS.q2,
        q3: parsed.q3 || BASE_PROMPTS.q3,
        q4: parsed.q4 || BASE_PROMPTS.q4,
        q5: parsed.q5 || BASE_PROMPTS.q5,
      },
    });
  } catch (err) {
    console.error("[rewrite-prompts] Error:", err);
    // Fallback to originals on any error
    return NextResponse.json({ prompts: BASE_PROMPTS });
  }
}
