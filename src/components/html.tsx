import { getUpdatedSourceAttributtes, UserTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import parse, {
  attributesToProps,
  DOMNode,
  domToReact,
  HTMLReactParserOptions
} from "html-react-parser";
import { CheckIcon, CopyIcon } from "lucide-react";
import { createRef } from "react";
import { Button } from "./ui/button";

export type HtmlProps = {
  content: string;
  theme?: UserTheme;
  as?: React.ElementType;
} & React.ComponentPropsWithoutRef<"div">;

const getOptions = (theme?: UserTheme): HTMLReactParserOptions => {
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return {
    replace: (domNode) => {
      if (domNode.type !== "tag") return;
      const { attribs, name, children } = domNode;
      const props = attributesToProps(attribs);

      const getChildren = () => {
        return domToReact(children as DOMNode[], getOptions(theme));
      };

      // Handle images with theme-based sources
      if (name === "source") {
        if (!theme) return;

        const { media, "data-theme": dataTheme } = attribs;
        const newAttribs = getUpdatedSourceAttributtes(theme, media, dataTheme);
        if (!newAttribs) return;

        return <source {...props} data-theme={newAttribs.dataTheme} media={newAttribs.media} />;
      }

      // Set lazy loading for images
      if (name === "img") {
        return <img {...props} alt={attribs.alt} loading="lazy" />;
      }

      // Open links in a new tab
      if (name === "a") {
        return (
          <a {...props} target="_blank" rel="noopener noreferrer">
            {getChildren()}
          </a>
        );
      }

      // Add copy button in code blocks
      if (name === "pre") {
        const ref = createRef<HTMLPreElement>();

        return (
          <div className="group relative">
            <Button
              size="icon-sm"
              variant="secondary"
              className="group/copy absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100"
              onClick={() => copyToClipboard(ref.current?.innerText || "")}
            >
              <CopyIcon className="transition-transform group-focus/copy:scale-0" />
              <CheckIcon className="absolute scale-0 transition-transform group-focus/copy:scale-100" />
            </Button>
            <pre ref={ref} {...props}>
              {getChildren()}
            </pre>
          </div>
        );
      }
    }
  };
};

export const parseHtml = ({ content, theme }: Pick<HtmlProps, "content" | "theme">) =>
  parse(content, getOptions(theme));

export const Html = ({ content, theme, as, className, ...props }: HtmlProps) => {
  const Component = as || "div";
  return (
    <Component {...props} className={cn("typography", className)}>
      {parseHtml({ content, theme })}
    </Component>
  );
};
