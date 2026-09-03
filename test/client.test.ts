import assert from "node:assert/strict";
import test from "node:test";

import { createRunIdempotencyKey, fetchAgentInfo, submitRun, type RunRequest } from "../src/client.js";

process.env.WESHOP_API_KEY = "test-api-key";

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

test("fetchAgentInfo sends the default pagination parameters", async () => {
  const urls: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    urls.push(String(input));
    return new Response(JSON.stringify({ success: true, data: {} }), {
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    await fetchAgentInfo("aimodel", "v1.0");
  } finally {
    globalThis.fetch = originalFetch;
  }

  const url = new URL(urls[0]);
  assert.equal(url.searchParams.get("agentName"), "aimodel");
  assert.equal(url.searchParams.get("agentVersion"), "v1.0");
  assert.equal(url.searchParams.get("page"), "1");
  assert.equal(url.searchParams.get("pageSize"), "50");
  assert.equal(url.searchParams.get("resourceType"), null);
});

test("fetchAgentInfo sends custom pagination and resource type parameters", async () => {
  const urls: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    urls.push(String(input));
    return new Response(JSON.stringify({ success: true, data: {} }), {
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    await fetchAgentInfo("aimodel", "v1.0", 3, 100, "locations");
  } finally {
    globalThis.fetch = originalFetch;
  }

  const url = new URL(urls[0]);
  assert.equal(url.searchParams.get("page"), "3");
  assert.equal(url.searchParams.get("pageSize"), "100");
  assert.equal(url.searchParams.get("resourceType"), "locations");
});
