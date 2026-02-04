const MAX_SOURCE_CHARS = 20000;
const MAX_TOTAL_CHARS = 60000;

export interface SourceContent {
  url: string;
  normalizedUrl: string;
  content: string;
}

export interface SourceFetchResult {
  contents: SourceContent[];
  failed: Array<{ url: string; error: string }>;
  combinedContext: string;
}

export function parseSourceList(input: string): string[] {
  return input
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function normalizeSourceUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Google Docs -> export plain text
    if (
      parsed.hostname === "docs.google.com" &&
      parsed.pathname.includes("/document/d/")
    ) {
      const match = parsed.pathname.match(/\/document\/d\/([^/]+)/);
      if (match?.[1]) {
        return `https://docs.google.com/document/d/${match[1]}/export?format=txt`;
      }
    }

    // GitHub blob -> raw
    if (
      parsed.hostname === "github.com" &&
      parsed.pathname.includes("/blob/")
    ) {
      const rawPath = parsed.pathname.replace("/blob/", "/");
      return `https://raw.githubusercontent.com${rawPath}`;
    }

    // Codeberg src -> raw (Gitea)
    if (
      parsed.hostname === "codeberg.org" &&
      parsed.pathname.includes("/src/")
    ) {
      const rawPath = parsed.pathname.replace("/src/", "/raw/");
      return `https://codeberg.org${rawPath}`;
    }

    return url;
  } catch {
    return url;
  }
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "devreadme-source-fetcher",
      Accept: "text/plain,text/markdown,text/*,*/*",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  return text;
}

function clampText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n\n[Truncated]";
}

export async function fetchSourcesForContext(
  sourcesInput?: string,
): Promise<SourceFetchResult> {
  if (!sourcesInput || sourcesInput.trim().length === 0) {
    return { contents: [], failed: [], combinedContext: "" };
  }

  const sources = parseSourceList(sourcesInput);
  if (sources.length === 0) {
    return { contents: [], failed: [], combinedContext: "" };
  }

  const contents: SourceContent[] = [];
  const failed: Array<{ url: string; error: string }> = [];

  let totalChars = 0;

  for (const sourceUrl of sources) {
    try {
      const normalizedUrl = normalizeSourceUrl(sourceUrl);
      const rawText = await fetchText(normalizedUrl);
      const clamped = clampText(rawText, MAX_SOURCE_CHARS);

      totalChars += clamped.length;
      if (totalChars > MAX_TOTAL_CHARS) {
        const remaining = MAX_TOTAL_CHARS - (totalChars - clamped.length);
        const limited = clampText(clamped, Math.max(0, remaining));
        contents.push({
          url: sourceUrl,
          normalizedUrl,
          content: limited,
        });
        break;
      }

      contents.push({ url: sourceUrl, normalizedUrl, content: clamped });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      failed.push({ url: sourceUrl, error: message });
    }
  }

  const combinedContext = contents.length
    ? contents
        .map((item) => `\n\n[External Source] ${item.url}\n\n${item.content}\n`)
        .join("")
    : "";

  return { contents, failed, combinedContext };
}
