import assert from "node:assert/strict";
import test from "node:test";

import { setCalculatePowerRequested } from "../src/execution-mode.js";
import { executeRun } from "../src/run-helper.js";

process.env.WESHOP_API_KEY = "test-api-key";

test("calculate-power mode estimates once and never submits or polls a run", async () => {
  const urls: string[] = [];
  const output: string[] = [];
  const originalFetch = globalThis.fetch;
  const originalLog = console.log;
  globalThis.fetch = async (input) => {
    urls.push(String(input));
    return new Response(JSON.stringify({
      success: true,
      data: { totalPower: 80, type: "video", exclusive: false, paidPowerNotEnough: false },
    }), { headers: { "Content-Type": "application/json" } });
  };
  console.log = (...args: unknown[]) => output.push(args.join(" "));
  setCalculatePowerRequested(true);

  try {
    await executeRun(
      "kling",
      "v1.0",
      { images: ["https://example.com/frame.png"] },
      { modelName: "Kling_3_0", duration: "8s", batchCount: 1 },
    );
  } finally {
    setCalculatePowerRequested(false);
    globalThis.fetch = originalFetch;
    console.log = originalLog;
  }

  assert.equal(urls.length, 1);
  assert.match(urls[0], /\/agent\/power-estimates$/);
  assert.ok(!urls.some((url) => /\/agent\/runs(?:\/|$)/.test(url)));
  assert.ok(output.includes("[power-estimate]"));
  assert.ok(output.includes("  totalPower: 80"));
});
