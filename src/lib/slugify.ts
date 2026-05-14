const LITHUANIAN_MAP: Record<string, string> = {
  ą: "a", č: "c", ę: "e", ė: "e", į: "i", š: "s", ų: "u", ū: "u", ž: "z",
  Ą: "a", Č: "c", Ę: "e", Ė: "e", Į: "i", Š: "s", Ų: "u", Ū: "u", Ž: "z",
};

function transliterate(str: string): string {
  return str.replace(/[ąčęėįšųūžĄČĘĖĮŠŲŪŽ]/g, (ch) => LITHUANIAN_MAP[ch] ?? ch);
}

function randomChars(len = 4): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/**
 * Generates a URL-safe slug from brand and title.
 * Format: {brand}-{title}-{4 random chars}
 * Example: nike-vasara-2025-x7k2
 */
export function generateSlug(brand: string, title: string): string {
  const raw = `${brand}-${title}`;
  const slug = transliterate(raw)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${slug}-${randomChars()}`;
}
