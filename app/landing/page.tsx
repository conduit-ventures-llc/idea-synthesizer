"use client";

import { useState } from "react";

export default function LandingPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Nav */}
      <nav className="px-6 py-5">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between">
          <span className="font-serif text-lg font-bold text-[#1A1A1A] tracking-tight">
            Conduit Ventures
          </span>
          <a
            href="/"
            className="text-[15px] font-semibold text-[#C8922A] hover:opacity-80 transition"
          >
            Open Synthesizer
          </a>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="min-h-[85vh] flex items-center justify-center px-6">
        <div className="max-w-[640px] text-center fade-up">
          <h1 className="font-serif text-[36px] sm:text-[44px] font-bold text-[#1A1A1A] leading-tight mb-6">
            You already know something other people are still figuring out.
          </h1>
          <p className="text-[18px] text-[#6B7280] mb-10 max-w-[480px] mx-auto leading-relaxed">
            In 5 minutes, discover exactly what it&apos;s worth.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center bg-[#C8922A] text-white px-10 rounded-full text-[18px] font-bold hover:opacity-90 transition gentle-pulse"
            style={{ height: "52px" }}
          >
            Find My Number &rarr;
          </a>
          <p className="text-[14px] text-[#6B7280] mt-5">
            No login required. Free to start.
          </p>
        </div>
      </section>

      {/* ─── Proof ─── */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-[900px] mx-auto">
          <h2 className="font-serif text-[28px] sm:text-[32px] font-bold text-[#1A1A1A] text-center mb-4">
            Real experts. Real numbers.
          </h2>
          <p className="text-[16px] text-[#6B7280] text-center mb-12 max-w-[480px] mx-auto">
            People just like you ran The Idea Synthesizer and discovered what they already knew was worth.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                role: "HR Director, 15 years experience",
                number: "$4,200/mo",
                path: "Compliance training platform for mid-size companies",
              },
              {
                role: "Youth Soccer Coach, 8 years",
                number: "$2,800/mo",
                path: "Digital skills library for parent-coaches",
              },
              {
                role: "Catholic School Principal, 20 years",
                number: "$6,100/mo",
                path: "Enrollment strategy consulting for dioceses",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-[#FAFAF8] border border-[#E8E0D8] rounded-2xl p-6 text-center"
              >
                <p className="text-[14px] text-[#6B7280] mb-3">{card.role}</p>
                <p className="font-['JetBrains_Mono'] text-[32px] font-bold text-[#C8922A] mb-3">
                  {card.number}
                </p>
                <p className="text-[15px] text-[#1A1A1A] leading-relaxed">
                  {card.path}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="bg-[#FAFAF8] px-6 py-20">
        <div className="max-w-[900px] mx-auto">
          <h2 className="font-serif text-[28px] sm:text-[32px] font-bold text-[#1A1A1A] text-center mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: "\uD83D\uDCAC",
                title: "Tell us what you know",
                desc: "Answer 5 questions about your expertise. Talk or type \u2014 no login needed.",
              },
              {
                step: "2",
                icon: "\uD83D\uDCB0",
                title: "See what it\u2019s worth",
                desc: "Get your number, three paths forward, and a week-by-week action plan.",
              },
              {
                step: "3",
                icon: "\uD83D\uDE80",
                title: "Decide what to do next",
                desc: "Save your map, remix it, or let Conduit Ventures build it for you.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-[#C8922A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="text-[14px] font-bold text-[#C8922A] uppercase tracking-wider mb-2">
                  Step {item.step}
                </div>
                <h3 className="font-serif text-[20px] font-bold text-[#1A1A1A] mb-2">
                  {item.title}
                </h3>
                <p className="text-[16px] text-[#6B7280] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-[900px] mx-auto">
          <h2 className="font-serif text-[28px] sm:text-[32px] font-bold text-[#1A1A1A] text-center mb-4">
            Choose your path
          </h2>
          <p className="text-[16px] text-[#6B7280] text-center mb-12">
            Start free. Go deeper when you&apos;re ready.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Free */}
            <div className="border border-[#E8E0D8] rounded-2xl p-6">
              <p className="text-[14px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                Free
              </p>
              <p className="font-serif text-[28px] font-bold text-[#1A1A1A] mb-1">
                $0
              </p>
              <p className="text-[15px] text-[#6B7280] mb-6">
                Discover your number
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  "5-question intake",
                  "Your Monetization Map",
                  "The One Number",
                  "Smart Remix",
                ].map((f) => (
                  <li key={f} className="text-[15px] text-[#1A1A1A] flex items-start gap-2">
                    <span className="text-[#C8922A] mt-0.5">&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href="/"
                className="block text-center bg-[#1A1A1A] text-white rounded-full py-3 text-[16px] font-bold hover:opacity-90 transition"
              >
                Start Free
              </a>
            </div>

            {/* Blueprint */}
            <div className="border-2 border-[#C8922A] rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C8922A] text-white text-[13px] font-bold px-4 py-1 rounded-full">
                Most Popular
              </div>
              <p className="text-[14px] font-bold text-[#C8922A] uppercase tracking-wider mb-2">
                Blueprint
              </p>
              <p className="font-serif text-[28px] font-bold text-[#1A1A1A] mb-1">
                $29
              </p>
              <p className="text-[15px] text-[#6B7280] mb-6">
                Full scenarios + scripts
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  "Everything in Free",
                  "3 detailed scenarios",
                  "Sales scripts & templates",
                  "Email sequences",
                  "Pricing strategy",
                ].map((f) => (
                  <li key={f} className="text-[15px] text-[#1A1A1A] flex items-start gap-2">
                    <span className="text-[#C8922A] mt-0.5">&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:joe@conduitventures.com?subject=Blueprint Purchase"
                className="block text-center bg-[#C8922A] text-white rounded-full py-3 text-[16px] font-bold hover:opacity-90 transition"
              >
                Get Blueprint
              </a>
            </div>

            {/* Launch */}
            <div className="border border-[#E8E0D8] rounded-2xl p-6 bg-[#1B2A4A]">
              <p className="text-[14px] font-bold text-[#C8922A] uppercase tracking-wider mb-2">
                Launch
              </p>
              <p className="font-serif text-[28px] font-bold text-white mb-1">
                $500 <span className="text-[16px] font-normal text-white/60">+ $49/mo</span>
              </p>
              <p className="text-[15px] text-white/70 mb-6">
                Strategy call + platform build
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  "Everything in Blueprint",
                  "1:1 strategy call",
                  "Custom platform build",
                  "4-6 week delivery",
                  "Ongoing support",
                ].map((f) => (
                  <li key={f} className="text-[15px] text-white flex items-start gap-2">
                    <span className="text-[#C8922A] mt-0.5">&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:joe@conduitventures.com?subject=Launch Client — Build My Platform"
                className="block text-center bg-[#C8922A] text-white rounded-full py-3 text-[16px] font-bold hover:opacity-90 transition"
              >
                Let&apos;s Build
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Founder ─── */}
      <section className="bg-[#FAFAF8] px-6 py-20">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="font-serif text-[28px] font-bold text-[#1A1A1A] mb-6">
            A note from Joe
          </h2>
          <p className="text-[17px] text-[#1A1A1A] leading-relaxed font-serif italic">
            &ldquo;I&apos;m Joe. Father of 5. I built this because the most valuable people
            I know are giving away what they know for free. That ends here.&rdquo;
          </p>
          <p className="text-[15px] text-[#6B7280] mt-4">
            Founder, Conduit Ventures
          </p>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-[500px] mx-auto text-center">
          <h2 className="font-serif text-[28px] font-bold text-[#1A1A1A] mb-6">
            Ready to find out?
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 bg-[#FAFAF8] border border-[#E8E0D8] rounded-full px-6 py-3.5 text-[16px] focus:border-[#C8922A] transition outline-none"
            />
            <a
              href="/"
              className="inline-flex items-center justify-center bg-[#C8922A] text-white px-8 py-3.5 rounded-full text-[16px] font-bold hover:opacity-90 transition whitespace-nowrap"
            >
              Find Out What It&apos;s Worth &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center border-t border-[#E8E0D8]">
        <p className="text-[14px] text-[#6B7280]">
          &copy; {new Date().getFullYear()} Conduit Ventures LLC
        </p>
      </footer>
    </div>
  );
}
