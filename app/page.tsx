"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type Mode = "exploring" | "have_idea" | "know_what_i_want";

interface MonetizationMap {
  the_one_number: string;
  three_people: string[];
  three_scenarios: {
    label: string;
    description: string;
    monthly: string;
  }[];
  path_to_first_dollar: { week: number; action: string }[];
  your_week: string;
  vertical_name: string;
  vertical_description: string;
  closing_line: string;
}

interface IdeaVault {
  answers: Record<number, string>;
  mode: Mode;
  monetizationMap: MonetizationMap | null;
  email: string;
  savedAt: string | null;
}

// ─── Prompts ────────────────────────────────────────────────────────────────

const PROMPTS = [
  "What is a problem you have solved that other people are still struggling with?",
  "Has anyone ever said to you: you should teach this, or write a book about this? What was the topic?",
  "Think about someone who is right where you were 5 years ago \u2014 same struggle, same confusion, same starting point. What is the one piece of advice, shortcut, or insight you wish someone had given you?",
  "If you were at a fire pit with your closest friends for one hour talking about any idea — what would it be?",
  "If 1,000 people needed what you know — could you help all of them personally?",
];

const MODE_OPTIONS: { value: Mode; label: string; subtitle: string }[] = [
  { value: "exploring", label: "I'm exploring", subtitle: "Full 5-prompt conversation" },
  { value: "have_idea", label: "I have an idea", subtitle: "Skip to the deeper questions" },
  { value: "know_what_i_want", label: "I know what I want", subtitle: "Straight to your Blueprint" },
];

// ─── localStorage helpers ───────────────────────────────────────────────────

