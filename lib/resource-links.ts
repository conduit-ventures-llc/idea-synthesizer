export interface ResourceLink {
  keywords: string[];
  name: string;
  url: string;
  description: string;
  category:
    | "business"
    | "pricing"
    | "marketing"
    | "legal"
    | "community"
    | "monetization"
    | "validation"
    | "values";
}

const RESOURCES: ResourceLink[] = [
  // ─── Business (4) ────────────────────────────────────────────────────────
  {
    keywords: ["business", "startup", "small business"],
    name: "SBA.gov",
    url: "https://www.sba.gov",
    description: "Official U.S. Small Business Administration — guides, funding, and legal resources.",
    category: "business",
  },
  {
    keywords: ["mentor", "advisor", "business plan"],
    name: "SCORE.org Mentoring",
    url: "https://www.score.org",
    description: "Free mentorship from experienced business professionals.",
    category: "business",
  },
  {
    keywords: ["incorporate", "llc", "banking"],
    name: "Stripe Atlas",
    url: "https://stripe.com/atlas",
    description: "Incorporate your business, open a bank account, and start accepting payments.",
    category: "business",
  },
  {
    keywords: ["llc", "formation", "legal entity"],
    name: "LLC Filing Guide",
    url: "https://www.nolo.com/legal-encyclopedia/form-llc-in-your-state.html",
    description: "State-by-state guide to forming your LLC.",
    category: "business",
  },

  // ─── Pricing (4) ─────────────────────────────────────────────────────────
  {
    keywords: ["pricing", "price", "charge", "fee"],
    name: "Value-Based Pricing Guide",
    url: "https://www.priceintelligently.com/blog/value-based-pricing",
    description: "Learn to price based on the value you deliver, not hours worked.",
    category: "pricing",
  },
  {
    keywords: ["competitor", "market research"],
    name: "SimilarWeb",
    url: "https://www.similarweb.com",
    description: "Research competitors, traffic, and market positioning.",
    category: "pricing",
  },
  {
    keywords: ["pricing page", "conversion"],
    name: "PricingPage.com",
    url: "https://www.pricingpage.com",
    description: "Pricing page design and psychology for higher conversions.",
    category: "pricing",
  },
  {
    keywords: ["revenue", "income", "earn", "salary"],
    name: "Revenue Calculator",
    url: "https://www.omnicalculator.com/finance/revenue",
    description: "Calculate projected revenue from your pricing model.",
    category: "pricing",
  },

  // ─── Marketing (4) ───────────────────────────────────────────────────────
  {
    keywords: ["email", "newsletter", "list"],
    name: "ConvertKit",
    url: "https://convertkit.com",
    description: "Email marketing built for creators — grow and monetize your audience.",
    category: "marketing",
  },
  {
    keywords: ["newsletter", "audience"],
    name: "Beehiiv",
    url: "https://www.beehiiv.com",
    description: "Newsletter platform with built-in growth tools and monetization.",
    category: "marketing",
  },
  {
    keywords: ["linkedin", "professional", "network"],
    name: "LinkedIn Creator Tools",
    url: "https://www.linkedin.com/creators",
    description: "Build your professional audience and thought leadership on LinkedIn.",
    category: "marketing",
  },
  {
    keywords: ["design", "visual", "branding", "logo"],
    name: "Canva",
    url: "https://www.canva.com",
    description: "Design professional visuals, logos, and brand materials — no design skills needed.",
    category: "marketing",
  },

  // ─── Legal (3) ───────────────────────────────────────────────────────────
  {
    keywords: ["contract", "agreement", "client"],
    name: "Bonsai Contract Templates",
    url: "https://www.hellobonsai.com/templates",
    description: "Free contract templates for freelancers and consultants.",
    category: "legal",
  },
  {
    keywords: ["trademark", "patent", "intellectual property"],
    name: "USPTO — IP Basics",
    url: "https://www.uspto.gov/learning-and-resources",
    description: "Protect your ideas — trademarks, patents, and intellectual property basics.",
    category: "legal",
  },
  {
    keywords: ["privacy", "terms", "legal"],
    name: "Privacy Policy Generator",
    url: "https://www.termsfeed.com/privacy-policy-generator",
    description: "Generate a privacy policy and terms of service for your business.",
    category: "legal",
  },

  // ─── Community (4) ───────────────────────────────────────────────────────
  {
    keywords: ["community", "membership", "group"],
    name: "Circle.so",
    url: "https://circle.so",
    description: "Build a branded community and membership — courses, discussions, events.",
    category: "community",
  },
  {
    keywords: ["community", "course", "membership"],
    name: "Skool",
    url: "https://www.skool.com",
    description: "Community-powered courses — combine learning and engagement.",
    category: "community",
  },
  {
    keywords: ["community", "chat", "server"],
    name: "Discord",
    url: "https://discord.com",
    description: "Free community platform with voice, video, and text channels.",
    category: "community",
  },
  {
    keywords: ["slack", "workspace", "networking"],
    name: "Slack Communities",
    url: "https://slack.com",
    description: "Professional networking and community building through Slack workspaces.",
    category: "community",
  },

  // ─── Monetization (5) ────────────────────────────────────────────────────
  {
    keywords: ["digital product", "sell", "download"],
    name: "Gumroad",
    url: "https://gumroad.com",
    description: "Sell digital products, courses, and memberships — simple and fast.",
    category: "monetization",
  },
  {
    keywords: ["course", "online course", "teach"],
    name: "Teachable",
    url: "https://teachable.com",
    description: "Create and sell online courses with a professional storefront.",
    category: "monetization",
  },
  {
    keywords: ["cohort", "live course", "workshop"],
    name: "Maven",
    url: "https://maven.com",
    description: "Launch cohort-based live courses for expert-led learning.",
    category: "monetization",
  },
  {
    keywords: ["course", "membership", "all-in-one"],
    name: "Kajabi",
    url: "https://kajabi.com",
    description: "All-in-one platform for courses, memberships, and digital products.",
    category: "monetization",
  },
  {
    keywords: ["newsletter", "paid", "subscribe"],
    name: "Substack",
    url: "https://substack.com",
    description: "Start a paid newsletter — write, grow, and earn from your expertise.",
    category: "monetization",
  },

  // ─── Validation (3) ──────────────────────────────────────────────────────
  {
    keywords: ["reddit", "forum", "validate"],
    name: "Reddit Research",
    url: "https://www.reddit.com",
    description: "Find subreddits where your future customers talk about their problems.",
    category: "validation",
  },
  {
    keywords: ["facebook", "group", "community"],
    name: "Facebook Groups",
    url: "https://www.facebook.com/groups",
    description: "Join groups where your audience hangs out — validate demand and build trust.",
    category: "validation",
  },
  {
    keywords: ["trend", "demand", "search volume"],
    name: "Google Trends",
    url: "https://trends.google.com",
    description: "Check search demand and trending topics for your idea.",
    category: "validation",
  },

  // ─── Values / Catholic (3) ───────────────────────────────────────────────
  {
    keywords: ["catholic", "school", "education"],
    name: "NCEA Resources",
    url: "https://www.ncea.org",
    description: "National Catholic Educational Association — resources for Catholic educators.",
    category: "values",
  },
  {
    keywords: ["catholic", "faith", "church"],
    name: "USCCB",
    url: "https://www.usccb.org",
    description: "United States Conference of Catholic Bishops — faith-based guidance and resources.",
    category: "values",
  },
  {
    keywords: ["catholic", "business", "network"],
    name: "Catholic Business Networks",
    url: "https://www.legatus.org",
    description: "Connect with Catholic business leaders and entrepreneurs.",
    category: "values",
  },
];

