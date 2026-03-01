import { setNeutralPictureSource } from "@/lib/theme";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import { Marked, type MarkedExtension, type MarkedOptions } from "marked"; // Import Class 'Marked'
import markedAlert from "marked-alert";
import { baseUrl as baseUrlExtension } from "marked-base-url";
import { markedHighlight } from "marked-highlight";

export const highlightExtension = markedHighlight({
  langPrefix: "block language-",
  emptyLangClass: "block",
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language }).value;
  }
});

export const alertsExtension = markedAlert({ className: "alert" });

const shouldAddRawQuery = (attr: string, url: string) => {
  if (attr !== "src") return false;
  const excludedDomains = ["img.shields.io", "badgen.net"];
  return !excludedDomains.some((domain) => url.includes(domain));
};

export const baseUrlHtmlExtension = (baseUrl: string): MarkedExtension => ({
  walkTokens(token) {
    if (token.type === "html" && typeof token.text === "string") {
      token.text = token.text.replace(
        /(src|href|srcset)=["']([^"']+)["']/g,
        (_match, attr, url) => {
          const srcRaw = shouldAddRawQuery(attr, url) ? "?raw=true" : "";

          // Ignore absolute URLs and anchors
          if (/^https?:\/\//.test(url) || url.startsWith("#")) {
            return `${attr}="${url}${srcRaw}"`;
          }

          const cleanPath = url.startsWith("/") ? url.slice(1) : url;
          const absolute = new URL(cleanPath, baseUrl).href;
          return `${attr}="${absolute}${srcRaw}"`;
        }
      );
    }
  }
});

export const sanitizeHtml = (html: string) => {
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      const href = node.getAttribute("href");

      if (href && /^https?:\/\//.test(href)) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    }

    if (node.tagName === "SOURCE") {
      setNeutralPictureSource(node);
    }
  });

  return DOMPurify.sanitize(html);
};

export const parseMarkdown = async (markdown: string, baseUrl: string, options?: MarkedOptions) => {
  const marked = new Marked(
    baseUrlExtension(baseUrl),
    baseUrlHtmlExtension(baseUrl),
    alertsExtension,
    highlightExtension
  );

  const html = await marked.parse(markdown, options);
  return sanitizeHtml(html);
};

export const parseRemoteMarkdown = async (
  markdownUrl: string,
  baseUrl: string,
  options?: MarkedOptions
): Promise<string | null> => {
  const response = await fetch(markdownUrl);
  if (response.status !== 200) return null;

  const markdown = await response.text();

  // Check if the markdown is actually a sub-markdown file (e.g., README.md that points to another markdown file)
  const isOneLiner = markdown.trim().split("\n").length === 1;
  const isSubMarkdown = markdown.trim().endsWith(".md");
  if (isOneLiner && isSubMarkdown) {
    const subMarkdownUrl = new URL(markdown.trim(), baseUrl).href;
    return await parseRemoteMarkdown(subMarkdownUrl, baseUrl, options);
  }

  return await parseMarkdown(markdown, baseUrl, options);
};

export const parseRemoteGithubMarkdown = async (user: string, repo: string, branch: string) => {
  const rawUrl = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/`;

  const markdownNameVariants = ["README.md", "readme.md", "Readme.md"];

  for (const markdownName of markdownNameVariants) {
    const markdownUrl = `${rawUrl}${markdownName}`;
    const result = await parseRemoteMarkdown(markdownUrl, rawUrl, { gfm: true });
    if (result) return result;
  }

  return null;
};
