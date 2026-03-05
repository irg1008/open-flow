import { createIsomorphicFn } from "@tanstack/react-start";
import type { MarkedOptions } from "marked";
import { createWorkerRequestClient } from "../worker";
import { parseMarkdown as mainThreadParseMarkdown, ParseMarkdownOptions } from "./markdown-parser";

const parseMarkdown = createIsomorphicFn()
  .server(async (options: ParseMarkdownOptions) => {
    return mainThreadParseMarkdown(options);
  })
  .client((options: ParseMarkdownOptions) => {
    const worker = createWorkerRequestClient<ParseMarkdownOptions, string>(
      () => new Worker(new URL("./markdown.worker.ts", import.meta.url), { type: "module" })
    );
    return worker.request(options);
  });

export const parseRemoteMarkdown = async (
  markdownUrl: string,
  baseUrl: string,
  options?: MarkedOptions
): Promise<string | null> => {
  const response = await fetch(markdownUrl);
  if (!response.ok) return null;

  const markdown = await response.text();

  // Check if the markdown is actually a sub-markdown file (e.g., README.md that points to another markdown file)
  const isOneLiner = markdown.trim().split("\n").length === 1;
  const isSubMarkdown = markdown.trim().endsWith(".md");
  if (isOneLiner && isSubMarkdown) {
    const subMarkdownUrl = new URL(markdown.trim(), baseUrl).href;
    return await parseRemoteMarkdown(subMarkdownUrl, baseUrl, options);
  }

  return await parseMarkdown({ markdown, baseUrl, options });
};
