export interface ReferrerInfo {
  source: string;
  referrer: string | null;
}

const SOURCE_PATTERNS: Array<{ pattern: RegExp; source: string }> = [
  { pattern: /google\.(com|co\.\w+)/i, source: "Google" },
  { pattern: /bing\.(com|co\.\w+)/i, source: "Bing" },
  { pattern: /duckduckgo\.com/i, source: "DuckDuckGo" },
  { pattern: /yahoo\.(com|co\.\w+)/i, source: "Yahoo" },
  { pattern: /baidu\.com/i, source: "Baidu" },
  { pattern: /yandex\.(ru|com)/i, source: "Yandex" },
  { pattern: /linkedin\.com/i, source: "LinkedIn" },
  { pattern: /github\.com/i, source: "GitHub" },
  { pattern: /gitlab\.com/i, source: "GitLab" },
  { pattern: /bitbucket\.org/i, source: "Bitbucket" },
  { pattern: /stackoverflow\.com/i, source: "Stack Overflow" },
  { pattern: /reddit\.com/i, source: "Reddit" },
  { pattern: /twitter\.com|x\.com/i, source: "Twitter/X" },
  { pattern: /facebook\.com/i, source: "Facebook" },
  { pattern: /instagram\.com/i, source: "Instagram" },
  { pattern: /youtube\.com/i, source: "YouTube" },
  { pattern: /medium\.com/i, source: "Medium" },
  { pattern: /dev\.to/i, source: "Dev.to" },
  { pattern: /hashnode\.com/i, source: "Hashnode" },
  { pattern: /substack\.com/i, source: "Substack" },
  { pattern: /news\.ycombinator\.com/i, source: "Hacker News" },
  { pattern: /producthunt\.com/i, source: "Product Hunt" },
  { pattern: /t\.co/i, source: "Twitter/X" },
  { pattern: /l\.linkedin\.com/i, source: "LinkedIn" },
  { pattern: /fb\.me/i, source: "Facebook" },
  { pattern: /lnkd\.in/i, source: "LinkedIn" },
];

export function parseReferrer(referrer: string | null): ReferrerInfo {
  if (!referrer || referrer === "direct" || referrer.trim() === "") {
    return { source: "Direct", referrer: null };
  }

  try {
    const url = new URL(referrer);
    const hostname = url.hostname.replace(/^www\./, "");

    for (const { pattern, source } of SOURCE_PATTERNS) {
      if (pattern.test(hostname)) {
        return { source, referrer: hostname };
      }
    }

    // Check if it's a known search engine by path
    if (url.pathname.includes("/search") || url.pathname.includes("/q=")) {
      return { source: "Search", referrer: hostname };
    }

    return { source: "Referral", referrer: hostname };
  } catch {
    return { source: "Unknown", referrer: referrer };
  }
}