import assert from "node:assert/strict";
import test from "node:test";

import { createRunIdempotencyKey, submitRun, type RunRequest } from "../src/client.js";

const body: RunRequest = {
  agent: { name: "z-image", version: "v1.0" },
  input: {},
  params: { textDescription: "fixture", batchCount: 1 },
  safeGenerate: "off",
};

test("submitRun forwards the logical-run idempotency key", async () => {
  const headers: Headers[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    headers.push(new Headers(init?.headers));
    return new Response(JSON.stringify({
      success: true,
      data: { taskId: "task-1", executionId: "execution-1" },
    }), { headers: { "Content-Type": "application/json" } });
  };

  try {
    await submitRun(body, "logical-run-1");
    await submitRun(body, "logical-run-1");
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.deepEqual(
    headers.map((value) => value.get("Idempotency-Key")),
    ["logical-run-1", "logical-run-1"],
  );
});

test("separate CLI runs receive different idempotency keys", () => {
  assert.notEqual(createRunIdempotencyKey(), createRunIdempotencyKey());
});
