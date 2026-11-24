import type { AccountType } from "@/lib/types";
import downloadedLogos from "@/lib/provider-logos.json";

/**
 * Built-in list of Malaysian banks and providers.
 *
 * Each provider shows a brand-coloured badge with its short code. To use a
 * real logo instead, put the file in `public/providers/` (SVG preferred,
 * WebP/PNG fine, square, at least 96×96) and set `logo`, e.g.
 *   logo: "/providers/maybank.svg"
 *
 * Colours are approximations for the badges, not official brand values.
 * `id` is what gets saved in the database — never change an existing id.
 */
export type ProviderGroup = "bank" | "digital" | "ewallet" | "investment" | "gold" | "retirement";

export interface Provider {
  id: string;
  name: string;
  /** 2–4 characters shown on the badge */
  short: string;
  group: ProviderGroup;
  /** Account type pre-selected when this provider is picked */
  type: AccountType;
  /** Badge background */
  color: string;
  /** Badge text colour (defaults to white) */
  fg?: string;
  /** Extra search words */
  aliases?: string[];
  /** Optional real logo in /public, e.g. "/providers/maybank.svg" */
  logo?: string;
}

export const PROVIDER_GROUPS: ProviderGroup[] = [
  "bank",
  "digital",
  "ewallet",
  "investment",
  "gold",
  "retirement",
];

