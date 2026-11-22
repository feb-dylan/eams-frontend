/**
 * Tiny, SAFE markdown parser for AI answers.
 * Supports paragraphs, "- " lists, pipe tables, **bold**, *italic*, `code`.
 * Returns plain data (no HTML strings), so React escapes everything and
 * nothing the model writes can inject markup.
 *
 * Block types: {type:"p", text} | {type:"ul", items:[text]} | {type:"table", header:[...], rows:[[...]]}
 * Inline:      parseInline(text) -> [{type:"text"|"bold"|"italic"|"code", value}]
 */
export function parseMarkdown(source) {
  const lines = String(source || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  const isTableRow = (line) => /^\s*\|.*\|\s*$/.test(line);
  const isSeparator = (line) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
  const cells = (line) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    if (isTableRow(line) && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      const header = cells(line);
      const rows = [];
      i += 2;
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(cells(lines[i]));
        i++;
      }
      blocks.push({ type: "table", header, rows });
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    const paragraph = [];
    while (i < lines.length && lines[i].trim() && !isTableRow(lines[i]) && !/^\s*[-*]\s+/.test(lines[i])) {
      paragraph.push(lines[i].replace(/^#+\s*/, ""));
      i++;
    }
    blocks.push({ type: "p", text: paragraph.join(" ") });
  }
  return blocks;
}

export function parseInline(text) {
  const parts = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|_[^_]+_)/g;
  let last = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: "text", value: text.slice(last, match.index) });
    const token = match[0];
    if (token.startsWith("**")) parts.push({ type: "bold", value: token.slice(2, -2) });
    else if (token.startsWith("`")) parts.push({ type: "code", value: token.slice(1, -1) });
    else parts.push({ type: "italic", value: token.slice(1, -1) });
    last = match.index + token.length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts;
}