const CATEGORY_LABELS: Record<ResourceLink["category"], string> = {
  business: "Business Foundations",
  pricing: "Pricing & Revenue",
  marketing: "Marketing & Growth",
  legal: "Legal & Protection",
  community: "Community Building",
  monetization: "Monetization Platforms",
  validation: "Market Validation",
  values: "Values & Mission",
};

const CATEGORY_ICONS: Record<ResourceLink["category"], string> = {
  business: "\u{1F3E2}",
  pricing: "\u{1F4B0}",
  marketing: "\u{1F4E3}",
  legal: "\u{1F6E1}\uFE0F",
  community: "\u{1F465}",
  monetization: "\u{1F4B3}",
  validation: "\u{2705}",
  values: "\u{2728}",
};

/**
 * Find resources that match keywords found in the given text.
 * Returns de-duplicated results sorted by category.
 */
export function findMatchingResources(text: string): ResourceLink[] {
  const lowerText = text.toLowerCase();
  const matched = new Set<string>();
  const results: ResourceLink[] = [];

  for (const resource of RESOURCES) {
    if (matched.has(resource.url)) continue;
    const hasMatch = resource.keywords.some((kw) => lowerText.includes(kw.toLowerCase()));
    if (hasMatch) {
      matched.add(resource.url);
      results.push(resource);
    }
  }

  // Sort by category order
  const categoryOrder: ResourceLink["category"][] = [
    "monetization",
    "business",
    "pricing",
    "marketing",
    "community",
    "validation",
    "legal",
    "values",
  ];
  results.sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));

  return results;
}

/**
 * Build styled HTML for resource links to append to the Monetization Map JSON context.
 * Returns a text summary (not HTML) that can be included in the API response.
 */
export function buildResourceLinksData(
  resources: ResourceLink[]
): { category: string; icon: string; links: { name: string; url: string; description: string }[] }[] {
  if (resources.length === 0) return [];

  // Group by category
  const grouped: Record<string, ResourceLink[]> = {};
  for (const r of resources) {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push(r);
  }

  return Object.entries(grouped).map(([cat, links]) => ({
    category: CATEGORY_LABELS[cat as ResourceLink["category"]] || cat,
    icon: CATEGORY_ICONS[cat as ResourceLink["category"]] || "",
    links: links.map((l) => ({ name: l.name, url: l.url, description: l.description })),
  }));
}