export const PROVIDERS: Provider[] = [
  // Banks
  { id: "maybank", name: "Maybank", short: "MAY", group: "bank", type: "bank", color: "#FFC72C", fg: "#111111", aliases: ["malayan banking", "m2u", "maybank2u", "mae"] },
  { id: "cimb", name: "CIMB Bank", short: "CIMB", group: "bank", type: "bank", color: "#EC1C24", aliases: ["cimb clicks", "octo"] },
  { id: "public-bank", name: "Public Bank", short: "PBB", group: "bank", type: "bank", color: "#E31837", aliases: ["pbe", "pb engage"] },
  { id: "rhb", name: "RHB Bank", short: "RHB", group: "bank", type: "bank", color: "#005BAA" },
  { id: "hong-leong", name: "Hong Leong Bank", short: "HLB", group: "bank", type: "bank", color: "#002C77", aliases: ["hlb connect"] },
  { id: "ambank", name: "AmBank", short: "AMB", group: "bank", type: "bank", color: "#ED1C24", aliases: ["amonline"] },
  { id: "bank-islam", name: "Bank Islam", short: "BIMB", group: "bank", type: "bank", color: "#9E1B32", aliases: ["bimb", "go by bank islam"] },
  { id: "bank-rakyat", name: "Bank Rakyat", short: "BKR", group: "bank", type: "bank", color: "#0055A5", aliases: ["irakyat"] },
  { id: "bsn", name: "Bank Simpanan Nasional", short: "BSN", group: "bank", type: "bank", color: "#1D4F91", aliases: ["simpanan nasional", "mybsn"] },
  { id: "bank-muamalat", name: "Bank Muamalat", short: "BMMB", group: "bank", type: "bank", color: "#6F2C91", aliases: ["muamalat"] },
  { id: "affin", name: "Affin Bank", short: "AFF", group: "bank", type: "bank", color: "#004B8D", aliases: ["affin islamic", "affinalways"] },
  { id: "alliance", name: "Alliance Bank", short: "ABMB", group: "bank", type: "bank", color: "#1B3D8F" },
  { id: "agrobank", name: "Agrobank", short: "AGRO", group: "bank", type: "bank", color: "#00843D", aliases: ["bank pertanian"] },
  { id: "mbsb", name: "MBSB Bank", short: "MBSB", group: "bank", type: "bank", color: "#00857C" },
  { id: "uob", name: "UOB Malaysia", short: "UOB", group: "bank", type: "bank", color: "#0B3B8C", aliases: ["citibank"] },
  { id: "ocbc", name: "OCBC Bank", short: "OCBC", group: "bank", type: "bank", color: "#E4002B" },
  { id: "hsbc", name: "HSBC", short: "HSBC", group: "bank", type: "bank", color: "#DB0011" },
  { id: "standard-chartered", name: "Standard Chartered", short: "SC", group: "bank", type: "bank", color: "#0473EA", aliases: ["stanchart", "scb"] },
  { id: "al-rajhi", name: "Al Rajhi Bank", short: "ARB", group: "bank", type: "bank", color: "#1B3A8C" },
  { id: "kfh", name: "Kuwait Finance House", short: "KFH", group: "bank", type: "bank", color: "#00764E" },

  // Digital banks
  { id: "gxbank", name: "GXBank", short: "GX", group: "digital", type: "bank", color: "#5B2A86", aliases: ["gx"] },
  { id: "aeon-bank", name: "AEON Bank", short: "AEON", group: "digital", type: "bank", color: "#B60081" },
  { id: "boost-bank", name: "Boost Bank", short: "BB", group: "digital", type: "bank", color: "#EE2E24" },
  { id: "ryt-bank", name: "Ryt Bank", short: "RYT", group: "digital", type: "bank", color: "#1F2937", aliases: ["ytl digital bank"] },
  { id: "kaf-digital", name: "KAF Digital Bank", short: "KAF", group: "digital", type: "bank", color: "#0F4C81" },

  // E-wallets
  { id: "tng", name: "Touch 'n Go eWallet", short: "TNG", group: "ewallet", type: "ewallet", color: "#005ABB", aliases: ["touch n go", "tng ewallet", "touchngo"] },
  { id: "grabpay", name: "GrabPay", short: "GRAB", group: "ewallet", type: "ewallet", color: "#00B14F", aliases: ["grab"] },
  { id: "boost", name: "Boost", short: "BST", group: "ewallet", type: "ewallet", color: "#EE2E24" },
  { id: "shopeepay", name: "ShopeePay", short: "SPAY", group: "ewallet", type: "ewallet", color: "#EE4D2D", aliases: ["shopee"] },
  { id: "bigpay", name: "BigPay", short: "BIG", group: "ewallet", type: "ewallet", color: "#111827" },
  { id: "setel", name: "Setel", short: "STL", group: "ewallet", type: "ewallet", color: "#1C3F94" },

  // Investments
  { id: "asnb", name: "ASNB (ASB, ASM)", short: "ASNB", group: "investment", type: "investment", color: "#0A5EA8", aliases: ["asb", "asm", "amanah saham", "pnb", "myasnb"] },
  { id: "tabung-haji", name: "Tabung Haji", short: "TH", group: "investment", type: "investment", color: "#006747", aliases: ["lembaga tabung haji", "th"] },
  { id: "public-mutual", name: "Public Mutual", short: "PM", group: "investment", type: "investment", color: "#E31837", aliases: ["unit trust"] },
  { id: "principal", name: "Principal", short: "PRIN", group: "investment", type: "investment", color: "#0061A0", aliases: ["unit trust"] },
  { id: "stashaway", name: "StashAway", short: "STW", group: "investment", type: "investment", color: "#0A2540", aliases: ["robo advisor"] },
  { id: "wahed", name: "Wahed", short: "WHD", group: "investment", type: "investment", color: "#0E7C66", aliases: ["robo advisor"] },
  { id: "versa", name: "Versa", short: "VRS", group: "investment", type: "investment", color: "#6D28D9" },
  { id: "moomoo", name: "moomoo", short: "MOO", group: "investment", type: "investment", color: "#FF6F00", aliases: ["stocks", "saham"] },
  { id: "rakuten-trade", name: "Rakuten Trade", short: "RKT", group: "investment", type: "investment", color: "#BF0000", aliases: ["stocks", "saham", "bursa"] },
  { id: "luno", name: "Luno", short: "LUNO", group: "investment", type: "investment", color: "#0D2C6C", aliases: ["crypto", "bitcoin"] },

  // Gold
  { id: "public-gold", name: "Public Gold", short: "PG", group: "gold", type: "gold", color: "#C9A227", fg: "#1A1300", aliases: ["emas"] },
  { id: "maybank-gold", name: "Maybank Gold (MIGA-i)", short: "MIGA", group: "gold", type: "gold", color: "#FFC72C", fg: "#111111", aliases: ["miga", "emas"] },
  { id: "poh-kong", name: "Poh Kong", short: "PK", group: "gold", type: "gold", color: "#B8860B", fg: "#1A1300", aliases: ["emas"] },
  { id: "habib", name: "Habib Jewels", short: "HJ", group: "gold", type: "gold", color: "#7A1F2B", aliases: ["emas"] },

  // Retirement
  { id: "epf", name: "KWSP / EPF", short: "EPF", group: "retirement", type: "retirement", color: "#003A70", aliases: ["kwsp", "i-akaun"] },
  { id: "prs", name: "PRS (Private Retirement Scheme)", short: "PRS", group: "retirement", type: "retirement", color: "#4B5563", aliases: ["persaraan swasta"] },
];

/** Which provider groups make sense for each account type. */
export const GROUPS_FOR_TYPE: Record<AccountType, ProviderGroup[]> = {
  bank: ["bank", "digital"],
  ewallet: ["ewallet"],
  cash: [],
  investment: ["investment"],
  gold: ["gold"],
  retirement: ["retirement"],
  other: PROVIDER_GROUPS,
};

const BY_ID = new Map(PROVIDERS.map((p) => [p.id, p]));

const LOGOS = downloadedLogos as Record<string, string>;

/** Logo file for a provider: set by hand in this list, or downloaded by scripts/fetch-logos.mjs */
export function providerLogo(p: Provider): string | undefined {
  return p.logo ?? LOGOS[p.id];
}

export function getProvider(id: string | null | undefined): Provider | undefined {
  return id ? BY_ID.get(id) : undefined;
}

export function isProviderId(id: unknown): id is string {
  return typeof id === "string" && BY_ID.has(id);
}

/** Case- and accent-insensitive search over name, short code and aliases. */
export function searchProviders(query: string): Provider[] {
  const q = query.trim().toLowerCase();
  if (!q) return PROVIDERS;
  return PROVIDERS.filter((p) =>
    [p.name, p.short, ...(p.aliases ?? [])].some((s) => s.toLowerCase().includes(q)),
  );
}
