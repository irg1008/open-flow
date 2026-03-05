import { getRootTheme } from "@/lib/theme";
import parse, { attributesToProps, DOMNode, domToReact } from "html-react-parser";

export const parseHtml = async (markdown: string) => {
  return parse(markdown, {
    replace: (domNode) => {
      if (domNode.type !== "tag") return;
      const { attribs, name, children } = domNode;
      const props = attributesToProps(attribs);

      // Handle images with theme-based sources
      if (name === "source") {
        const { media } = attribs;
        const alreadySet = attribs["data-theme"];
        if (alreadySet) return;

        const theme = getRootTheme();

        const isDark = media === "(prefers-color-scheme: dark)";
        const sourceTheme = isDark ? "dark" : "light";

        return (
          <source
            {...props}
            data-theme={isDark ? "dark" : "light"}
            media={theme === sourceTheme ? "all" : "not all"}
          />
        );
      }

      // Set lazy loading for images
      if (name === "img") {
        return <img {...props} alt={attribs.alt} loading="lazy" />;
      }

      // Open links in a new tab
      if (name === "a") {
        return (
          <a {...props} target="_blank" rel="noopener noreferrer">
            {domToReact(children as DOMNode[])}
          </a>
        );
      }
    }
  });
};