function loadVault(): IdeaVault {
  if (typeof window === "undefined") return defaultVault();
  try {
    const raw = localStorage.getItem("idea_vault");
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return defaultVault();
}

function saveVault(vault: IdeaVault) {
  if (typeof window === "undefined") return;
  localStorage.setItem("idea_vault", JSON.stringify(vault));
}

function defaultVault(): IdeaVault {
  return { answers: {}, mode: "exploring", monetizationMap: null, email: "", savedAt: null };
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function IdeaSynthesizerPage() {
  const [vault, setVault] = useState<IdeaVault>(defaultVault);
  const [phase, setPhase] = useState<"hero" | "prompts" | "generating" | "map" | "blueprint" | "saved">("hero");
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [mode, setMode] = useState<Mode>("exploring");
  const [generating, setGenerating] = useState(false);
  const [map, setMap] = useState<MonetizationMap | null>(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [heroInput, setHeroInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load vault on mount
  useEffect(() => {
    const loaded = loadVault();
    setVault(loaded);
    setMode(loaded.mode);
    if (loaded.monetizationMap) {
      setMap(loaded.monetizationMap);
    }
    if (loaded.email) {
      setEmail(loaded.email);
    }
  }, []);

  // Auto-focus textarea when prompt changes
  useEffect(() => {
    if (phase === "prompts" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [phase, currentPrompt]);

  // Get the active prompts based on mode
  function getActivePrompts(): number[] {
    if (mode === "exploring") return [0, 1, 2, 3, 4];
    if (mode === "have_idea") return [2, 3];
    return [];
  }

  function handleHeroSubmit() {
    if (!heroInput.trim()) return;
    const updated = { ...vault, answers: { ...vault.answers, 0: heroInput }, mode };
    setVault(updated);
    saveVault(updated);

    if (mode === "know_what_i_want") {
      setPhase("blueprint");
      return;
    }

    const prompts = getActivePrompts();
    // Skip prompt 0 since hero input covers it
    const startIdx = mode === "exploring" ? 1 : 0;
    setCurrentPrompt(prompts[startIdx]);
    setCurrentAnswer(vault.answers[prompts[startIdx]] || "");
    setPhase("prompts");
  }

  function handleNextPrompt() {
    if (!currentAnswer.trim()) return;

    // Save answer
    const updated = { ...vault, answers: { ...vault.answers, [currentPrompt]: currentAnswer } };
    setVault(updated);
    saveVault(updated);

    // Find next prompt
    const prompts = getActivePrompts();
    const currentIdx = prompts.indexOf(currentPrompt);
    if (currentIdx < prompts.length - 1) {
      const nextPromptIdx = prompts[currentIdx + 1];
      setCurrentPrompt(nextPromptIdx);
      setCurrentAnswer(updated.answers[nextPromptIdx] || "");
    } else {
      // All prompts done — generate map
      handleGenerateMap(updated);
    }
  }

  async function handleGenerateMap(currentVault: IdeaVault) {
    setPhase("generating");
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: currentVault.answers, mode }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await res.json();
      const mapData = data.map as MonetizationMap;

      setMap(mapData);
      const updated = { ...currentVault, monetizationMap: mapData };
      setVault(updated);
      saveVault(updated);
      setPhase("map");
    } catch {
      setError("We hit a snag generating your Monetization Map. Let\u2019s try again.");
      setPhase("prompts");
      // Go back to last prompt
      const prompts = getActivePrompts();
      setCurrentPrompt(prompts[prompts.length - 1]);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveIdea() {
    if (!email.trim()) return;
    setSaving(true);
    setError("");

    const updated = { ...vault, email, savedAt: new Date().toISOString() };
    setVault(updated);
    saveVault(updated);

    try {
      const res = await fetch("/api/save-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          answers: vault.answers,
          monetizationMap: map,
        }),
      });

      if (!res.ok) {
        throw new Error("Save failed");
      }

      setPhase("saved");
    } catch {
      setError("We couldn\u2019t send your email right now. Your idea is saved locally \u2014 you won\u2019t lose it.");
    } finally {
      setSaving(false);
    }
  }

  function handleStartOver() {
    localStorage.removeItem("idea_vault");
    setVault(defaultVault());
    setMap(null);
    setEmail("");
    setCurrentAnswer("");
    setHeroInput("");
    setError("");
    setPhase("hero");
    setCurrentPrompt(0);
  }

  // ─── HERO PHASE ─────────────────────────────────────────────────────────

  if (phase === "hero") {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        {/* Nav */}
        <nav className="px-6 py-5">
          <div className="max-w-[800px] mx-auto flex items-center justify-between">
            <span className="font-serif text-lg font-bold text-navy tracking-tight">Conduit Ventures</span>
            <span className="text-xs text-muted">The Idea Synthesizer</span>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="max-w-[600px] w-full fade-up">
            {/* Hero question */}
            <h1 className="font-serif text-[36px] sm:text-[48px] font-bold text-navy text-center leading-tight mb-4">
              What is in your head?
            </h1>
            <p className="text-center text-muted text-[16px] mb-10 max-w-[440px] mx-auto leading-relaxed">
              You already know something valuable. Let&apos;s find out what it&apos;s worth.
            </p>

            {/* Mode toggle */}
            <div className="flex flex-col sm:flex-row gap-2 mb-8">
              {MODE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMode(opt.value)}
                  className={`flex-1 rounded-xl px-4 py-3.5 text-left border transition min-h-[44px] ${
                    mode === opt.value
                      ? "bg-navy text-white border-navy"
                      : "bg-white text-text border-border hover:border-navy/30"
                  }`}
                >
                  <div className={`text-sm font-bold ${mode === opt.value ? "text-white" : "text-navy"}`}>
                    {opt.label}
                  </div>
                  <div className={`text-xs mt-0.5 ${mode === opt.value ? "text-white/70" : "text-muted"}`}>
                    {opt.subtitle}
                  </div>
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="relative">
              <textarea
                value={heroInput}
                onChange={(e) => setHeroInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleHeroSubmit();
                  }
                }}
                placeholder={
                  mode === "know_what_i_want"
                    ? "Describe the product or service you want to build..."
                    : "Start typing — what\u2019s the thing you know that others don\u2019t?"
                }
                className="w-full bg-white border-2 border-border rounded-2xl px-6 py-5 text-[17px] resize-none h-32 focus:border-gold transition placeholder:text-muted/50"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleHeroSubmit}
              disabled={!heroInput.trim()}
              className={`w-full mt-4 rounded-2xl py-4 text-[17px] font-bold transition min-h-[44px] ${
                heroInput.trim()
                  ? "bg-gold text-white hover:opacity-90 cursor-pointer pulse-glow"
                  : "bg-cream-dark text-muted cursor-not-allowed"
              }`}
            >
              {mode === "know_what_i_want" ? "Build My Blueprint" : "Let\u2019s Go"}
            </button>

            {/* Resume indicator */}
            {Object.keys(vault.answers).length > 0 && (
              <div className="mt-6 text-center fade-in">
                <p className="text-xs text-muted mb-2">You have a saved idea in progress.</p>
                <button
                  onClick={() => {
                    if (vault.monetizationMap) {
                      setMap(vault.monetizationMap);
                      setPhase("map");
                    } else {
                      const prompts = getActivePrompts();
                      // Find first unanswered prompt
                      const firstUnanswered = prompts.find((p) => !vault.answers[p]);
                      if (firstUnanswered !== undefined) {
                        setCurrentPrompt(firstUnanswered);
                        setCurrentAnswer("");
                        setPhase("prompts");
                      } else {
                        handleGenerateMap(vault);
                      }
                    }
                  }}
                  className="text-sm font-bold text-gold hover:text-gold-light transition min-h-[44px] px-4"
                >
                  Continue where I left off &rarr;
                </button>
                <button
                  onClick={handleStartOver}
                  className="block mx-auto mt-2 text-xs text-muted hover:text-text transition min-h-[44px] px-4"
                >
                  Start fresh
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-6 text-center">
          <p className="text-xs text-muted">&copy; {new Date().getFullYear()} Conduit Ventures LLC</p>
        </footer>
      </div>
    );
  }

  // ─── PROMPT PHASE ───────────────────────────────────────────────────────

  if (phase === "prompts") {
    const prompts = getActivePrompts();
    const promptIdx = prompts.indexOf(currentPrompt);
    const progress = ((promptIdx + 1) / prompts.length) * 100;

    return (
      <div className="min-h-screen bg-cream flex flex-col">
        {/* Nav */}
        <nav className="px-6 py-5">
          <div className="max-w-[600px] mx-auto flex items-center justify-between">
            <span className="font-serif text-lg font-bold text-navy tracking-tight">Conduit Ventures</span>
            <span className="text-xs text-muted">
              {promptIdx + 1} of {prompts.length}
            </span>
          </div>
        </nav>

        {/* Progress bar */}
        <div className="max-w-[600px] mx-auto w-full px-6">
          <div className="h-1 bg-cream-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="max-w-[600px] w-full fade-up" key={currentPrompt}>
            {/* Prompt */}
            <h2 className="font-serif text-[24px] sm:text-[32px] font-bold text-navy leading-snug mb-8">
              {PROMPTS[currentPrompt]}
            </h2>

            {/* Answer */}
            <textarea
              ref={textareaRef}
              value={currentAnswer}
              onChange={(e) => {
                setCurrentAnswer(e.target.value);
                // Auto-save to vault on every keystroke
                const updated = { ...vault, answers: { ...vault.answers, [currentPrompt]: e.target.value } };
                setVault(updated);
                saveVault(updated);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleNextPrompt();
                }
              }}
              placeholder="Take your time. There are no wrong answers."
              className="w-full bg-white border-2 border-border rounded-2xl px-6 py-5 text-[17px] resize-none h-40 focus:border-gold transition placeholder:text-muted/50"
            />

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 mt-4 fade-up">
                <p className="text-[15px] text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => {
                  if (promptIdx > 0) {
                    const prevPromptIdx = prompts[promptIdx - 1];
                    setCurrentPrompt(prevPromptIdx);
                    setCurrentAnswer(vault.answers[prevPromptIdx] || "");
                  } else {
                    setPhase("hero");
                  }
                }}
                className="text-sm font-semibold text-navy hover:opacity-70 transition min-h-[44px] px-4"
              >
                &larr; Back
              </button>
              <button
                onClick={handleNextPrompt}
                disabled={!currentAnswer.trim()}
                className={`rounded-2xl px-8 py-3.5 text-[15px] font-bold transition min-h-[44px] ${
                  currentAnswer.trim()
                    ? "bg-gold text-white hover:opacity-90 cursor-pointer"
                    : "bg-cream-dark text-muted cursor-not-allowed"
                }`}
              >
                {promptIdx === prompts.length - 1 ? "See My Map" : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── GENERATING PHASE ───────────────────────────────────────────────────

  if (phase === "generating") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center fade-up">
          <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full spin-slow mx-auto mb-6" />
          <h2 className="font-serif text-2xl font-bold text-navy mb-3">
            Building your Monetization Map
          </h2>
          <p className="text-muted text-[15px] max-w-[360px] mx-auto leading-relaxed">
            Conduit is analyzing your answers and mapping the path from what you know to what it&apos;s worth.
          </p>
        </div>
      </div>
    );
  }

  // ─── MONETIZATION MAP PHASE ─────────────────────────────────────────────

  if (phase === "map" && map) {
    return (
      <div className="min-h-screen bg-cream">
        {/* Nav */}
        <nav className="px-6 py-5">
          <div className="max-w-[700px] mx-auto flex items-center justify-between">
            <span className="font-serif text-lg font-bold text-navy tracking-tight">Conduit Ventures</span>
            <button
              onClick={handleStartOver}
              className="text-xs text-muted hover:text-text transition min-h-[44px] px-2"
            >
              Start Over
            </button>
          </div>
        </nav>

        <div className="max-w-[700px] mx-auto px-6 pt-4 pb-24">
          {/* The One Number */}
          <div className="text-center mb-12 fade-up">
            <p className="text-xs font-bold text-gold uppercase tracking-[0.2em] mb-3">Your Number</p>
            <h1 className="font-serif text-[48px] sm:text-[64px] font-bold text-navy leading-none mb-2">
              {map.the_one_number}
            </h1>
            <p className="text-muted text-sm">per month — Scenario B</p>
          </div>

          {/* Three People */}
          <div className="mb-10 fade-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="font-serif text-lg font-bold text-navy mb-4">
              Three people who need what you know
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {map.three_people.map((person, i) => (
                <div key={i} className="bg-white border border-border rounded-xl p-5">
                  <div className="text-2xl mb-3">{["👤", "👩‍💼", "🧑‍🎓"][i]}</div>
                  <p className="text-[14px] text-text leading-relaxed">{person}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Three Scenarios */}
          <div className="mb-10 fade-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="font-serif text-lg font-bold text-navy mb-4">
              Three paths forward
            </h3>
            <div className="space-y-3">
              {map.three_scenarios.map((scenario, i) => (
                <div
                  key={i}
                  className={`border rounded-xl p-5 ${
                    i === 1
                      ? "bg-navy text-white border-navy"
                      : "bg-white border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wide ${
                      i === 1 ? "text-gold" : "text-gold"
                    }`}>
                      {scenario.label}
                    </span>
                    <span className={`font-serif text-xl font-bold ${
                      i === 1 ? "text-white" : "text-navy"
                    }`}>
                      {scenario.monthly}
                    </span>
                  </div>
                  <p className={`text-[14px] leading-relaxed ${
                    i === 1 ? "text-white/80" : "text-muted"
                  }`}>
                    {scenario.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Path to First Dollar */}
          <div className="mb-10 fade-up" style={{ animationDelay: "0.3s" }}>
            <h3 className="font-serif text-lg font-bold text-navy mb-4">
              Your first 30 days
            </h3>
            <div className="bg-white border border-border rounded-xl p-5">
              <div className="space-y-4">
                {map.path_to_first_dollar.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-gold">W{step.week}</span>
                    </div>
                    <div>
                      <p className="text-[14px] text-text font-medium">{step.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* What Your Week Looks Like */}
          {map.your_week && (
            <div className="mb-10 fade-up" style={{ animationDelay: "0.35s" }}>
              <h3 className="font-serif text-lg font-bold text-navy mb-4">
                What your week actually looks like
              </h3>
              <div className="bg-white border border-border rounded-xl p-6">
                <p className="text-[15px] text-text leading-relaxed">{map.your_week}</p>
              </div>
            </div>
          )}

          {/* Blueprint Preview */}
          <div className="mb-10 fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="bg-navy rounded-2xl p-6 sm:p-8 text-center">
              <p className="text-xs font-bold text-gold uppercase tracking-[0.2em] mb-3">Your Vertical</p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">
                {map.vertical_name}
              </h2>
              <p className="text-white/70 text-[15px] leading-relaxed max-w-[480px] mx-auto">
                {map.vertical_description}
              </p>
            </div>
          </div>

          {/* Closing Line */}
          <div className="text-center mb-12 fade-up" style={{ animationDelay: "0.45s" }}>
            <p className="font-serif text-[20px] sm:text-[24px] text-gold italic leading-relaxed max-w-[500px] mx-auto">
              &ldquo;{map.closing_line}&rdquo;
            </p>
          </div>

          {/* Idea Vault — Save */}
          <div className="bg-white border-2 border-gold/30 rounded-2xl p-6 sm:p-8 fade-up" style={{ animationDelay: "0.5s" }}>
            <h3 className="font-serif text-xl font-bold text-navy mb-2 text-center">
              Save My Idea
            </h3>
            <p className="text-muted text-sm text-center mb-6">
              We&apos;ll email your answers and Monetization Map to you. Your idea is already saved locally.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveIdea();
                }}
                placeholder="you@email.com"
                className="flex-1 bg-cream border border-border rounded-xl px-4 py-3.5 text-[15px] focus:border-gold transition min-h-[44px]"
              />
              <button
                onClick={handleSaveIdea}
                disabled={!email.trim() || saving}
                className={`rounded-xl px-6 py-3.5 text-[15px] font-bold transition min-h-[44px] ${
                  email.trim() && !saving
                    ? "bg-gold text-white hover:opacity-90 cursor-pointer"
                    : "bg-cream-dark text-muted cursor-not-allowed"
                }`}
              >
                {saving ? "Sending..." : "Save & Email My Idea"}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── BLUEPRINT PHASE (know_what_i_want mode) ───────────────────────────

  if (phase === "blueprint") {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        <nav className="px-6 py-5">
          <div className="max-w-[600px] mx-auto flex items-center justify-between">
            <span className="font-serif text-lg font-bold text-navy tracking-tight">Conduit Ventures</span>
            <button onClick={() => setPhase("hero")} className="text-xs text-muted hover:text-text transition min-h-[44px] px-2">
              &larr; Back
            </button>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="max-w-[600px] w-full fade-up">
            <h2 className="font-serif text-[28px] sm:text-[36px] font-bold text-navy leading-snug mb-4">
              Tell us about what you want to build
            </h2>
            <p className="text-muted text-[15px] mb-8 leading-relaxed">
              Describe your idea, who it&apos;s for, and what problem it solves. The more detail, the better your Blueprint.
            </p>

            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="I want to build a course / tool / service that helps [people] do [thing]..."
              className="w-full bg-white border-2 border-border rounded-2xl px-6 py-5 text-[17px] resize-none h-48 focus:border-gold transition placeholder:text-muted/50"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 mt-4">
                <p className="text-[15px] text-red-800 font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={() => {
                if (!currentAnswer.trim()) return;
                const updated = {
                  ...vault,
                  answers: { ...vault.answers, blueprint: currentAnswer },
                };
                setVault(updated);
                saveVault(updated);
                handleGenerateMap(updated);
              }}
              disabled={!currentAnswer.trim() || generating}
              className={`w-full mt-4 rounded-2xl py-4 text-[17px] font-bold transition min-h-[44px] ${
                currentAnswer.trim() && !generating
                  ? "bg-gold text-white hover:opacity-90 cursor-pointer"
                  : "bg-cream-dark text-muted cursor-not-allowed"
              }`}
            >
              Generate My Blueprint
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── SAVED PHASE ────────────────────────────────────────────────────────

  if (phase === "saved") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center max-w-[440px] fade-up">
          <div className="text-5xl mb-6">&#9993;&#65039;</div>
          <h2 className="font-serif text-[28px] font-bold text-navy mb-3">
            Your idea is on its way
          </h2>
          <p className="text-muted text-[15px] leading-relaxed mb-8">
            Check your inbox for your Monetization Map and answers. When you&apos;re ready to build, just reply to that email.
          </p>
          <button
            onClick={handleStartOver}
            className="bg-navy text-white rounded-xl px-8 py-3.5 text-[15px] font-bold hover:opacity-90 transition min-h-[44px]"
          >
            Explore Another Idea
          </button>
          <p className="text-xs text-muted mt-6">
            &copy; {new Date().getFullYear()} Conduit Ventures LLC
          </p>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
