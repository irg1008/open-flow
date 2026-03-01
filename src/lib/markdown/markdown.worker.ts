import { MarkedOptions } from "marked";
import { WorkerRequest, WorkerResponse } from "../worker";
import { parseMarkdown } from "./markdown-parser";

export type ParseMarkdownPayload = {
  markdown: string;
  baseUrl: string;
  options?: MarkedOptions;
};

type ParseMarkdownWorkerRequest = WorkerRequest<ParseMarkdownPayload>;
type ParseMarkdownWorkerResponse = WorkerResponse<string>;

self.onmessage = async (event: MessageEvent<ParseMarkdownWorkerRequest>) => {
  const { id, payload } = event.data;
  const { markdown, baseUrl, options } = payload;

  try {
    const html = await parseMarkdown(markdown, baseUrl, options);
    const message: ParseMarkdownWorkerResponse = { id, result: html };
    self.postMessage(message);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to parse markdown";
    const message: ParseMarkdownWorkerResponse = { id, error: errorMessage };
    self.postMessage(message);
  }
};
