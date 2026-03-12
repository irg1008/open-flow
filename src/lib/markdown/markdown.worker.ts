import { WorkerRequest, WorkerResponse } from "../worker";
import { parseMarkdown, type ParseMarkdownOptions } from "./markdown-parser";

type ParseMarkdownWorkerRequest = WorkerRequest<ParseMarkdownOptions>;
type ParseMarkdownWorkerResponse = WorkerResponse<string>;

self.onmessage = async (event: MessageEvent<ParseMarkdownWorkerRequest>) => {
  const { id, payload } = event.data;

  try {
    const html = await parseMarkdown(payload);
    const message: ParseMarkdownWorkerResponse = { id, result: html };
    self.postMessage(message);
  } catch (error) {
    const errorMessage = Error.isError(error) ? error.message : "Failed to parse markdown";
    const message: ParseMarkdownWorkerResponse = { id, error: errorMessage };
    self.postMessage(message);
  }
};
