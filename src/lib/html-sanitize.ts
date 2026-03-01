import DOMPurify from "dompurify";
import { setNeutralPictureSource } from "./theme";

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
