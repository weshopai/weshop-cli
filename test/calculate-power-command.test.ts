import assert from "node:assert/strict";
import test from "node:test";

test("--calculate-power routes a generation command to the estimate endpoint", async () => {
  const urls: string[] = [];
  const originalArgv = process.argv;
  const originalFetch = globalThis.fetch;
  const originalLog = console.log;
  process.env.WESHOP_API_KEY = "test-api-key";
  process.argv = ["node", "weshop", "gpt-image", "--prompt", "fixture", "--calculate-power"];
  globalThis.fetch = async (input) => {
    urls.push(String(input));
    return new Response(JSON.stringify({
      success: true,
      data: { totalPower: 15, type: "image", exclusive: false, paidPowerNotEnough: false },
    }), { headers: { "Content-Type": "application/json" } });
  };
  console.log = () => {};

  try {
    await import("../src/index.js");
  } finally {
    process.argv = originalArgv;
    globalThis.fetch = originalFetch;
    console.log = originalLog;
  }

  assert.equal(urls.length, 1);
  assert.match(urls[0], /\/agent\/power-estimates$/);
  assert.ok(!urls.some((url) => /\/agent\/runs(?:\/|$)/.test(url)));
});
