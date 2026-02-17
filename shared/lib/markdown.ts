import hljs from "highlight.js";
import { Marked, type MarkedExtension, type MarkedOptions } from "marked"; // Import Class 'Marked'
import { baseUrl as baseUrlExtension } from "marked-base-url";
import { markedHighlight } from "marked-highlight";

export const highlightExtension = markedHighlight({
  langPrefix: "block language-",
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language }).value;
  }
});

export const baseUrlHtmlExtension = (baseUrl: string): MarkedExtension => ({
  walkTokens(token) {
    if (token.type === "html" && typeof token.text === "string") {
      token.text = token.text.replace(/(src|href)=["']([^"']+)["']/g, (match, attr, url) => {
        // Ignore absolute URLs and anchors
        if (/^https?:\/\//.test(url) || url.startsWith("#")) {
          return match;
        }

        const cleanPath = url.startsWith("/") ? url.slice(1) : url;
        const absolute = new URL(cleanPath, baseUrl).href;
        return `${attr}="${absolute}"`;
      });
    }
  }
});

export const parseRemoteMarkdown = async (
  markdownUrl: string,
  baseUrl: string,
  options?: MarkedOptions
) => {
  const marked = new Marked(
    baseUrlExtension(baseUrl),
    baseUrlHtmlExtension(baseUrl),
    highlightExtension
  );

  const response = await fetch(markdownUrl);
  if (response.status !== 200) return null;

  const markdown = await response.text();
  const content = marked.parse(markdown, options);

  return content;
};

export const parseRemoteGithubMarkdown = async (user: string, repo: string, branch: string) => {
  const rawUrl = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/`;
  const markdownUrl = `${rawUrl}README.md`;
  return await parseRemoteMarkdown(markdownUrl, rawUrl, { gfm: true, breaks: true });
};
