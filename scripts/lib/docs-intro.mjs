/**
 * Page intro for synced docs.
 *
 * The vault pages (docs/<lib>/*.md) open with a `**Intention:** …` line —
 * the page's purpose, read in Obsidian. On the site that sentence belongs in
 * one place: the description under the title. Lift it out of the body (so it
 * is not shown twice) and make it the description, whole — cut only at a
 * sentence or word boundary when it runs long, never mid-word.
 */

const INTENTION = /^\*\*Intention:\*\*\s*/;
const MAX = 220;

/** Markdown inline → plain text for a frontmatter description. */
function plain(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // [label](url) → label
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp(text) {
  if (text.length <= MAX) return text;
  const head = text.slice(0, MAX);
  const sentence = head.lastIndexOf(". ");
  if (sentence > MAX * 0.5) return head.slice(0, sentence + 1);
  return `${head.slice(0, head.lastIndexOf(" ")).replace(/[,;:—–-]\s*$/, "")}…`;
}

/**
 * @param {string} body page body (title heading already removed)
 * @param {string} fallback description when the page has no Intention line
 * @returns {{ body: string, description: string }}
 */
export function liftIntention(body, fallback) {
  const lines = body.split("\n");
  const at = lines.findIndex((l) => INTENTION.test(l.trim()));
  if (at === -1) return { body, description: clamp(plain(fallback)) };

  // The intention may wrap over several lines until the next blank line.
  let end = at;
  while (end + 1 < lines.length && lines[end + 1].trim() !== "") end += 1;
  const text = lines.slice(at, end + 1).join(" ").trim().replace(INTENTION, "");

  lines.splice(at, end - at + 1);
  // Drop the blank line the removed paragraph leaves behind.
  if (lines[at]?.trim() === "" && (at === 0 || lines[at - 1]?.trim() === "")) lines.splice(at, 1);

  return { body: lines.join("\n"), description: clamp(plain(text)) };
}
