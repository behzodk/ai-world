// Hashtag parsing + normalization shared by the body renderer, the feed
// filter, and the trending list.

// Matches #word (letters, numbers, underscore).
const HASHTAG_REGEX = /#(\w+)/g;

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
  | { type: "tag"; value: string; tag: string };

// Split a post body into plain-text and hashtag segments so PostBody can render
// the hashtags as clickable pills while keeping the rest as text.
export function splitBody(body: string): BodySegment[] {
  const segments: BodySegment[] = [];
  const re = new RegExp(HASHTAG_REGEX.source, "g");
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(body)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: body.slice(lastIndex, match.index) });
    }
    segments.push({
      type: "tag",
      value: match[0],
      tag: normalizeTag(match[0]),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < body.length) {
    segments.push({ type: "text", value: body.slice(lastIndex) });
  }

  return segments;
}
