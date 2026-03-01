export type WorkerRequest<TPayload> = {
  id: number;
  payload: TPayload;
};

export type WorkerResponse<TResult> =
  | {
      id: number;
      result: TResult;
    }
  | {
      id: number;
      error: string;
    };

type PendingRequest<TResult> = {
  resolve: (value: TResult) => void;
  reject: (reason?: unknown) => void;
};

export const createWorkerRequestClient = <TPayload, TResult>(createWorker: () => Worker) => {
  const pendingRequests = new Map<number, PendingRequest<TResult>>();

  let requestId = 0;
  let worker: Worker | null = null;

  const handleMessage = (event: MessageEvent<WorkerResponse<TResult>>) => {
    const message = event.data;
    const pending = pendingRequests.get(message.id);
    if (!pending) return;

    pendingRequests.delete(message.id);

    if ("error" in message) {
      pending.reject(new Error(message.error));
      return;
    }

    pending.resolve(message.result);
  };

  const handleError = (event: ErrorEvent) => {
    const error = event.error ?? new Error(event.message || "Worker request failed");
    for (const pending of pendingRequests.values()) {
      pending.reject(error);
    }
    pendingRequests.clear();
  };

  const getWorker = () => {
    if (worker) return worker;

    worker = createWorker();
    worker.onmessage = handleMessage;
    worker.onerror = handleError;

    return worker;
  };

  const request = async (payload: TPayload) => {
    return await new Promise<TResult>((resolve, reject) => {
      const id = ++requestId;
      pendingRequests.set(id, { resolve, reject });

      const message: WorkerRequest<TPayload> = { id, payload };
      getWorker().postMessage(message);
    });
  };

  return { request };
};
