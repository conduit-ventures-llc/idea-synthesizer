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

INPUT QUESTIONS — the user answered these 7 questions:
- q1_person_helped: A specific person they helped recently — their struggle and what changed.
- q2_hard_way: What they figured out the hard way that they wish someone had told them.
- q3_should_charge: What people say they should teach/write a book about/charge for.
- q4_costly_mistake: The painful mistake people make without this knowledge — cost in money, time, heartache.
- q5_scale: What would need to exist to help 1,000 people without burning out.
- q6_guilt: Whether they feel uncomfortable charging for this.
- q7_fire: The idea they would talk about for an hour around a fire.

NONPROFIT DETECTION:
If the answers mention nonprofit, volunteer, charity, ministry, church service, or similar — set is_nonprofit to true and adjust all scenarios to reflect grant-funded, donation-based, or social enterprise models rather than direct client billing.

CALCULATION METHOD:
- Scenario A (Side Income): Conservative. 5-10 clients/month at a low price point. $500-2,000/month.
- Scenario B (Replace Salary): Moderate. 20-50 clients or a course/membership model. $4,000-10,000/month. This is "the_one_number".
- Scenario C (Build Something Real): Ambitious. Scaled product, team, partnerships. $15,000-50,000+/month.

For number_basis: Explain the math behind the_one_number. Format: "Based on [their domain/expertise] serving [the type of person from Q1] at [price point] x [number of clients]". Be specific.

For comparable_experts: Find 3 real-world examples of people with similar backgrounds who monetized similar expertise. Include their background, what they earn, and what they do. These should feel achievable, not celebrity-level.

For three_people: Describe three SPECIFIC humans. Each needs:
- name: A realistic first name
- situation: Their current life situation
- problem: The specific problem they have that the expert can solve
- where_to_find: Exactly where to find this person (specific subreddit, LinkedIn group, local venue, etc.)
- opening_line: A conversational message the expert could send to this person right now

For three_scenarios: Each scenario needs:
- label: "Scenario A — Side Income", "Scenario B — Replace Your Salary", "Scenario C — Build Something Real"
- description: What this looks like
- monthly: The monthly income
- steps: 4-6 concrete steps to get there

For guilt_response: If q6_guilt indicates discomfort, guilt, or hesitation about charging — write a warm, direct, personal response that addresses their specific fear. Reference their exact words. If q6_guilt shows no guilt (e.g., "No", "I'm fine with it"), set this to null.

For turnkey_pack: Generate all 4 items:
- first_email: { subject, body } — A ready-to-send email to their first potential client. Use their specific expertise from the intake.
- linkedin_post: A ready-to-post LinkedIn update announcing their offering. 150-200 words.
- one_page_description: A one-page description of their offering suitable for a website or PDF. 200-300 words.
- seven_day_plan: 7 items, one per day. Each { day: 1-7, action: "specific action" }. Day 1 is always "Talk to 3 people who have the problem from Q1."

For wow_letter: Generate 200-300 words. This is the most important part. Rules:
- Acknowledge the fear BEFORE the opportunity
- Use their EXACT words from the intake — quote them back
- Name the specific person from Q1 by referencing their situation
- Address Q6 guilt directly if present
- End with ONE specific action this week
- Never sound like AI. Sound like the most insightful person they have ever met.
- Write in second person ("you"), warm but direct
- Break into 3-4 paragraphs

For vertical_name: Create a compelling product/brand name. Short, memorable, professional.
For vertical_description: One sentence that would work as a tagline.

For closing_line: Always use exactly this: "You already did the hard part. You lived it. Now let it work for you."

OUTPUT FORMAT: Return ONLY valid JSON. No markdown. No code fences. No preamble.
{
  "the_one_number": "$X,XXX/month",
  "number_basis": "Based on [domain] serving [person type] at $X x Y clients/month",
  "three_people": [
    { "name": "...", "situation": "...", "problem": "...", "where_to_find": "...", "opening_line": "..." },
    { "name": "...", "situation": "...", "problem": "...", "where_to_find": "...", "opening_line": "..." },
    { "name": "...", "situation": "...", "problem": "...", "where_to_find": "...", "opening_line": "..." }
  ],
  "three_scenarios": [
    { "label": "Scenario A — Side Income", "description": "...", "monthly": "$X,XXX", "steps": ["...", "..."] },
    { "label": "Scenario B — Replace Your Salary", "description": "...", "monthly": "$X,XXX", "steps": ["...", "..."] },
    { "label": "Scenario C — Build Something Real", "description": "...", "monthly": "$XX,XXX", "steps": ["...", "..."] }
  ],
  "comparable_experts": [
    { "background": "...", "earning": "$X,XXX/month", "doing": "..." },
    { "background": "...", "earning": "$X,XXX/month", "doing": "..." },
    { "background": "...", "earning": "$X,XXX/month", "doing": "..." }
  ],
  "guilt_response": "..." or null,
  "turnkey_pack": {
    "first_email": { "subject": "...", "body": "..." },
    "linkedin_post": "...",
    "one_page_description": "...",
    "seven_day_plan": [
      { "day": 1, "action": "Talk to 3 people who have the problem..." },
      { "day": 2, "action": "..." },
      { "day": 3, "action": "..." },
      { "day": 4, "action": "..." },
      { "day": 5, "action": "..." },
      { "day": 6, "action": "..." },
      { "day": 7, "action": "..." }
    ]
  },
  "wow_letter": "200-300 words...",
  "vertical_name": "...",
  "vertical_description": "...",
  "is_nonprofit": false,
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
    const promptLabels: Record<string, string> = {
      q1_person_helped: "Person they helped recently (Q1)",
      q2_hard_way: "What they figured out the hard way (Q2)",
      q3_should_charge: "What people say they should charge for (Q3)",
      q4_costly_mistake: "The costly mistake people make without their knowledge (Q4)",
      q5_scale: "How to help 1,000 people without burning out (Q5)",
      q6_guilt: "Discomfort about charging (Q6)",
      q7_fire: "The fire pit idea (Q7)",
    };

    const answerLines = Object.entries(answers as Record<string, string>)
      .map(([key, value]) => {
        return `${promptLabels[key] || `Answer (${key})`}: ${value}`;
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
      maxTokens: 4000,
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
