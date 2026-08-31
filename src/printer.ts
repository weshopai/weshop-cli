import type { PollResponse, RunResponse } from "./client.js";

export function printSubmitted(data: RunResponse) {
  console.log("[submitted]");
  console.log(`  executionId: ${data.executionId}`);
}

export function printPollResult(data: PollResponse, billing?: Pick<RunResponse, "powerConsumption" | "powerBalanceAmount">) {
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
  if (Number.isFinite(billing?.powerConsumption)) {
    console.log(`  powerConsumption: ${billing!.powerConsumption}`);
  }
  if (Number.isFinite(billing?.powerBalanceAmount)) {
    console.log(`  powerBalanceAmount: ${billing!.powerBalanceAmount}`);
  }

  if (exec.status === "Failed") {
    console.log("  message: Generation failed");
  }

  if (exec.result.length) {
    const isVideo = exec.result.some((r) => r.video);
    const mediaLabel = isVideo ? "video" : "image";
    console.log(`  ${mediaLabel}Count: ${exec.result.length}`);
    exec.result.forEach((r, i) => {
      console.log(`  ${mediaLabel}[${i}]:`);
      console.log(`    status: ${r.status}`);
      if (r.video) {
        console.log(`    url: ${r.video}`);
        if (r.videoPoster) {
          console.log(`    poster: ${r.videoPoster}`);
        }
        if (r.lastFrame) {
          console.log(`    lastFrame: ${r.lastFrame}`);
        }
      } else {
        console.log(`    url: ${r.image ?? ""}`);
      }
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
