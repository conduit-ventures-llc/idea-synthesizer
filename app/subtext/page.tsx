"use client";

import { useState, useRef } from "react";

interface DecodeResult {
  they_said: string;
  they_meant: string;
  subtext: string;
}

const HALL_OF_FAME: DecodeResult[] = [
  { they_said: "We're rightsizing the organization to better align our human capital resources", they_meant: "We're laying off 2,000 people", subtext: "HR wrote this so the CEO wouldn't have to feel bad saying it" },
  { they_said: "We're exploring strategic alternatives", they_meant: "The company is for sale", subtext: "The board already has a buyer — they just haven't told employees yet" },
  { they_said: "We had a miss on our forward guidance", they_meant: "We lost a lot of money", subtext: "The CFO is updating their LinkedIn right now" },
  { they_said: "We're pivoting to focus on our core competencies", they_meant: "Three product lines just got killed", subtext: "The people who built those products found out from this press release" },
  { they_said: "We're committed to a culture of transparency and accountability", they_meant: "Someone got caught and we need to say something", subtext: "The investigation started six months ago — this is just the public part" },
  { they_said: "We're investing in our people", they_meant: "We bought a meditation app subscription and called it a benefit", subtext: "Still no raise though" },
  { they_said: "This was a mutual decision", they_meant: "They were fired", subtext: "The mutuality was: we decided, they left" },
  { they_said: "We're taking a more disciplined approach to spending", they_meant: "The free coffee is gone", subtext: "Also your team is down 3 people and they won't be replaced" },
  { they_said: "We see tremendous opportunity in the AI space", they_meant: "We added 'AI' to our investor deck last week", subtext: "The CTO googled 'what is ChatGPT' in December" },
  { they_said: "Our teams are energized by this new direction", they_meant: "Morale is at an all-time low", subtext: "Three VPs quit last month but we're calling it natural attrition" },
];

