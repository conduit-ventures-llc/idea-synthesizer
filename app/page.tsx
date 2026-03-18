"use client";

import { useState, useEffect, useRef } from "react";
import RevenueStreamDive from "@/components/RevenueStreamDive";

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

interface ResourceLinkGroup {
  category: string;
  icon: string;
  links: { name: string; url: string; description: string }[];
}

type ExpertType = "teacher" | "performer" | "coach" | "analyst" | "connector" | "creator";

interface IdeaVault {
  answers: Record<string, string>;
  mode: Mode;
  monetizationMap: MonetizationMap | null;
  email: string;
  savedAt: string | null;
  expertType?: ExpertType;
}

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

// ─── Prompts ────────────────────────────────────────────────────────────────

const DEFAULT_PROMPTS: Record<number, string> = {
  0: "What is a problem you have solved that other people are still struggling with?",
  1: "Has anyone ever said to you: you should teach this, or write a book about this? What was the topic?",
  2: "Think about someone who is right where you were 5 years ago \u2014 same struggle, same confusion, same starting point. What is the one piece of advice, shortcut, or insight you wish someone had given you?",
  3: "If you were at a fire pit with your closest friends for one hour talking about any idea \u2014 what would it be?",
  4: "If 1,000 people needed what you know \u2014 could you help all of them personally?",
};

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
  const [phase, setPhase] = useState<"hero" | "personalizing" | "prompts" | "generating" | "map" | "blueprint" | "saved">("hero");
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [mode, setMode] = useState<Mode>("exploring");
  const [generating, setGenerating] = useState(false);
  const [map, setMap] = useState<MonetizationMap | null>(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [heroInput, setHeroInput] = useState("");
  const [personalizedPrompts, setPersonalizedPrompts] = useState<Record<number, string>>(DEFAULT_PROMPTS);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [expertType, setExpertType] = useState<ExpertType | null>(null);
  const [resourceLinks, setResourceLinks] = useState<ResourceLinkGroup[]>([]);
  const [refineInput, setRefineInput] = useState("");
  const [refining, setRefining] = useState(false);
  const [diveOpen, setDiveOpen] = useState(false);
  const [diveScenario, setDiveScenario] = useState<{ label: string; description: string; monthly: string } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
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
    if (loaded.expertType) {
      setExpertType(loaded.expertType);
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

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Transcribe via Whisper
        setTranscribing(true);
        try {
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");
          const res = await fetch("/api/transcribe", { method: "POST", body: formData });
          if (res.ok) {
            const data = await res.json();
            setHeroInput(data.text);
          } else {
            setError("Couldn\u2019t transcribe your recording. Try typing instead.");
          }
        } catch {
          setError("Couldn\u2019t transcribe your recording. Try typing instead.");
        } finally {
          setTranscribing(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);

      // Auto-stop at 90 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          setRecording(false);
        }
      }, 90000);
    } catch {
      setError("Couldn\u2019t access your microphone. Check your browser permissions.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  async function handleHeroSubmit() {
    if (!heroInput.trim()) return;
    const updatedAnswers: Record<string, string> = { ...vault.answers, "0": heroInput };
    const updated = { ...vault, answers: updatedAnswers, mode, expertType: expertType || undefined };
    setVault(updated);
    saveVault(updated);

    if (mode === "know_what_i_want") {
      setPhase("blueprint");
      return;
    }

    // Personalize questions 2-5 based on answer 1
    setPhase("personalizing");
    try {
      const res = await fetch("/api/rewrite-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer_1: heroInput }),
      });
      const data = await res.json();
      if (data.prompts) {
        setPersonalizedPrompts({
          0: DEFAULT_PROMPTS[0],
          1: data.prompts.q2,
          2: data.prompts.q3,
          3: data.prompts.q4,
          4: data.prompts.q5,
        });
      }
    } catch {
      // Fallback to defaults — don't block the flow
    }

    const prompts = getActivePrompts();
    const startIdx = mode === "exploring" ? 1 : 0;
    setCurrentPrompt(prompts[startIdx]);
    setCurrentAnswer(updated.answers[String(prompts[startIdx])] || "");
    setPhase("prompts");
  }

  function handleNextPrompt() {
    if (!currentAnswer.trim()) return;

    // Save answer
    const updatedAnswers: Record<string, string> = { ...vault.answers, [String(currentPrompt)]: currentAnswer };
    const updated = { ...vault, answers: updatedAnswers };
    setVault(updated);
    saveVault(updated);

    // Find next prompt
    const prompts = getActivePrompts();
    const currentIdx = prompts.indexOf(currentPrompt);
    if (currentIdx < prompts.length - 1) {
      const nextPromptIdx = prompts[currentIdx + 1];
      setCurrentPrompt(nextPromptIdx);
      setCurrentAnswer(updated.answers[String(nextPromptIdx)] || "");
    } else {
      // All prompts done — generate map
      handleGenerateMap(updated);
    }
  }

  async function handleGenerateMap(currentVault: IdeaVault, refineInstruction?: string) {
    if (!refineInstruction) setPhase("generating");
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: currentVault.answers,
          mode,
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
      setPhase("map");
    } catch {
      setError("We hit a snag generating your Monetization Map. Let\u2019s try again.");
      if (!refineInstruction) {
        setPhase("prompts");
        const prompts = getActivePrompts();
        setCurrentPrompt(prompts[prompts.length - 1]);
      }
    } finally {
      setGenerating(false);
      setRefining(false);
    }
  }

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
    setHeroInput("");
    setError("");
    setPersonalizedPrompts(DEFAULT_PROMPTS);
    setPhase("hero");
    setCurrentPrompt(0);
    setExpertType(null);
    setResourceLinks([]);
    setRefineInput("");
    setRefining(false);
    setDiveOpen(false);
    setDiveScenario(null);
  }

  // ─── HERO PHASE ─────────────────────────────────────────────────────────

  if (phase === "hero") {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        {/* Nav */}
        <nav className="px-6 py-5">
          <div className="max-w-[800px] mx-auto flex items-center justify-between">
            <span className="font-serif text-lg font-bold text-navy tracking-tight">Conduit Ventures</span>
            <span className="text-[13px] text-muted">The Idea Synthesizer</span>
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
                  <div className={`text-[15px] font-bold ${mode === opt.value ? "text-white" : "text-navy"}`}>
                    {opt.label}
                  </div>
                  <div className={`text-[13px] mt-0.5 ${mode === opt.value ? "text-white/70" : "text-muted"}`}>
                    {opt.subtitle}
                  </div>
                </button>
              ))}
            </div>

            {/* Expert Type Selector */}
            <div className="mb-8">
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
                    : "Start typing \u2014 or tap the microphone and just talk."
                }
                className="w-full bg-white border-2 border-border rounded-2xl px-6 py-5 text-[17px] resize-none h-32 focus:border-gold transition placeholder:text-muted/50"
              />
            </div>

            {/* Voice Capture */}
            <div className="flex items-center justify-center mt-4 mb-2">
              {transcribing ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full spin-slow" />
                  <span className="text-[15px] text-muted">Listening to what you said...</span>
                </div>
              ) : recording ? (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-3 bg-red-50 border-2 border-red-300 rounded-2xl px-6 py-3.5 min-h-[44px] transition hover:bg-red-100"
                >
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[15px] font-bold text-red-700">Recording... tap to stop</span>
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-3 bg-gold/10 border-2 border-gold/30 rounded-2xl px-6 py-3.5 min-h-[44px] transition hover:bg-gold/20 hover:border-gold/50"
                >
                  <span className="text-2xl">&#127908;</span>
                  <span className="text-[15px] font-bold text-navy">At a fire pit? Just talk.</span>
                </button>
              )}
            </div>

            {/* Audio playback if recorded */}
            {audioUrl && !recording && !transcribing && (
              <div className="flex justify-center mb-2 fade-in">
                <audio src={audioUrl} controls className="h-8" />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 mb-2 fade-up">
                <p className="text-[15px] text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleHeroSubmit}
              disabled={!heroInput.trim() || transcribing}
              className={`w-full mt-2 rounded-2xl py-4 text-[17px] font-bold transition min-h-[44px] ${
                heroInput.trim() && !transcribing
                  ? "bg-gold text-white hover:opacity-90 cursor-pointer pulse-glow"
                  : "bg-cream-dark text-muted cursor-not-allowed"
              }`}
            >
              {mode === "know_what_i_want" ? "Build My Blueprint" : "Let\u2019s Go"}
            </button>

            {/* Resume indicator */}
            {Object.keys(vault.answers).length > 0 && (
              <div className="mt-6 text-center fade-in">
                <p className="text-[13px] text-muted mb-2">You have a saved idea in progress.</p>
                <button
                  onClick={() => {
                    if (vault.monetizationMap) {
                      setMap(vault.monetizationMap);
                      setPhase("map");
                    } else {
                      const prompts = getActivePrompts();
                      // Find first unanswered prompt
                      const firstUnanswered = prompts.find((p) => !vault.answers[String(p)]);
                      if (firstUnanswered !== undefined) {
                        setCurrentPrompt(firstUnanswered);
                        setCurrentAnswer("");
                        setPhase("prompts");
                      } else {
                        handleGenerateMap(vault);
                      }
                    }
                  }}
                  className="text-[15px] font-bold text-gold hover:text-gold-light transition min-h-[44px] px-4"
                >
                  Continue where I left off &rarr;
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

        {/* Footer */}
        <footer className="px-6 py-6 text-center">
          <p className="text-[13px] text-muted">&copy; {new Date().getFullYear()} Conduit Ventures LLC</p>
        </footer>
      </div>
    );
  }

  // ─── PERSONALIZING PHASE ────────────────────────────────────────────────

  if (phase === "personalizing") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center fade-up">
          <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full spin-slow mx-auto mb-6" />
          <h2 className="font-serif text-2xl font-bold text-navy mb-3">
            Making this about you
          </h2>
          <p className="text-muted text-[15px] max-w-[360px] mx-auto leading-relaxed">
            Conduit is reading what you shared and rewriting every question to fit your idea.
          </p>
        </div>
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
            <span className="text-[13px] text-muted">
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
              {personalizedPrompts[currentPrompt] || DEFAULT_PROMPTS[currentPrompt]}
            </h2>

            {/* Answer */}
            <textarea
              ref={textareaRef}
              value={currentAnswer}
              onChange={(e) => {
                setCurrentAnswer(e.target.value);
                // Auto-save to vault on every keystroke
                const savedAnswers: Record<string, string> = { ...vault.answers, [String(currentPrompt)]: e.target.value };
                const savedVault = { ...vault, answers: savedAnswers };
                setVault(savedVault);
                saveVault(savedVault);
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
                    setCurrentAnswer(vault.answers[String(prevPromptIdx)] || "");
                  } else {
                    setPhase("hero");
                  }
                }}
                className="text-[15px] font-semibold text-navy hover:opacity-70 transition min-h-[44px] px-4"
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
              className="text-[13px] text-muted hover:text-text transition min-h-[44px] px-2"
            >
              Start Over
            </button>
          </div>
        </nav>

        <div className="max-w-[700px] mx-auto px-6 pt-4 pb-24">
          {/* The One Number */}
          <div className="text-center mb-12 fade-up">
            <p className="text-[13px] font-bold text-gold uppercase tracking-[0.2em] mb-3">Your Number</p>
            <h1 className="font-serif text-[48px] sm:text-[64px] font-bold text-navy leading-none mb-2">
              {map.the_one_number}
            </h1>
            <p className="text-muted text-[15px]">per month — Scenario B</p>
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
                  <p className="text-[15px] text-text leading-relaxed">{person}</p>
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
                    <span className={`text-[13px] font-bold uppercase tracking-wide ${
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
                  <p className={`text-[15px] leading-relaxed ${
                    i === 1 ? "text-white/80" : "text-muted"
                  }`}>
                    {scenario.description}
                  </p>
                  <button
                    onClick={() => {
                      setDiveScenario(scenario);
                      setDiveOpen(true);
                    }}
                    className={`mt-3 text-[13px] font-bold transition min-h-[44px] flex items-center gap-1 ${
                      i === 1
                        ? "text-gold hover:text-gold-light"
                        : "text-gold hover:text-gold-light"
                    }`}
                  >
                    Explore This Revenue Stream &rarr;
                  </button>
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
                      <span className="text-[13px] font-bold text-gold">W{step.week}</span>
                    </div>
                    <div>
                      <p className="text-[15px] text-text font-medium">{step.action}</p>
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
          <div className="text-center mb-12 fade-up" style={{ animationDelay: "0.45s" }}>
            <p className="font-serif text-[20px] sm:text-[24px] text-gold italic leading-relaxed max-w-[500px] mx-auto">
              &ldquo;{map.closing_line}&rdquo;
            </p>
          </div>

          {/* Smart Remix */}
          <div className="mb-10 fade-up" style={{ animationDelay: "0.48s" }}>
            <h3 className="font-serif text-lg font-bold text-navy mb-3">
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
                  className="remix-chip bg-white border border-border rounded-full px-4 py-2 text-[13px] font-semibold text-navy hover:border-gold hover:bg-gold/5 transition min-h-[44px] disabled:opacity-50"
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
            <div className="mb-10 fade-up" style={{ animationDelay: "0.5s" }}>
              <h3 className="font-serif text-lg font-bold text-navy mb-4">
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
                          className="resource-link bg-white border border-border rounded-xl px-4 py-3 hover:border-gold/50 hover:shadow-sm transition block"
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

          {/* Idea Vault — Save */}
          <div className="bg-white border-2 border-gold/30 rounded-2xl p-6 sm:p-8 fade-up" style={{ animationDelay: "0.5s" }}>
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

  // ─── BLUEPRINT PHASE (know_what_i_want mode) ───────────────────────────

  if (phase === "blueprint") {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        <nav className="px-6 py-5">
          <div className="max-w-[600px] mx-auto flex items-center justify-between">
            <span className="font-serif text-lg font-bold text-navy tracking-tight">Conduit Ventures</span>
            <button onClick={() => setPhase("hero")} className="text-[13px] text-muted hover:text-text transition min-h-[44px] px-2">
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
                const bpAnswers: Record<string, string> = { ...vault.answers, blueprint: currentAnswer };
                const updated = {
                  ...vault,
                  answers: bpAnswers,
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
