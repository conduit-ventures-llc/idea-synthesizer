"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import RevenueStreamDive from "@/components/RevenueStreamDive";

// ─── Types ──────────────────────────────────────────────────────────────────

interface MonetizationMap {
  the_one_number: string;
  number_basis: string;
  three_people: Array<{
    name: string;
    situation: string;
    problem: string;
    where_to_find: string;
    opening_line: string;
  }>;
  three_scenarios: Array<{
    label: string;
    description: string;
    monthly: string;
    steps: string[];
  }>;
  comparable_experts: Array<{
    background: string;
    earning: string;
    doing: string;
  }>;
  guilt_response: string | null;
  turnkey_pack: {
    first_email: { subject: string; body: string };
    linkedin_post: string;
    one_page_description: string;
    seven_day_plan: Array<{ day: number; action: string }>;
  };
  wow_letter: string;
  vertical_name: string;
  vertical_description: string;
  is_nonprofit: boolean;
  closing_line: string;
}

interface ResourceLinkGroup {
  category: string;
  icon: string;
  links: { name: string; url: string; description: string }[];
}

type ExpertType = "teacher" | "performer" | "coach" | "analyst" | "connector" | "creator";

interface IdeaVault {
  answers: Record<string, string>;
  monetizationMap: MonetizationMap | null;
  email: string;
  savedAt: string | null;
  expertType?: ExpertType;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const EXPERT_TYPES: { value: ExpertType; emoji: string; label: string; subtitle: string }[] = [
  { value: "teacher", emoji: "\uD83D\uDCD6", label: "The Teacher", subtitle: "Loves to explain" },
  { value: "performer", emoji: "\uD83C\uDFB5", label: "The Performer", subtitle: "Loves to engage" },
  { value: "coach", emoji: "\uD83E\uDD38", label: "The Coach", subtitle: "Loves to train" },
  { value: "analyst", emoji: "\uD83D\uDD22", label: "The Analyst", subtitle: "Loves to solve" },
  { value: "connector", emoji: "\uD83D\uDC65", label: "The Connector", subtitle: "Loves to network" },
  { value: "creator", emoji: "\uD83C\uDFA8", label: "The Creator", subtitle: "Loves to make" },
];

const REMIX_CHIPS = [
  "Higher income scenario",
  "Lower barrier to start",
  "Add group offering",
  "Make it recurring",
  "Add a digital product",
  "Franchise this idea",
  "Brother Nick version \u2014 service angle",
  "Add partnership model",
];

const INTAKE_QUESTIONS = [
  {
    id: "q1_person_helped",
    question: "Think of one specific person you helped recently \u2014 not a category, one actual human.",
    subtitle: "What were they struggling with? What was different after?",
    placeholder: "Tell me about them...",
  },
  {
    id: "q2_hard_way",
    question: "What did you figure out the hard way that you wish someone had just told you?",
    subtitle: "The shortcut that took years to find.",
    placeholder: "The thing that would have saved you years...",
  },
  {
    id: "q3_should_charge",
    question: "Has anyone ever said you should teach this, write a book, or charge for this?",
    subtitle: "What were they referring to?",
    placeholder: "What do people tell you you're good at...",
  },
  {
    id: "q4_costly_mistake",
    question: "What's the most painful mistake people make when they don't have what you know?",
    subtitle: "What does it cost them \u2014 in money, time, or heartache?",
    placeholder: "The mistake you see people making...",
  },
  {
    id: "q5_scale",
    question: "If 1,000 people needed what you know right now \u2014 what would need to exist to help them all?",
    subtitle: "Without burning you out.",
    placeholder: "The system that would let you help everyone...",
  },
  {
    id: "q6_guilt",
    question: "Is any part of you uncomfortable charging for this?",
    subtitle: "Be honest. This matters more than you think.",
    placeholder: "What makes you hesitate...",
  },
  {
    id: "q7_fire",
    question: "Around a fire with your five closest people \u2014 what idea would you talk about for an hour?",
    subtitle: "The thing you can't stop thinking about.",
    placeholder: "The idea that won't let go...",
  },
];

const SOCIAL_PROOF = [
  { domain: "Executive Coach", number: "$8,400/mo", timeframe: "Discovered 3 weeks ago" },
  { domain: "Nutrition Specialist", number: "$5,200/mo", timeframe: "Discovered 2 weeks ago" },
  { domain: "Retirement Planner", number: "$11,000/mo", timeframe: "Discovered this week" },
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
  return { answers: {}, monetizationMap: null, email: "", savedAt: null };
}

// ─── Copy helper ────────────────────────────────────────────────────────────

function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function IdeaSynthesizerPage() {
  const [vault, setVault] = useState<IdeaVault>(defaultVault);
  const [phase, setPhase] = useState<"intake" | "generating" | "wow_letter" | "map" | "saved">("intake");
  const [currentQ, setCurrentQ] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [generating, setGenerating] = useState(false);
  const [map, setMap] = useState<MonetizationMap | null>(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [expertType, setExpertType] = useState<ExpertType | null>(null);
  const [resourceLinks, setResourceLinks] = useState<ResourceLinkGroup[]>([]);
  const [refineInput, setRefineInput] = useState("");
  const [refining, setRefining] = useState(false);
  const [diveOpen, setDiveOpen] = useState(false);
  const [diveScenario, setDiveScenario] = useState<{ label: string; description: string; monthly: string } | null>(null);
  const [wowParagraphs, setWowParagraphs] = useState<string[]>([]);
  const [visibleParagraphs, setVisibleParagraphs] = useState(0);
  const [revealedSections, setRevealedSections] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedScenario, setExpandedScenario] = useState<number | null>(null);
  const [countUpValue, setCountUpValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load vault on mount
  useEffect(() => {
    const loaded = loadVault();
    setVault(loaded);
    if (loaded.monetizationMap) {
      setMap(loaded.monetizationMap);
    }
    if (loaded.email) {
      setEmail(loaded.email);
    }
    if (loaded.expertType) {
      setExpertType(loaded.expertType);
    }
  }, []);

  // Auto-focus textarea when question changes
  useEffect(() => {
    if (phase === "intake" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [phase, currentQ]);

  // Wow letter paragraph reveal
  useEffect(() => {
    if (phase === "wow_letter" && wowParagraphs.length > 0 && visibleParagraphs < wowParagraphs.length) {
      const timer = setTimeout(() => {
        setVisibleParagraphs((v) => v + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, wowParagraphs, visibleParagraphs]);

  // Section reveal via IntersectionObserver
  useEffect(() => {
    if (phase !== "map") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-section"));
            if (!isNaN(idx)) {
              setRevealedSections((prev) => new Set(prev).add(idx));
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [phase, map]);

  // Count-up animation for the one number
  useEffect(() => {
    if (phase !== "map" || !map || !revealedSections.has(0)) return;

    const target = map.the_one_number;
    const numericMatch = target.replace(/[^0-9]/g, "");
    const numericTarget = parseInt(numericMatch, 10);
    if (isNaN(numericTarget)) {
      setCountUpValue(target);
      return;
    }

    const prefix = target.match(/^[^0-9]*/)?.[0] || "";
    const suffix = target.match(/[^0-9]*$/)?.[0] || "";

    let current = 0;
    const step = Math.max(1, Math.floor(numericTarget / 40));
    const interval = setInterval(() => {
      current += step;
      if (current >= numericTarget) {
        current = numericTarget;
        clearInterval(interval);
      }
      setCountUpValue(prefix + current.toLocaleString() + suffix);
    }, 30);

    return () => clearInterval(interval);
  }, [phase, map, revealedSections]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function handleCopy(text: string, id: string) {
    copyToClipboard(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function handleNextQuestion() {
    if (currentAnswer.trim().length < 20) return;

    const qId = INTAKE_QUESTIONS[currentQ].id;
    const updatedAnswers: Record<string, string> = { ...vault.answers, [qId]: currentAnswer };
    const updated = { ...vault, answers: updatedAnswers, expertType: expertType || undefined };
    setVault(updated);
    saveVault(updated);

    if (currentQ < INTAKE_QUESTIONS.length - 1) {
      const nextQ = currentQ + 1;
      setCurrentQ(nextQ);
      setCurrentAnswer(updated.answers[INTAKE_QUESTIONS[nextQ].id] || "");
    } else {
      handleGenerateMap(updated);
    }
  }

  const handleGenerateMap = useCallback(async (currentVault: IdeaVault, refineInstruction?: string) => {
    if (!refineInstruction) setPhase("generating");
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: currentVault.answers,
          expert_type: expertType || undefined,
          refine_instruction: refineInstruction || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await res.json();
      const mapData = data.map as MonetizationMap;

      setMap(mapData);
      if (data.resourceLinks) {
        setResourceLinks(data.resourceLinks as ResourceLinkGroup[]);
      }
      const updated = { ...currentVault, monetizationMap: mapData };
      setVault(updated);
      saveVault(updated);

      // If not a remix, show wow letter first
      if (!refineInstruction && mapData.wow_letter) {
        const paragraphs = mapData.wow_letter.split("\n").filter((p) => p.trim().length > 0);
        setWowParagraphs(paragraphs);
        setVisibleParagraphs(0);
        setPhase("wow_letter");
      } else {
        setRevealedSections(new Set());
        setPhase("map");
      }
    } catch {
      setError("We hit a snag generating your Monetization Map. Let\u2019s try again.");
      if (!refineInstruction) {
        setPhase("intake");
        setCurrentQ(INTAKE_QUESTIONS.length - 1);
      }
    } finally {
      setGenerating(false);
      setRefining(false);
    }
  }, [expertType]);

  async function handleRemix(instruction: string) {
    setRefineInput(instruction);
    setRefining(true);
    await handleGenerateMap(vault, instruction);
    setRefineInput("");
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
    setError("");
    setPhase("intake");
    setCurrentQ(0);
    setExpertType(null);
    setResourceLinks([]);
    setRefineInput("");
    setRefining(false);
    setDiveOpen(false);
    setDiveScenario(null);
    setWowParagraphs([]);
    setVisibleParagraphs(0);
    setRevealedSections(new Set());
    setCopiedId(null);
    setExpandedScenario(null);
    setCountUpValue("");
  }

  function setSectionRef(idx: number) {
    return (el: HTMLDivElement | null) => {
      sectionRefs.current[idx] = el;
    };
  }

  // ─── INTAKE PHASE ─────────────────────────────────────────────────────────

  if (phase === "intake") {
    const q = INTAKE_QUESTIONS[currentQ];
    const progress = ((currentQ + 1) / INTAKE_QUESTIONS.length) * 100;
    const canContinue = currentAnswer.trim().length > 20;

    return (
      <div className="min-h-screen bg-cream flex flex-col">
        {/* Gold progress bar */}
        <div className="w-full h-[3px] bg-cream-dark">
          <div
            className="h-full bg-gold transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Nav */}
        <nav className="px-6 py-5">
          <div className="max-w-[600px] mx-auto flex items-center justify-between">
            <span className="font-serif text-lg font-bold text-navy tracking-tight">Conduit Ventures</span>
            <span className="text-[13px] text-muted">
              {currentQ + 1} of {INTAKE_QUESTIONS.length}
            </span>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="max-w-[600px] w-full min-h-[80vh] flex flex-col justify-center fade-up" key={q.id}>
            {/* Expert type selector on Q1 only */}
            {currentQ === 0 && (
              <div className="mb-10">
                <p className="text-[13px] font-bold text-navy uppercase tracking-[0.15em] mb-3 text-center">What kind of expert are you?</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EXPERT_TYPES.map((et) => (
                    <button
                      key={et.value}
                      onClick={() => setExpertType(expertType === et.value ? null : et.value)}
                      className={`rounded-xl px-3 py-3 text-left border transition min-h-[44px] ${
                        expertType === et.value
                          ? "bg-navy text-white border-navy"
                          : "bg-white text-text border-border hover:border-navy/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{et.emoji}</span>
                        <div>
                          <div className={`text-[13px] font-bold ${expertType === et.value ? "text-white" : "text-navy"}`}>
                            {et.label}
                          </div>
                          <div className={`text-[13px] ${expertType === et.value ? "text-white/70" : "text-muted"}`}>
                            {et.subtitle}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question */}
            <h2 className="font-serif text-[28px] font-bold text-navy leading-snug mb-2">
              {q.question}
            </h2>
            <p className="text-[16px] text-muted mb-8 leading-relaxed">
              {q.subtitle}
            </p>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={currentAnswer}
              onChange={(e) => {
                setCurrentAnswer(e.target.value);
                const updatedAnswers: Record<string, string> = { ...vault.answers, [q.id]: e.target.value };
                const savedVault = { ...vault, answers: updatedAnswers };
                setVault(savedVault);
                saveVault(savedVault);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && canContinue) {
                  e.preventDefault();
                  handleNextQuestion();
                }
              }}
              placeholder={q.placeholder}
              className="w-full bg-[#FAF7F2] border-2 border-border rounded-2xl px-6 py-5 text-[18px] resize-none h-40 focus:border-gold transition placeholder:text-muted/50"
            />

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 mt-4 fade-up">
                <p className="text-[15px] text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Continue button */}
            <button
              onClick={handleNextQuestion}
              disabled={!canContinue}
              className={`w-full mt-6 rounded-2xl py-4 text-[17px] font-bold transition min-h-[48px] ${
                canContinue
                  ? "bg-gold text-white hover:opacity-90 cursor-pointer"
                  : "bg-cream-dark text-muted cursor-not-allowed"
              }`}
            >
              {currentQ === INTAKE_QUESTIONS.length - 1 ? "See My Number \u2192" : "Continue \u2192"}
            </button>

            {/* Resume indicator on first question */}
            {currentQ === 0 && vault.monetizationMap && (
              <div className="mt-6 text-center fade-in">
                <button
                  onClick={() => {
                    setMap(vault.monetizationMap);
                    setRevealedSections(new Set());
                    setPhase("map");
                  }}
                  className="text-[15px] font-bold text-gold hover:opacity-80 transition min-h-[44px] px-4"
                >
                  View my last map &rarr;
                </button>
                <button
                  onClick={handleStartOver}
                  className="block mx-auto mt-2 text-[13px] text-muted hover:text-text transition min-h-[44px] px-4"
                >
                  Start fresh
                </button>
              </div>
            )}
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
            Reading what you shared...
          </h2>
          <p className="text-muted text-[15px] max-w-[360px] mx-auto leading-relaxed">
            Conduit is analyzing everything you said and building your map.
          </p>
        </div>
      </div>
    );
  }

  // ─── WOW LETTER PHASE ────────────────────────────────────────────────────

  if (phase === "wow_letter" && map) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-[600px] w-full">
          <h2 className="font-serif text-[28px] font-bold text-navy mb-8 leading-snug">
            Here&apos;s what I heard.
          </h2>

          <div className="space-y-6">
            {wowParagraphs.map((para, i) => (
              <p
                key={i}
                className="font-serif text-[16px] text-text leading-[1.9] transition-opacity duration-500"
                style={{ opacity: i < visibleParagraphs ? 1 : 0 }}
              >
                {para}
              </p>
            ))}
          </div>

          {visibleParagraphs >= wowParagraphs.length && (
            <button
              onClick={() => {
                setRevealedSections(new Set());
                setPhase("map");
              }}
              className="w-full mt-12 rounded-2xl py-4 text-[17px] font-bold bg-gold text-white hover:opacity-90 cursor-pointer transition min-h-[48px] fade-up"
            >
              See Your Number &rarr;
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── MAP PHASE ────────────────────────────────────────────────────────────

  if (phase === "map" && map) {
    return (
      <div className="min-h-screen bg-cream">
        {/* Nav */}
        <nav className="px-6 py-5">
          <div className="max-w-[700px] mx-auto flex items-center justify-between">
            <span className="font-serif text-lg font-bold text-navy tracking-tight">Conduit Ventures</span>
            <button
              onClick={handleStartOver}
              className="text-[13px] text-muted hover:text-text transition min-h-[44px] px-2"
            >
              Start Over
            </button>
          </div>
        </nav>

        {/* Social proof */}
        <div className="max-w-[700px] mx-auto px-6 mb-8">
          <p className="text-[13px] text-muted text-center mb-4">
            147 experts have discovered their number this month
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SOCIAL_PROOF.map((sp, i) => (
              <div key={i} className="bg-white border border-border rounded-xl p-4 text-center">
                <p className="text-[13px] font-bold text-navy">{sp.domain}</p>
                <p className="font-serif text-lg font-bold text-gold mt-1">{sp.number}</p>
                <p className="text-[12px] text-muted mt-1">{sp.timeframe}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-[700px] mx-auto px-6 pt-4 pb-24">

          {/* SECTION 1: THE ONE NUMBER */}
          <div
            ref={setSectionRef(0)}
            data-section="0"
            className={`transition-all duration-700 ${revealedSections.has(0) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="w-full bg-gradient-to-r from-[#C8922A]/10 via-[#C8922A]/20 to-[#C8922A]/10 border-y border-[#C8922A]/30 py-10 mb-4 -mx-6 px-6 rounded-xl">
              <div className="max-w-[700px] mx-auto text-center">
                <p className="text-[16px] text-muted mb-3">Your expertise is worth:</p>
                <h1 className="font-['JetBrains_Mono'] text-[48px] font-bold text-gold leading-none mb-3">
                  {countUpValue || map.the_one_number}
                </h1>
                <p className="text-[15px] text-muted">{map.number_basis}</p>
              </div>
            </div>
          </div>

          {/* SECTION 2: WHY THIS NUMBER IS REAL */}
          <div
            ref={setSectionRef(1)}
            data-section="1"
            className={`mb-10 transition-all duration-700 ${revealedSections.has(1) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h3 className="font-serif text-[18px] font-bold text-navy mb-4">
              Why this number is real
            </h3>
            <div className="space-y-3">
              {map.comparable_experts.map((expert, i) => (
                <div key={i} className="bg-[#FAF7F2] border border-border border-l-[3px] border-l-[#C8922A] rounded-xl p-5">
                  <p className="text-[15px] text-text font-medium mb-1">{expert.background}</p>
                  <p className="text-[14px] text-gold font-bold mb-1">{expert.earning}</p>
                  <p className="text-[14px] text-muted">{expert.doing}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: THREE PEOPLE WHO NEED YOU NOW */}
          <div
            ref={setSectionRef(2)}
            data-section="2"
            className={`mb-10 transition-all duration-700 ${revealedSections.has(2) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h3 className="font-serif text-[18px] font-bold text-navy mb-4">
              Three people who need you now
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {map.three_people.map((person, i) => (
                <div key={i} className="bg-white border border-border rounded-xl p-5">
                  <p className="text-[15px] font-bold text-navy mb-1">{person.name}</p>
                  <p className="text-[13px] text-muted mb-2">{person.situation}</p>
                  <p className="text-[14px] text-text mb-2">{person.problem}</p>
                  <p className="text-[12px] text-muted mb-3">
                    <span className="font-bold">Find them:</span> {person.where_to_find}
                  </p>
                  <div className="bg-[#FAF7F2] rounded-lg p-3">
                    <p className="text-[13px] text-text italic mb-2">&ldquo;{person.opening_line}&rdquo;</p>
                    <button
                      onClick={() => handleCopy(person.opening_line, `opening-${i}`)}
                      className="text-[12px] font-bold text-gold hover:opacity-80 transition min-h-[32px]"
                    >
                      {copiedId === `opening-${i}` ? "Copied!" : "Copy opening line"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: THREE SCENARIOS */}
          <div
            ref={setSectionRef(3)}
            data-section="3"
            className={`mb-10 transition-all duration-700 ${revealedSections.has(3) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h3 className="font-serif text-[18px] font-bold text-navy mb-4">
              Three paths forward
            </h3>
            <div className="space-y-3">
              {map.three_scenarios.map((scenario, i) => (
                <div
                  key={i}
                  className={`border rounded-xl p-5 cursor-pointer transition ${
                    i === 1
                      ? "bg-navy text-white border-navy"
                      : "bg-white border-border hover:border-gold/30"
                  }`}
                  onClick={() => setExpandedScenario(expandedScenario === i ? null : i)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[13px] font-bold uppercase tracking-wide text-gold`}>
                      {scenario.label}
                    </span>
                    <span className={`font-serif text-xl font-bold ${
                      i === 1 ? "text-white" : "text-navy"
                    }`}>
                      {scenario.monthly}
                    </span>
                  </div>
                  <p className={`text-[15px] leading-relaxed ${
                    i === 1 ? "text-white/80" : "text-muted"
                  }`}>
                    {scenario.description}
                  </p>
                  {expandedScenario === i && scenario.steps && scenario.steps.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className={`text-[13px] font-bold mb-2 ${i === 1 ? "text-gold" : "text-navy"}`}>Steps:</p>
                      <ol className="space-y-2">
                        {scenario.steps.map((step, si) => (
                          <li key={si} className={`text-[14px] flex gap-2 ${i === 1 ? "text-white/80" : "text-muted"}`}>
                            <span className="text-gold font-bold flex-shrink-0">{si + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDiveScenario(scenario);
                      setDiveOpen(true);
                    }}
                    className={`mt-3 text-[13px] font-bold transition min-h-[44px] flex items-center gap-1 text-gold hover:opacity-80`}
                  >
                    Explore This Revenue Stream &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: GUILT RESPONSE (conditional) */}
          {map.guilt_response && (
            <div
              ref={setSectionRef(4)}
              data-section="4"
              className={`mb-10 transition-all duration-700 ${revealedSections.has(4) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <h3 className="font-serif text-[18px] font-bold text-navy mb-4">
                About that hesitation
              </h3>
              <div className="bg-[#FAF7F2] border border-border rounded-xl p-6">
                <p className="text-[15px] text-text leading-relaxed whitespace-pre-line">
                  {map.guilt_response}
                </p>
              </div>
            </div>
          )}

          {/* SECTION 6: TURNKEY LAUNCH PACK */}
          <div
            ref={setSectionRef(5)}
            data-section="5"
            className={`mb-10 transition-all duration-700 ${revealedSections.has(5) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h3 className="font-serif text-[18px] font-bold text-navy mb-4">
              Your launch pack
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* First Email */}
              <div className="bg-white border border-border rounded-xl p-5">
                <p className="text-[13px] font-bold text-gold uppercase tracking-wide mb-2">First Email</p>
                <p className="text-[14px] font-bold text-navy mb-1">Subject: {map.turnkey_pack.first_email.subject}</p>
                <p className="text-[14px] text-muted leading-relaxed whitespace-pre-line mb-3">{map.turnkey_pack.first_email.body}</p>
                <button
                  onClick={() => handleCopy(
                    `Subject: ${map.turnkey_pack.first_email.subject}\n\n${map.turnkey_pack.first_email.body}`,
                    "email"
                  )}
                  className="text-[12px] font-bold text-gold hover:opacity-80 transition min-h-[32px]"
                >
                  {copiedId === "email" ? "Copied!" : "Copy"}
                </button>
              </div>

              {/* LinkedIn Post */}
              <div className="bg-white border border-border rounded-xl p-5">
                <p className="text-[13px] font-bold text-gold uppercase tracking-wide mb-2">LinkedIn Post</p>
                <p className="text-[14px] text-muted leading-relaxed whitespace-pre-line mb-3">{map.turnkey_pack.linkedin_post}</p>
                <button
                  onClick={() => handleCopy(map.turnkey_pack.linkedin_post, "linkedin")}
                  className="text-[12px] font-bold text-gold hover:opacity-80 transition min-h-[32px]"
                >
                  {copiedId === "linkedin" ? "Copied!" : "Copy"}
                </button>
              </div>

              {/* One-Page Description */}
              <div className="bg-white border border-border rounded-xl p-5">
                <p className="text-[13px] font-bold text-gold uppercase tracking-wide mb-2">One-Page Description</p>
                <p className="text-[14px] text-muted leading-relaxed whitespace-pre-line mb-3">{map.turnkey_pack.one_page_description}</p>
                <button
                  onClick={() => handleCopy(map.turnkey_pack.one_page_description, "onepage")}
                  className="text-[12px] font-bold text-gold hover:opacity-80 transition min-h-[32px]"
                >
                  {copiedId === "onepage" ? "Copied!" : "Copy"}
                </button>
              </div>

              {/* 7-Day Plan */}
              <div className="bg-white border border-border rounded-xl p-5">
                <p className="text-[13px] font-bold text-gold uppercase tracking-wide mb-2">7-Day Plan</p>
                <div className="space-y-2">
                  {map.turnkey_pack.seven_day_plan.map((item) => (
                    <div key={item.day} className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[12px] font-bold text-gold">D{item.day}</span>
                      </div>
                      <p className="text-[14px] text-text leading-relaxed">{item.action}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleCopy(
                    map.turnkey_pack.seven_day_plan.map((d) => `Day ${d.day}: ${d.action}`).join("\n"),
                    "7day"
                  )}
                  className="text-[12px] font-bold text-gold hover:opacity-80 transition min-h-[32px] mt-3"
                >
                  {copiedId === "7day" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* Blueprint Preview */}
          <div
            ref={setSectionRef(6)}
            data-section="6"
            className={`mb-10 transition-all duration-700 ${revealedSections.has(6) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="bg-navy rounded-2xl p-6 sm:p-8 text-center">
              <p className="text-[13px] font-bold text-gold uppercase tracking-[0.2em] mb-3">Your Vertical</p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">
                {map.vertical_name}
              </h2>
              <p className="text-white/70 text-[15px] leading-relaxed max-w-[480px] mx-auto">
                {map.vertical_description}
              </p>
            </div>
          </div>

          {/* Closing Line */}
          <div className="text-center mb-12">
            <p className="font-serif text-[20px] sm:text-[24px] text-gold italic leading-relaxed max-w-[500px] mx-auto">
              &ldquo;{map.closing_line}&rdquo;
            </p>
          </div>

          {/* SECTION 7: PRICING CTA */}
          <div
            ref={setSectionRef(7)}
            data-section="7"
            className={`mb-10 transition-all duration-700 ${revealedSections.has(7) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Free */}
              <div className="bg-white border border-border rounded-xl p-5 text-center">
                <p className="text-[13px] font-bold text-muted uppercase tracking-wide mb-2">Free</p>
                <p className="font-serif text-2xl font-bold text-navy mb-2">$0</p>
                <p className="text-[14px] text-muted mb-4">You saw The One Number</p>
                <div className="bg-cream-dark rounded-lg px-4 py-2 text-[13px] text-muted font-medium">
                  Current plan
                </div>
              </div>

              {/* Blueprint */}
              <div className="bg-navy border border-navy rounded-xl p-5 text-center">
                <p className="text-[13px] font-bold text-gold uppercase tracking-wide mb-2">Blueprint</p>
                <p className="font-serif text-2xl font-bold text-white mb-2">$29</p>
                <p className="text-[14px] text-white/70 mb-4">Get your full map + launch pack</p>
                <a
                  href="mailto:joe@conduitventures.com?subject=Blueprint%20-%20I%20want%20my%20full%20map"
                  className="block bg-gold text-white rounded-lg px-4 py-2.5 text-[14px] font-bold hover:opacity-90 transition min-h-[44px] flex items-center justify-center"
                >
                  Get Blueprint
                </a>
              </div>

              {/* Launch */}
              <div className="bg-white border-2 border-gold rounded-xl p-5 text-center">
                <p className="text-[13px] font-bold text-gold uppercase tracking-wide mb-2">Launch</p>
                <p className="font-serif text-2xl font-bold text-navy mb-2">$500</p>
                <p className="text-[14px] text-muted mb-4">Build it with Joe</p>
                <a
                  href="mailto:joe@conduitventures.com?subject=Launch%20-%20Build%20it%20with%20me"
                  className="block bg-gold text-white rounded-lg px-4 py-2.5 text-[14px] font-bold hover:opacity-90 transition min-h-[44px] flex items-center justify-center"
                >
                  Let&apos;s Build This
                </a>
              </div>
            </div>
          </div>

          {/* Smart Remix */}
          <div className="mb-10">
            <h3 className="font-serif text-[18px] font-bold text-navy mb-3">
              Remix your map
            </h3>
            <p className="text-muted text-[15px] mb-4">
              Tap a suggestion or type your own to regenerate with a twist.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {REMIX_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleRemix(chip)}
                  disabled={refining}
                  className="bg-white border border-border rounded-full px-4 py-2 text-[14px] font-semibold text-navy hover:border-gold hover:bg-gold/5 transition min-h-[44px] disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <textarea
                value={refineInput}
                onChange={(e) => setRefineInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (refineInput.trim()) handleRemix(refineInput);
                  }
                }}
                placeholder="Or type your own remix instruction..."
                className="flex-1 bg-white border border-border rounded-xl px-4 py-3 text-[15px] resize-none h-12 focus:border-gold transition placeholder:text-muted/50"
              />
              <button
                onClick={() => {
                  if (refineInput.trim()) handleRemix(refineInput);
                }}
                disabled={!refineInput.trim() || refining}
                className={`rounded-xl px-6 py-3 text-[15px] font-bold transition min-h-[44px] ${
                  refineInput.trim() && !refining
                    ? "bg-gold text-white hover:opacity-90 cursor-pointer"
                    : "bg-cream-dark text-muted cursor-not-allowed"
                }`}
              >
                {refining ? "Remixing..." : "Remix"}
              </button>
            </div>
            {refining && (
              <div className="flex items-center gap-3 mt-3 fade-in">
                <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full spin-slow" />
                <span className="text-[13px] text-muted">Regenerating your Monetization Map...</span>
              </div>
            )}
          </div>

          {/* Resource Links */}
          {resourceLinks.length > 0 && (
            <div className="mb-10">
              <h3 className="font-serif text-[18px] font-bold text-navy mb-4">
                Resources to get started
              </h3>
              <div className="space-y-4">
                {resourceLinks.map((group, gi) => (
                  <div key={gi}>
                    <p className="text-[13px] font-bold text-navy uppercase tracking-[0.12em] mb-2 flex items-center gap-2">
                      <span>{group.icon}</span> {group.category}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.links.map((link, li) => (
                        <a
                          key={li}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white border border-border rounded-xl px-4 py-3 hover:border-gold/50 hover:shadow-sm transition block"
                        >
                          <p className="text-[15px] font-bold text-navy">{link.name}</p>
                          <p className="text-[13px] text-muted mt-0.5 leading-relaxed">{link.description}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Idea Vault - Save */}
          <div className="bg-white border-2 border-gold/30 rounded-2xl p-6 sm:p-8">
            <h3 className="font-serif text-xl font-bold text-navy mb-2 text-center">
              Save My Idea
            </h3>
            <p className="text-muted text-[15px] text-center mb-6">
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
                <p className="text-[15px] text-red-800">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Stream Deep Dive Panel */}
        {diveScenario && (
          <RevenueStreamDive
            open={diveOpen}
            onClose={() => {
              setDiveOpen(false);
              setDiveScenario(null);
            }}
            streamLabel={diveScenario.label}
            streamDescription={diveScenario.description}
            streamMonthly={diveScenario.monthly}
            context={Object.values(vault.answers).join("\n")}
          />
        )}
      </div>
    );
  }

  // ─── SAVED PHASE ──────────────────────────────────────────────────────────

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
          <p className="text-[13px] text-muted mt-6">
            &copy; {new Date().getFullYear()} Conduit Ventures LLC
          </p>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
