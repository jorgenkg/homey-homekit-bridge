import { sleep } from "./sleep";

export async function waitUntil(fn: () => Promise<boolean> | boolean, { timeoutMs = 6000, message = "Wait until never occurred", step = 50 }): Promise<void> {
  const before = Date.now();
  while (Date.now() - before < timeoutMs) {
    if (await fn()) {
      return;
    }
    await sleep(step);
  }
  throw new Error(message);
}
