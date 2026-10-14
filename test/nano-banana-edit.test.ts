import assert from "node:assert/strict";
import test from "node:test";
import { setCalculatePowerRequested } from "../src/execution-mode.js";

test("Nano 2.1 model, size and panorama reach both runs and power estimates", async () => {
  const fetch = globalThis.fetch, log = console.log, error = console.error, exit = process.exit;
  const key = process.env.WESHOP_API_KEY;
  process.env.WESHOP_API_KEY = "test-only";
  let invocation = 0;
  const command = async () => (await import(`../src/commands/nano-banana-edit.js?test=${invocation++}`)).nanoBananaEditCmd;
  let requests: { url: string; body: any }[] = [];
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), body: JSON.parse(String(init?.body)) });
    return new Response(JSON.stringify({ success: true, data: { taskId: "t", executionId: "e", totalPower: 20, type: "image" } }));
  };
  console.log = console.error = () => {};
  process.exit = ((code: number) => { throw new Error(`exit ${code}`); }) as typeof process.exit;
  const run = async (args: string[], estimate = false) => {
    requests = [];
    setCalculatePowerRequested(estimate);
    await (await command()).parseAsync(["--prompt", "fixture", "--no-wait", ...args], { from: "user" });
    assert.equal(requests.length, 1);
    assert.match(requests[0].url, estimate ? /\/power-estimates$/ : /\/runs$/);
    assert.equal(requests[0].body.agent.name, "nano-banana-edit");
    return requests[0].body.params;
  };
  try {
    const defaults = await run([]);
    assert.equal(defaults.modelName, "nano2");
    assert.equal(defaults.imageSize, "1K");
    assert.equal(defaults.aspectRatio, "auto");
    for (const estimate of [false, true]) {
      for (const size of ["1K", "2K", "4K"]) {
        for (const ratio of ["1:4", "4:1", "1:8", "8:1"]) {
          const params = await run(["--model", "nano2.1", "--image-size", size, "--aspect-ratio", ratio], estimate);
          assert.equal(params.modelName, "nano2.1");
          assert.equal(params.imageSize, size);
          assert.equal(params.aspectRatio, ratio);
        }
      }
      for (const model of ["nano1", "nano", "nano2"]) assert.equal((await run(["--model", model], estimate)).modelName, model);
    }
    requests = [];
    await assert.rejects((await command()).parseAsync(["--model", "unknown"], { from: "user" }), /exit 1/);
    assert.equal(requests.length, 0);
  } finally {
    globalThis.fetch = fetch; console.log = log; console.error = error; process.exit = exit;
    setCalculatePowerRequested(false);
    if (key === undefined) delete process.env.WESHOP_API_KEY; else process.env.WESHOP_API_KEY = key;
  }
});
