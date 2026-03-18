"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const product = searchParams.get("product");

  const isLaunch = product === "launch";
  const isBlueprint = product === "blueprint";

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6">
      <div className="text-center max-w-[480px]">
        <div className="text-5xl mb-6">
          {isLaunch ? "\uD83D\uDE80" : isBlueprint ? "\uD83D\uDCCB" : "\u2705"}
        </div>

        <h1 className="font-serif text-[32px] font-bold text-[#1A1A1A] mb-4">
          {isLaunch
            ? "Welcome to Launch."
            : isBlueprint
              ? "Your Blueprint is on the way."
              : "Thank you!"}
        </h1>

        <p className="text-[16px] text-[#6B7280] leading-relaxed mb-4">
          {isLaunch
            ? "Joe will reach out within 24 hours to schedule your strategy call. We\u2019ll have your platform built in 4\u20136 weeks."
            : isBlueprint
              ? "Check your inbox for your full Blueprint with scenarios, scripts, and pricing strategy. It should arrive within a few minutes."
              : "We\u2019ve received your information. Someone from Conduit Ventures will be in touch soon."}
        </p>

        {isLaunch && (
          <div className="bg-white border border-[#E8E0D8] rounded-xl p-5 mb-6 text-left">
            <p className="text-[14px] font-bold text-[#1A1A1A] mb-2">
              What happens next:
            </p>
            <ul className="space-y-2">
              {[
                "Strategy call scheduled within 24 hours",
                "Platform wireframes within 1 week",
                "Working platform in 4\u20136 weeks",
                "Ongoing support at $49/mo",
              ].map((step, i) => (
                <li
                  key={i}
                  className="text-[15px] text-[#6B7280] flex items-start gap-2"
                >
                  <span className="text-[#C8922A] mt-0.5">&#10003;</span> {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center bg-[#1A1A1A] text-white px-8 py-3 rounded-full text-[16px] font-bold hover:opacity-90 transition"
          >
            Back to Synthesizer
          </a>
          <a
            href="/landing"
            className="inline-flex items-center justify-center border border-[#E8E0D8] text-[#1A1A1A] px-8 py-3 rounded-full text-[16px] font-semibold hover:border-[#C8922A] transition"
          >
            Learn More
          </a>
        </div>

        <p className="text-[14px] text-[#6B7280] mt-8">
          &copy; {new Date().getFullYear()} Conduit Ventures LLC
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
          <p className="text-[16px] text-[#6B7280]">Loading...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
