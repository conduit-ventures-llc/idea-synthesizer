import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, answers, monetizationMap } = body;

    if (!email || !answers) {
      return NextResponse.json({ error: "Missing email or answers" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[save-idea] RESEND_API_KEY not configured");
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const fromEmail = process.env.EMAIL_FROM || "ideas@conduitventures.com";
    const verticalName = monetizationMap?.vertical_name || "Your Idea";

    // Build email HTML
    const promptLabels: Record<string, string> = {
      "0": "Problem you solved",
      "1": "What people say you should teach",
      "2": "Advice you wish someone had given you 5 years ago",
      "3": "Fire pit conversation topic",
      "4": "Can you help 1,000 people?",
      "blueprint": "Your blueprint request",
    };

    const answersHtml = Object.entries(answers as Record<string, string>)
      .map(([key, value]) => {
        const label = promptLabels[key] || `Question ${key}`;
        return `<div style="margin-bottom:20px;"><p style="font-size:12px;color:#78716C;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">${label}</p><p style="font-size:15px;color:#1C1917;line-height:1.6;">${value}</p></div>`;
      })
      .join("");

    let mapHtml = "";
    if (monetizationMap) {
      const m = monetizationMap;
      mapHtml = `
        <div style="background:#1B2A4A;border-radius:16px;padding:32px;margin:32px 0;text-align:center;">
          <p style="font-size:12px;color:#C8922A;text-transform:uppercase;letter-spacing:0.2em;margin-bottom:8px;">Your Number</p>
          <p style="font-family:'Lora',Georgia,serif;font-size:48px;font-weight:700;color:white;margin-bottom:4px;">${m.the_one_number}</p>
          <p style="font-size:13px;color:rgba(255,255,255,0.6);">per month — Scenario B</p>
        </div>

        <h3 style="font-family:'Lora',Georgia,serif;font-size:18px;color:#1B2A4A;margin-bottom:16px;">Three people who need what you know</h3>
        ${m.three_people.map((p: string, i: number) => `<div style="background:white;border:1px solid #E8E0D8;border-radius:12px;padding:16px;margin-bottom:8px;"><span style="font-size:18px;margin-right:8px;">${["👤", "👩‍💼", "🧑‍🎓"][i]}</span><span style="font-size:14px;color:#1C1917;">${p}</span></div>`).join("")}

        <h3 style="font-family:'Lora',Georgia,serif;font-size:18px;color:#1B2A4A;margin:24px 0 16px;">Three paths forward</h3>
        ${m.three_scenarios.map((s: { label: string; description: string; monthly: string }, i: number) => `<div style="background:${i === 1 ? "#1B2A4A" : "white"};color:${i === 1 ? "white" : "#1C1917"};border:1px solid ${i === 1 ? "#1B2A4A" : "#E8E0D8"};border-radius:12px;padding:16px;margin-bottom:8px;"><div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:12px;color:#C8922A;font-weight:700;text-transform:uppercase;">${s.label}</span><span style="font-family:'Lora',Georgia,serif;font-size:18px;font-weight:700;">${s.monthly}</span></div><p style="font-size:14px;opacity:0.8;">${s.description}</p></div>`).join("")}

        <h3 style="font-family:'Lora',Georgia,serif;font-size:18px;color:#1B2A4A;margin:24px 0 16px;">Your first 30 days</h3>
        ${m.path_to_first_dollar.map((s: { week: number; action: string }) => `<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;"><div style="width:36px;height:36px;border-radius:50%;background:rgba(200,146,42,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-size:11px;font-weight:700;color:#C8922A;">W${s.week}</span></div><p style="font-size:14px;color:#1C1917;padding-top:8px;">${s.action}</p></div>`).join("")}

        ${m.your_week ? `<h3 style="font-family:'Lora',Georgia,serif;font-size:18px;color:#1B2A4A;margin:24px 0 16px;">What your week actually looks like</h3>
        <div style="background:white;border:1px solid #E8E0D8;border-radius:12px;padding:20px;margin-bottom:24px;">
          <p style="font-size:15px;color:#1C1917;line-height:1.6;">${m.your_week}</p>
        </div>` : ""}

        <div style="background:#1B2A4A;border-radius:16px;padding:24px;margin:24px 0;text-align:center;">
          <p style="font-size:12px;color:#C8922A;text-transform:uppercase;letter-spacing:0.2em;margin-bottom:8px;">Your Vertical</p>
          <p style="font-family:'Lora',Georgia,serif;font-size:24px;font-weight:700;color:white;margin-bottom:8px;">${m.vertical_name}</p>
          <p style="font-size:14px;color:rgba(255,255,255,0.7);">${m.vertical_description}</p>
        </div>

        <p style="font-family:'Lora',Georgia,serif;font-size:20px;color:#C8922A;font-style:italic;text-align:center;margin:32px 0;line-height:1.5;">"${m.closing_line}"</p>
      `;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family:'DM Sans',system-ui,sans-serif;background:#FAF6F0;margin:0;padding:40px 20px;">
        <div style="max-width:600px;margin:0 auto;">
          <div style="text-align:center;margin-bottom:32px;">
            <p style="font-family:'Lora',Georgia,serif;font-size:20px;font-weight:700;color:#1B2A4A;">Conduit Ventures</p>
            <p style="font-size:13px;color:#78716C;">The Idea Synthesizer</p>
          </div>

          <div style="background:white;border:1px solid #E8E0D8;border-radius:16px;padding:32px;">
            <h2 style="font-family:'Lora',Georgia,serif;font-size:24px;color:#1B2A4A;margin-bottom:24px;">Your answers</h2>
            ${answersHtml}
          </div>

          ${mapHtml}

          <div style="text-align:center;margin-top:40px;padding:24px;background:#1B2A4A;border-radius:16px;">
            <p style="font-size:16px;color:white;font-weight:700;margin-bottom:8px;">Ready to build this?</p>
            <p style="font-size:14px;color:rgba(255,255,255,0.7);">Reply to this email and let's start.</p>
          </div>

          <p style="text-align:center;font-size:11px;color:#78716C;margin-top:24px;">&copy; ${new Date().getFullYear()} Conduit Ventures LLC</p>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Your idea — ${verticalName} — saved by Conduit Ventures`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[save-idea] Error:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
