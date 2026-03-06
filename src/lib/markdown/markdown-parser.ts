import hljs from "highlight.js";
import { Marked, type MarkedExtension, type MarkedOptions } from "marked";
import markedAlert from "marked-alert";
import { baseUrl as baseUrlExtension } from "marked-base-url";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";

const alertsExtension = markedAlert({ className: "alert" });
const headingExtension = gfmHeadingId();

const highlightExtension = markedHighlight({
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language }).value;
  }
});

const shouldAddRawQuery = (attr: string, url: string) => {
  if (attr === "href") return false;
  const includedDomains = ["github.com"];
  return includedDomains.some((domain) => url.includes(domain));
};

/**
 * Convert relative urls inside markdown html
 *
 * @param {string} baseUrl
 * @return {*}  {MarkedExtension}
 */
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

export type ParseMarkdownOptions = {
  markdown: string;
  baseUrl: string;
  options?: MarkedOptions;
};

export const parseMarkdown = async ({ markdown, baseUrl, options }: ParseMarkdownOptions) => {
  const marked = new Marked(
    baseUrlExtension(baseUrl),
    baseUrlHtmlExtension(baseUrl),
    headingExtension,
    alertsExtension,
    highlightExtension
  );

  return await marked.parse(markdown, options);
};
