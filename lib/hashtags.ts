// Hashtag + mention parsing shared by the composer, body renderer, feed
// filter, and the trending list.

// Matches #word (letters, numbers, underscore).
const HASHTAG_REGEX = /#(\w+)/g;
const TOKEN_REGEX = /(^|[^\w])([#@])([A-Za-z0-9_]+)/g;

// "#NextJS" / "NextJS" → "nextjs". The canonical form used in URLs + queries.
export function normalizeTag(raw: string): string {
  return raw.replace(/^#/, "").toLowerCase();
}

export function extractTags(body: string): string[] {
  const tags: string[] = [];
  const re = new RegExp(HASHTAG_REGEX.source, "g");
  let match: RegExpExecArray | null;

  while ((match = re.exec(body)) !== null) {
    tags.push(normalizeTag(match[0]));
  }

  return tags;
}

export type BodySegment =
  | { type: "text"; value: string }
  | { type: "tag"; value: string; tag: string }
  | { type: "mention"; value: string; handle: string };

export function normalizeMention(raw: string): string {
  return raw.replace(/^@/, "").toLowerCase();
}

// Split a post body into plain-text, hashtag, and mention segments so renderers
// can style interactive tokens while preserving authored text exactly.
export function splitBody(body: string): BodySegment[] {
  const segments: BodySegment[] = [];
  const re = new RegExp(TOKEN_REGEX.source, "g");
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(body)) !== null) {
    const prefix = match[1] ?? "";
    const tokenStart = match.index + prefix.length;
    const sigil = match[2];
    const word = match[3];
    const value = `${sigil}${word}`;

    if (tokenStart > lastIndex) {
      segments.push({ type: "text", value: body.slice(lastIndex, tokenStart) });
    }

    if (sigil === "#") {
      segments.push({
        type: "tag",
        value,
        tag: normalizeTag(value),
      });
    } else {
      segments.push({
        type: "mention",
        value,
        handle: normalizeMention(value),
      });
    }

    lastIndex = tokenStart + value.length;
  }

  if (lastIndex < body.length) {
    segments.push({ type: "text", value: body.slice(lastIndex) });
  }

  return segments;
}
