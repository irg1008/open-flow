import hljs from "highlight.js";
import { Marked, type MarkedExtension, type MarkedOptions } from "marked";
import markedAlert from "marked-alert";
import { baseUrl as baseUrlExtension } from "marked-base-url";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";

const highlightExtension = markedHighlight({
  langPrefix: "block language-",
  emptyLangClass: "block",
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language }).value;
  }
});

const alertsExtension = markedAlert({ className: "alert" });

const headingExtension = gfmHeadingId();

const shouldAddRawQuery = (attr: string, url: string) => {
  if (attr !== "src") return false;
  const excludedDomains = ["img.shields.io", "badgen.net"];
  return !excludedDomains.some((domain) => url.includes(domain));
};

const baseUrlHtmlExtension = (baseUrl: string): MarkedExtension => ({
  walkTokens(token) {
    if (token.type === "html" && typeof token.text === "string") {
      token.text = token.text.replace(
        /(src|href|srcset)=["']([^"']+)["']/g,
        (_match, attr, url) => {
          const srcRaw = shouldAddRawQuery(attr, url) ? "?raw=true" : "";

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

export const parseMarkdown = async (markdown: string, baseUrl: string, options?: MarkedOptions) => {
  const marked = new Marked(
    baseUrlExtension(baseUrl),
    baseUrlHtmlExtension(baseUrl),
    headingExtension,
    alertsExtension,
    highlightExtension
  );

  return await marked.parse(markdown, options);
};
