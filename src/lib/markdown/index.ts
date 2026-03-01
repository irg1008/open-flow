import { createIsomorphicFn } from "@tanstack/react-start";
import type { MarkedOptions } from "marked";
import { sanitizeHtml } from "../html-sanitize";
import { createWorkerRequestClient } from "../worker";
import { parseMarkdown as mainThreadParseMarkdown } from "./markdown-parser";
import { ParseMarkdownPayload } from "./markdown.worker";

const getMarkdownWorkerClient = createIsomorphicFn()
  .server(() => null)
  .client(() => {
    return createWorkerRequestClient<ParseMarkdownPayload, string>(
      () => new Worker(new URL("./markdown.worker.ts", import.meta.url), { type: "module" })
    );
  });

const workerClient = getMarkdownWorkerClient();

const parseMarkdownWithWorker = async (
  markdown: string,
  baseUrl: string,
  options?: MarkedOptions
) => {
  if (!workerClient) return await mainThreadParseMarkdown(markdown, baseUrl, options);
  return await workerClient.request({ markdown, baseUrl, options });
};

export const parseMarkdown = async (markdown: string, baseUrl: string, options?: MarkedOptions) => {
  const html = await parseMarkdownWithWorker(markdown, baseUrl, options);
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
