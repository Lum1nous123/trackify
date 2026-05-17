export function getDomainFromUrlOrCompany(input?: string): string | null {
  if (!input) return null;

  // If it's a URL, use hostname.
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./i, "");
    return host || null;
  } catch {
    // Not a URL -> fallback to company string below.
  }

  // Company name fallback: strip common words/spaces.
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 40);

  return cleaned.length >= 3 ? cleaned : null;
}

export function buildClearbitLogoUrl(args: {
  companyLogoUrl?: string;
  jdUrl?: string;
  companyName: string;
}): string | null {
  const { companyLogoUrl, jdUrl, companyName } = args;

  if (companyLogoUrl?.trim()) return companyLogoUrl.trim();

  const domain = getDomainFromUrlOrCompany(jdUrl || companyName);
  if (!domain) return null;

  // Clearbit logo pattern (no auth for basic usage).
  return `https://logo.clearbit.com/${domain}`;
}
