// Explicit Markdown wins ties; wildcard-only browser requests retain HTML.
export function prefersMarkdown(accept: string): boolean {
  const ranges = accept.toLowerCase().split(",").map((range) => {
    const [type, ...parameters] = range.trim().split(";");
    const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));
    const q = quality ? Number(quality.trim().slice(2)) : 1;
    return { type: type.trim(), q: Number.isFinite(q) && q >= 0 && q <= 1 ? q : 0 };
  });
  const markdown = ranges.find(({ type }) => type === "text/markdown")?.q ?? 0;
  const html = ranges.find(({ type }) => type === "text/html")?.q
    ?? ranges.find(({ type }) => type === "text/*")?.q
    ?? ranges.find(({ type }) => type === "*/*")?.q ?? 0;
  return markdown > 0 && markdown >= html;
}

export const markdownHeaders = {
  "Content-Type": "text/markdown; charset=utf-8",
  Vary: "Accept",
  "Cache-Control": "private, no-store",
};
