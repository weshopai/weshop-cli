import type { PollResponse } from "./client.js";

export function printSubmitted(executionId: string) {
  console.log("[submitted]");
  console.log(`  executionId: ${executionId}`);
}

export function printPollResult(data: PollResponse) {
  const exec = data.executions.at(-1);
  if (!exec) {
    console.log("[result]");
    console.log("  status: Unknown");
    console.log("  message: No execution data available");
    return;
  }

  console.log("[result]");
  console.log(`  agent: ${data.agentName} ${data.agentVersion}`);
  console.log(`  executionId: ${exec.executionId}`);
  console.log(`  status: ${exec.status}`);

  if (exec.status === "Failed") {
    console.log("  message: Generation failed");
  }

  if (exec.result.length) {
    console.log(`  imageCount: ${exec.result.length}`);
    exec.result.forEach((r, i) => {
      console.log(`  image[${i}]:`);
      console.log(`    status: ${r.status}`);
      console.log(`    url: ${r.image ?? ""}`);
    });
  }
}

export function printUpload(url: string) {
  console.log("[uploaded]");
  console.log(`  imageUrl: ${url}`);
}

export function printError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error("[error]");
  console.error(`  message: ${msg}`);
}