export default function SubtextPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [decodesUsed, setDecodesUsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  async function handleDecode() {
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/subtext/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setDecodesUsed((prev) => prev + 1);
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  function formatResultText(r: DecodeResult): string {
    return `They said: "${r.they_said}"\n\nThey meant: "${r.they_meant}"\n\nSubtext: "${r.subtext}"\n\nvia subtextai`;
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(formatResultText(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShareX() {
    if (!result) return;
    const text = encodeURIComponent(
      `"${result.they_said}"\n\nWhat they meant: "${result.they_meant}"\n\n${result.subtext}\n\nvia @subtextai`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  }

  function handleShareLinkedIn() {
    if (!result) return;
    const text = encodeURIComponent(formatResultText(result));
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=https://conduitventures.com/subtext&summary=${text}`,
      "_blank"
    );
  }

  function handleSaveImage() {
    // Future: generate image from result card
    alert("Image export coming soon in Pro.");
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF8" }}>
      {/* Top Bar */}
      <header
        className="flex items-center justify-between px-6"
        style={{ height: 64, borderBottom: "1px solid #E5E5E0" }}
      >
        <div className="flex items-baseline gap-2">
          <span
            className="font-bold"
            style={{ fontFamily: "Lora, Georgia, serif", fontSize: 20, color: "#1A1A1A" }}
          >
            Subtext
          </span>
          <span style={{ fontSize: 13, color: "#9CA3AF" }}>by Conduit Ventures</span>
        </div>
        <a
          href="#"
          className="hover:opacity-80 transition-opacity"
          style={{ fontSize: 13, color: "#D4AF37", fontWeight: 600 }}
        >
          Pro — $9/month
        </a>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1
            className="mb-3"
            style={{
              fontFamily: "Lora, Georgia, serif",
              fontSize: 32,
              color: "#1A1A1A",
              lineHeight: 1.3,
              fontWeight: 700,
            }}
          >
            What they said vs what they meant.
          </h1>
          <p style={{ fontSize: 18, color: "#6B7280", lineHeight: 1.6 }}>
            Corporate speak decoded in real time.
          </p>
        </div>

        {/* Input */}
        <div className="mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste any corporate quote here..."
            className="w-full rounded-xl border-0 focus:ring-2 focus:ring-[#D4AF37] focus:outline-none resize-none"
            style={{
              minHeight: 120,
              fontSize: 18,
              padding: "16px 20px",
              backgroundColor: "#F5F5F0",
              color: "#1A1A1A",
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Decode Button */}
        <button
          onClick={handleDecode}
          disabled={loading || !input.trim()}
          className="w-full rounded-full font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            height: 48,
            fontSize: 16,
            backgroundColor: "#D4AF37",
            color: "#1A1A1A",
          }}
        >
          {loading ? "Decoding..." : "Decode It →"}
        </button>

        {decodesUsed > 0 && (
          <p className="text-center mt-3" style={{ fontSize: 12, color: "#9CA3AF" }}>
            {decodesUsed} decode{decodesUsed !== 1 ? "s" : ""} used this session
          </p>
        )}

        {/* Result Card */}
        {result && (
          <div ref={resultRef}>
            <div className="mt-8 rounded-xl p-8" style={{ backgroundColor: "#1A1A1A" }}>
              <div className="mb-6">
                <p
                  className="uppercase tracking-wider mb-2"
                  style={{ fontSize: 13, color: "#6B7280" }}
                >
                  They Said
                </p>
                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
                  {result.they_said}
                </p>
              </div>
              <div className="mb-6">
                <p
                  className="uppercase tracking-wider mb-2"
                  style={{ fontSize: 13, color: "#D4AF37" }}
                >
                  They Meant
                </p>
                <p
                  className="font-bold"
                  style={{
                    fontSize: 20,
                    color: "#FFFFFF",
                    lineHeight: 1.6,
                    fontFamily: "Lora, Georgia, serif",
                  }}
                >
                  {result.they_meant}
                </p>
              </div>
              <div>
                <p
                  className="uppercase tracking-wider mb-2"
                  style={{ fontSize: 13, color: "#D4AF37" }}
                >
                  Subtext
                </p>
                <p
                  className="italic"
                  style={{ fontSize: 18, color: "#D4AF37", lineHeight: 1.6 }}
                >
                  {result.subtext}
                </p>
              </div>
              <p
                className="text-right mt-6"
                style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}
              >
                subtextai — conduitventures.com
              </p>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-4">
              <button
                onClick={handleCopy}
                className="rounded-lg py-3 px-4 text-sm font-medium transition-all hover:opacity-80"
                style={{
                  backgroundColor: copied ? "#D4AF37" : "#F5F5F0",
                  color: copied ? "#1A1A1A" : "#1A1A1A",
                }}
              >
                {copied ? "Copied!" : "Copy Text"}
              </button>
              <button
                onClick={handleShareX}
                className="rounded-lg py-3 px-4 text-sm font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: "#F5F5F0", color: "#1A1A1A" }}
              >
                Share on X
              </button>
              <button
                onClick={handleShareLinkedIn}
                className="rounded-lg py-3 px-4 text-sm font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: "#F5F5F0", color: "#1A1A1A" }}
              >
                Share on LinkedIn
              </button>
              <button
                onClick={handleSaveImage}
                className="rounded-lg py-3 px-4 text-sm font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: "#F5F5F0", color: "#1A1A1A" }}
              >
                Save Image
              </button>
            </div>
          </div>
        )}

        {/* Hall of Fame */}
        <div className="mt-16">
          <h2
            className="mb-6"
            style={{
              fontFamily: "Lora, Georgia, serif",
              fontSize: 22,
              color: "#1A1A1A",
              fontWeight: 700,
            }}
          >
            Hall of Fame
          </h2>
          <div className="space-y-4">
            {HALL_OF_FAME.map((item, i) => (
              <div
                key={i}
                className="rounded-lg p-5"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderLeft: "3px solid #D4AF37",
                }}
              >
                <p
                  className="mb-2"
                  style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.5 }}
                >
                  &ldquo;{item.they_said}&rdquo;
                </p>
                <p
                  className="font-semibold mb-1"
                  style={{
                    fontSize: 16,
                    color: "#1A1A1A",
                    lineHeight: 1.5,
                    fontFamily: "Lora, Georgia, serif",
                  }}
                >
                  {item.they_meant}
                </p>
                <p
                  className="italic"
                  style={{ fontSize: 14, color: "#D4AF37", lineHeight: 1.5 }}
                >
                  {item.subtext}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pb-12">
          <p style={{ fontSize: 12, color: "#9CA3AF" }}>
            Subtext AI by Conduit Ventures — conduitventures.com
          </p>
        </div>
      </main>
    </div>
  );
}
