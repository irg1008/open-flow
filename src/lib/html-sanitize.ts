import DOMPurify, { Config } from "dompurify";
import { setNeutralPictureSource } from "./theme";

export const sanitizeHtml = (html: string, options?: Config) => {
  DOMPurify.addHook("afterSanitizeAttributes", async (node) => {
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

    if (node.tagName === "IMG") {
      node.setAttribute("loading", "lazy");
    }
  });

  return DOMPurify.sanitize(html, options);
};
