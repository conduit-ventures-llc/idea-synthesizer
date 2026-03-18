import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { findMatchingResources, buildResourceLinksData } from "@/lib/resource-links";

const SYSTEM_PROMPT = `You are the Conduit Ventures Idea Synthesizer. Your job is to take someone's raw answers about their expertise and generate a Monetization Map — a structured, honest, and encouraging analysis of how they could turn their knowledge into income.

GUARDRAILS — STRICT:
Only generate Monetization Maps for ideas that:
- Solve a real problem
- Help someone create, build, or grow
- Would pass this test: would you be proud to tell Brother Nick about it?

Never generate maps for gambling, adult content, drugs, weapons, or anything that conflicts with the dignity of the person. If the idea fails these tests, return an error.

CALCULATION METHOD:
- Scenario A (Side Income): Conservative. 5-10 clients/month at a low price point. $500-2,000/month.
- Scenario B (Replace Salary): Moderate. 20-50 clients or a course/membership model. $4,000-10,000/month. This is "the_one_number".
- Scenario C (Build Something Real): Ambitious. Scaled product, team, partnerships. $15,000-50,000+/month.

Be specific. Use real numbers. Reference their actual answers.

For three_people: describe three SPECIFIC humans (with a name, a situation, and why they need this). Not demographics — people.

For path_to_first_dollar: give 4 concrete weekly actions for the first month. Week 1 should always be "Expert Interview" — talk to 3 people who have the problem.

For your_week: write 3-4 sentences showing what their actual week looks like once this is running. Be SPECIFIC to their vertical — not generic. Show exactly how little time they spend vs. what AI handles for them. Reference their specific expertise. Example for a coaching dad: "You record your system once — two hours on a Sunday afternoon. AI handles every parent who needs it after that. Tuesday nights you coach. Wednesday morning your AI answered 12 questions while you slept."

For vertical_name: create a compelling product/brand name. Short, memorable, professional.
For vertical_description: one sentence that would work as a tagline.

For closing_line: always use exactly this: "You already did the hard part. You lived it. Now let it work for you."

OUTPUT FORMAT: Return ONLY valid JSON. No markdown. No code fences. No preamble.
{
  "the_one_number": "$X,XXX/month",
  "three_people": ["Person 1 description", "Person 2 description", "Person 3 description"],
  "three_scenarios": [
    { "label": "Scenario A — Side Income", "description": "...", "monthly": "$X,XXX" },
    { "label": "Scenario B — Replace Your Salary", "description": "...", "monthly": "$X,XXX" },
    { "label": "Scenario C — Build Something Real", "description": "...", "monthly": "$XX,XXX" }
  ],
  "path_to_first_dollar": [
    { "week": 1, "action": "Expert Interview — talk to 3 people who have this problem" },
    { "week": 2, "action": "..." },
    { "week": 3, "action": "..." },
    { "week": 4, "action": "..." }
  ],
  "your_week": "3-4 sentences specific to their vertical...",
  "vertical_name": "...",
  "vertical_description": "...",
  "closing_line": "You already did the hard part. You lived it. Now let it work for you."
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers, expert_type, refine_instruction } = body;

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ error: "No answers provided" }, { status: 400 });
    }

    // Build user message from answers
    const answerLines = Object.entries(answers as Record<string, string>)
      .map(([key, value]) => {
        if (key === "blueprint") return `Blueprint request: ${value}`;
        const promptLabels: Record<string, string> = {
          "0": "Problem they solved",
          "1": "What people say they should teach",
          "2": "Advice they wish someone had given them 5 years ago",
          "3": "Fire pit conversation topic",
          "4": "Can they help 1,000 people?",
        };
        return `${promptLabels[key] || `Answer ${key}`}: ${value}`;
      })
      .join("\n\n");

    // Expert type tailoring
    const expertTypeDescriptions: Record<string, string> = {
      teacher: "This person is a Teacher type — they love to explain, break down complex topics, and educate. Tailor the Monetization Map toward teaching, courses, workshops, and educational content.",
      performer: "This person is a Performer type — they love to engage, entertain, and hold attention. Tailor the Monetization Map toward live events, speaking, content creation, and audience-driven models.",
      coach: "This person is a Coach type — they love to train, mentor, and guide people through transformation. Tailor the Monetization Map toward coaching programs, accountability groups, and 1-on-1 services.",
      analyst: "This person is an Analyst type — they love to solve problems, work with data, and build systems. Tailor the Monetization Map toward consulting, tools, templates, and systematic solutions.",
      connector: "This person is a Connector type — they love to network, introduce people, and build communities. Tailor the Monetization Map toward community platforms, partnerships, events, and referral-based models.",
      creator: "This person is a Creator type — they love to make things, design, and build from scratch. Tailor the Monetization Map toward digital products, design services, and creative offerings.",
    };

    let expertContext = "";
    if (expert_type && expertTypeDescriptions[expert_type]) {
      expertContext = `\n\nEXPERT TYPE: ${expertTypeDescriptions[expert_type]}`;
    }

    let refineContext = "";
    if (refine_instruction) {
      refineContext = `\n\nREFINEMENT REQUEST: The user wants you to adjust the Monetization Map with this instruction: "${refine_instruction}". Regenerate the full map with this adjustment applied.`;
    }

    const userMessage = `Here are this person's answers. Generate their Monetization Map.\n\n${answerLines}${expertContext}${refineContext}`;

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SYSTEM_PROMPT,
      prompt: userMessage,
      maxTokens: 2000,
    });

    // Parse JSON from response
    let mapData;
    try {
      // Strip any markdown code fences if present
      let text = result.text.trim();
      const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenceMatch) {
        text = fenceMatch[1].trim();
      }
      mapData = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "We couldn\u2019t parse the generated map. Please try again." },
        { status: 500 }
      );
    }

    // Find matching resource links based on the full generated text
    const fullText = result.text + " " + Object.values(answers as Record<string, string>).join(" ");
    const matchedResources = findMatchingResources(fullText);
    const resourceLinks = buildResourceLinksData(matchedResources);

    return NextResponse.json({ map: mapData, resourceLinks });
  } catch (err) {
    console.error("[generate-map] Error:", err);
    return NextResponse.json(
      { error: "We hit a snag generating your map. Please try again." },
      { status: 500 }
    );
  }
}
