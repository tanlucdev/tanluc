import { NextResponse, type NextRequest } from "next/server";
import { WORK } from "./content/work";
import { HOME_SHOWCASE } from "./content/home-showcase";
import { markdownHeaders, prefersMarkdown } from "./lib/markdown";

const pages = new Set(["/about", "/work", "/play", "/photography", ...WORK.map(({ slug }) => `/work/${slug}`)]);
const publicFiles = new Set<string>(JSON.parse(process.env.AGENT_PUBLIC_FILES ?? "[]"));

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/\/$/, "") || "/";
  if (path !== "/" && (pages.has(path) || publicFiles.has(path))) {
    return NextResponse.next();
  }
  if (!["GET", "HEAD"].includes(request.method) || !prefersMarkdown(request.headers.get("accept") ?? "")) {
    const response = NextResponse.next();
    response.headers.set("Vary", "Accept");
    return response;
  }
  if (path !== "/") {
    return new NextResponse(request.method === "HEAD" ? null : "# Page not found\n\nThe requested page does not exist on Tan Luc's portfolio.\n\nSee [agent instructions](https://tanluc.dev/llms.txt) or the [sitemap](https://tanluc.dev/sitemap.xml) to find available content.\n", {
      status: 404,
      headers: markdownHeaders,
    });
  }
  const body = [
    "# Tan Luc — Software Engineer",
    "I'm a software engineer based in Vietnam. I build dependable, thoughtful products and care about the small interactions that make software feel natural.",
    "## Selected work",
    ...HOME_SHOWCASE.map((project) => `### ${project.title}\n\n${project.company}${project.role ? ` · ${project.role}` : ""}\n\n${project.summary}${project.url ? `\n\n[Visit ${project.title}](${project.url})` : ""}`),
    "## Learn more",
    "- [About Tan Luc](https://tanluc.dev/about/)\n- [Work and case studies](https://tanluc.dev/work/)\n- [Photography](https://tanluc.dev/photography/)\n- [Resume](https://tanluc.dev/documents/nguyen-tan-luc-cv.pdf)\n- [Agent instructions](https://tanluc.dev/llms.txt)\n- [Sitemap](https://tanluc.dev/sitemap.xml)",
  ].join("\n\n") + "\n";
  return new NextResponse(request.method === "HEAD" ? null : body, { headers: markdownHeaders });
}

export const config = {
  matcher: "/((?!_next/static|_next/image).*)",
};
