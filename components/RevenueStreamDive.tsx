"use client";

import { useState } from "react";

interface DiveData {
  stream_name: string;
  business_model: {
    overview: string;
    revenue_type: string;
    price_range: string;
    target_customers: string;
    delivery_method: string;
    tools_needed: string[];
  };
  first_customer_script: {
    intro: string;
    pitch: string;
    ask: string;
    objection_handling: string[];
  };
  pricing_calculator: {
    base_price: string;
    at_5_clients: string;
    at_20_clients: string;
    at_50_clients: string;
    pricing_notes: string;
  };
  thirty_day_plan: {
    day_range: string;
    action: string;
    outcome: string;
  }[];
}

interface RevenueStreamDiveProps {
  open: boolean;
  onClose: () => void;
  streamLabel: string;
  streamDescription: string;
  streamMonthly: string;
  context: string;
}

export default function RevenueStreamDive({
  open,
  onClose,
  streamLabel,
  streamDescription,
  streamMonthly,
  context,
}: RevenueStreamDiveProps) {
  const [loading, setLoading] = useState(false);
  const [dive, setDive] = useState<DiveData | null>(null);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  async function loadDive() {
    if (hasLoaded && dive) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/revenue-stream-dive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stream_label: streamLabel,
          stream_description: streamDescription,
          stream_monthly: streamMonthly,
          context,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load");
      }

      const data = await res.json();
      setDive(data.dive);
      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // Trigger load when opened
  if (open && !hasLoaded && !loading && !error) {
    loadDive();
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[520px] bg-cream z-50 shadow-2xl overflow-y-auto slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-navy px-6 py-5 z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-gold uppercase tracking-[0.15em]">Deep Dive</p>
              <h2 className="font-serif text-xl font-bold text-white mt-1">{streamLabel}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
            >
              &#10005;
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          {loading && (
            <div className="text-center py-16 fade-up">
              <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full spin-slow mx-auto mb-6" />
              <p className="text-muted text-[15px]">Expanding this revenue stream...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 fade-up">
              <p className="text-[15px] text-red-800 font-medium">{error}</p>
              <button
                onClick={() => {
                  setError("");
                  loadDive();
                }}
                className="mt-3 text-[15px] font-bold text-red-700 hover:text-red-900 transition min-h-[44px]"
              >
                Try again
              </button>
            </div>
          )}

          {dive && (
            <div className="space-y-6 fade-up">
              {/* Business Model */}
              <section>
                <h3 className="font-serif text-lg font-bold text-navy mb-3 flex items-center gap-2">
                  <span className="text-xl">&#127970;</span> Business Model
                </h3>
                <div className="bg-white border border-border rounded-xl p-5 space-y-3">
                  <p className="text-[15px] text-text leading-relaxed">{dive.business_model.overview}</p>
                  <div className="grid grid-cols-2 gap-3 text-[13px]">
                    <div>
                      <span className="font-bold text-navy">Revenue Type:</span>{" "}
                      <span className="text-muted">{dive.business_model.revenue_type}</span>
                    </div>
                    <div>
                      <span className="font-bold text-navy">Price Range:</span>{" "}
                      <span className="text-muted">{dive.business_model.price_range}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-bold text-navy">Target:</span>{" "}
                      <span className="text-muted">{dive.business_model.target_customers}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-bold text-navy">Delivery:</span>{" "}
                      <span className="text-muted">{dive.business_model.delivery_method}</span>
                    </div>
                  </div>
                  {dive.business_model.tools_needed.length > 0 && (
                    <div>
                      <span className="font-bold text-navy text-[13px]">Tools:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {dive.business_model.tools_needed.map((tool, i) => (
                          <span
                            key={i}
                            className="text-[13px] bg-gold/10 text-gold border border-gold/20 rounded-lg px-2.5 py-1 font-medium"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* First Customer Script */}
              <section>
                <h3 className="font-serif text-lg font-bold text-navy mb-3 flex items-center gap-2">
                  <span className="text-xl">&#128172;</span> First Customer Script
                </h3>
                <div className="bg-white border border-border rounded-xl p-5 space-y-3">
                  <div>
                    <p className="text-[13px] font-bold text-gold uppercase tracking-wide mb-1">Opening</p>
                    <p className="text-[15px] text-text leading-relaxed italic">&ldquo;{dive.first_customer_script.intro}&rdquo;</p>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gold uppercase tracking-wide mb-1">Pitch</p>
                    <p className="text-[15px] text-text leading-relaxed">{dive.first_customer_script.pitch}</p>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gold uppercase tracking-wide mb-1">The Ask</p>
                    <p className="text-[15px] text-text leading-relaxed font-medium">{dive.first_customer_script.ask}</p>
                  </div>
                  {dive.first_customer_script.objection_handling.length > 0 && (
                    <div>
                      <p className="text-[13px] font-bold text-gold uppercase tracking-wide mb-1">If They Push Back</p>
                      <ul className="space-y-1.5">
                        {dive.first_customer_script.objection_handling.map((obj, i) => (
                          <li key={i} className="text-[13px] text-muted leading-relaxed flex gap-2">
                            <span className="text-gold mt-0.5 flex-shrink-0">&#8226;</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>

              {/* Pricing Calculator */}
              <section>
                <h3 className="font-serif text-lg font-bold text-navy mb-3 flex items-center gap-2">
                  <span className="text-xl">&#128176;</span> Pricing Calculator
                </h3>
                <div className="bg-white border border-border rounded-xl p-5">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-cream rounded-lg p-3 text-center">
                      <p className="text-[13px] text-muted mb-1">Base Price</p>
                      <p className="font-serif text-lg font-bold text-navy">{dive.pricing_calculator.base_price}</p>
                    </div>
                    <div className="bg-cream rounded-lg p-3 text-center">
                      <p className="text-[13px] text-muted mb-1">5 Clients</p>
                      <p className="font-serif text-lg font-bold text-navy">{dive.pricing_calculator.at_5_clients}</p>
                    </div>
                    <div className="bg-gold/10 rounded-lg p-3 text-center">
                      <p className="text-[13px] text-gold mb-1">20 Clients</p>
                      <p className="font-serif text-lg font-bold text-navy">{dive.pricing_calculator.at_20_clients}</p>
                    </div>
                    <div className="bg-navy rounded-lg p-3 text-center">
                      <p className="text-[13px] text-gold mb-1">50 Clients</p>
                      <p className="font-serif text-xl font-bold text-white">{dive.pricing_calculator.at_50_clients}</p>
                    </div>
                  </div>
                  <p className="text-[13px] text-muted leading-relaxed">{dive.pricing_calculator.pricing_notes}</p>
                </div>
              </section>

              {/* 30-Day Launch Plan */}
              <section>
                <h3 className="font-serif text-lg font-bold text-navy mb-3 flex items-center gap-2">
                  <span className="text-xl">&#128197;</span> 30-Day Launch Plan
                </h3>
                <div className="bg-white border border-border rounded-xl p-5">
                  <div className="space-y-4">
                    {dive.thirty_day_plan.map((step, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-16 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[13px] font-bold text-gold">{step.day_range}</span>
                        </div>
                        <div>
                          <p className="text-[15px] text-text font-medium">{step.action}</p>
                          <p className="text-[13px] text-muted mt-0.5">{step.outcome}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
