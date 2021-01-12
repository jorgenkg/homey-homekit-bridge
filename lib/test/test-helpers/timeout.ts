import { sleep } from "./sleep";

export async function timeout<T>(fn: Promise<T> | (() => Promise<T>), { timeoutMs = 6000, message = "Timed out" }: {
  timeoutMs?: number;
  message?: string;
} = {}): Promise<T> {
  return Promise
    .race([
      (async() => {
        if ("then" in fn) {
          return await fn;
        }
        else {
          return await fn();
        }
      })(),
      sleep(timeoutMs).then(() => Promise.reject(new Error(message)))
    ]);
}
