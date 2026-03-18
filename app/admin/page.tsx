"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_email");
    if (saved === "joe@conduitventures.com") {
      setAuthenticated(true);
    }
  }, []);

  function handleLogin() {
    if (emailInput.trim().toLowerCase() === "joe@conduitventures.com") {
      sessionStorage.setItem("admin_email", "joe@conduitventures.com");
      setAuthenticated(true);
      setError("");
    } else {
      setError("Access denied.");
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#060D1A] flex items-center justify-center px-6">
        <div className="max-w-[400px] w-full text-center">
          <h1
            className="text-[24px] font-bold text-white mb-2"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Command Center
          </h1>
          <p className="text-[14px] text-[#6B7280] mb-8">
            Idea Synthesizer Admin
          </p>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
            placeholder="Email"
            className="w-full bg-[#0D1B2A] border border-[#1E3A5F] rounded-lg px-4 py-3 text-[16px] text-white placeholder:text-[#4A5568] focus:border-[#C8922A] transition outline-none mb-3"
          />
          {error && (
            <p className="text-[14px] text-red-400 mb-3">{error}</p>
          )}
          <button
            onClick={handleLogin}
            className="w-full bg-[#C8922A] text-white rounded-lg py-3 text-[16px] font-bold hover:opacity-90 transition"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Maps Generated", value: "\u2014", mono: true },
    { label: "Blueprint Sales", value: "$0", mono: true },
    { label: "Launch Clients", value: "0", mono: true },
    { label: "Total Revenue", value: "$0", mono: true },
  ];

  return (
    <div className="min-h-screen bg-[#060D1A] text-white">
      {/* Header */}
      <nav className="px-6 py-5 border-b border-[#1E3A5F]/50">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between">
          <div>
            <h1
              className="text-[20px] font-bold text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Command Center
            </h1>
            <p
              className="text-[13px] text-[#6B7280] mt-0.5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Idea Synthesizer
            </p>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem("admin_email");
              setAuthenticated(false);
            }}
            className="text-[14px] text-[#6B7280] hover:text-white transition"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-[1000px] mx-auto px-6 py-10">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-5"
            >
              <p
                className="text-[13px] text-[#6B7280] uppercase tracking-wider mb-2"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {m.label}
              </p>
              <p
                className="text-[28px] font-bold text-white"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {/* Clients Waiting */}
        <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-6 mb-10">
          <h2
            className="text-[18px] font-bold text-white mb-4"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Clients Waiting for Call
          </h2>
          <div className="text-center py-10">
            <p
              className="text-[16px] text-[#6B7280]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              No clients waiting. When Launch clients sign up, they&apos;ll appear here.
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-xl p-6">
          <h2
            className="text-[18px] font-bold text-white mb-4"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            System Status
          </h2>
          <div className="space-y-3">
            {[
              { label: "Supabase", status: "Not connected", color: "#6B7280" },
              { label: "Stripe", status: "Not installed", color: "#6B7280" },
              { label: "Resend", status: "Installed", color: "#2D6A4F" },
              { label: "Claude API", status: "Active", color: "#2D6A4F" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between py-2 border-b border-[#1E3A5F]/30 last:border-0"
              >
                <span
                  className="text-[15px] text-[#6B7280]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {s.label}
                </span>
                <span
                  className="text-[14px] font-semibold"
                  style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
