import assert from "node:assert/strict";
import test from "node:test";
import { setCalculatePowerRequested } from "../src/execution-mode.js";

test("GPT image model request and preflight validation matrix", async () => {
  const fetch = globalThis.fetch, log = console.log, error = console.error, exit = process.exit;
  const key = process.env.WESHOP_API_KEY;
  process.env.WESHOP_API_KEY = "test-only";
  let invocation = 0;
  const command = async () => (await import(`../src/commands/gpt-image.js?test=${invocation++}`)).gptImageCmd;
  let requests: { url: string; body: any }[] = [];
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), body: JSON.parse(String(init?.body)) });
    return new Response(JSON.stringify({ success: true, data: { taskId: "t", executionId: "e", totalPower: 15, type: "image" } }));
  };
  console.log = console.error = () => {};
  process.exit = ((code: number) => { throw new Error(`exit ${code}`); }) as typeof process.exit;
  const run = async (args: string[], estimate = false) => {
    requests = [];
    setCalculatePowerRequested(estimate);
    await (await command()).parseAsync(["--prompt", "fixture", "--no-wait", ...args], { from: "user" });
    assert.equal(requests.length, 1);
    assert.match(requests[0].url, estimate ? /\/power-estimates$/ : /\/runs$/);
    return requests[0].body.params;
  };
  const images = (n: number) => ["--image", ...Array.from({ length: n }, (_, i) => `https://example.com/${i}.png`)];
  try {
    const defaults = await run([]);
    assert.equal(defaults.modelName, undefined);
    assert.equal(defaults.quality, "low"); assert.equal(defaults.imageSize, "1K"); assert.equal(defaults.aspectRatio, "3:4");
    await run(images(5));
    for (const model of ["gpt-image-2.5-flare", "gpt-image-2.5-sunburst"]) {
      for (const estimate of [false, true]) {
        for (const count of [0, 16]) {
          const params = await run(["--model", model, "--quality", "max", "--aspect-ratio", "4:5", ...(count ? images(count) : [])], estimate);
          assert.equal(params.modelName, model); assert.equal(params.quality, "max"); assert.equal(params.aspectRatio, "4:5");
          assert.equal(params.images?.length ?? 0, count);
        }
      }
      await run(["--model", model, "--quality", "xhigh", "--aspect-ratio", "5:4"]);
    }
    for (const args of [
      ["--model", "unknown"], ["--model", "gpt-image-2", "--quality", "max"],
      ["--model", "gpt-image-2", "--quality", "xhigh"], ["--model", "gpt-image-2", "--aspect-ratio", "4:5"],
      ["--model", "gpt-image-2", ...images(6)], ["--model", "gpt-image-2.5-flare", ...images(17)],
      ["--model", "gpt-image-2.5-sunburst", "--quality", "auto"],
    ]) {
      for (const estimate of [false, true]) {
        requests = []; setCalculatePowerRequested(estimate);
        await assert.rejects((await command()).parseAsync(["--prompt", "fixture", ...args], { from: "user" }), /exit 1/);
        assert.equal(requests.length, 0);
      }
    }
  } finally {
    globalThis.fetch = fetch; console.log = log; console.error = error; process.exit = exit;
    setCalculatePowerRequested(false);
    if (key === undefined) delete process.env.WESHOP_API_KEY; else process.env.WESHOP_API_KEY = key;
  }
});
