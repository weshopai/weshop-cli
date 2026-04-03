import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "./client.js";
import { printSubmitted, printPollResult, printError } from "./printer.js";

export interface RunOptions {
  image: string;
  wait?: boolean;
}

export async function executeRun(
  agentName: string,
  agentVersion: string,
  opts: RunOptions,
  params: Record<string, unknown>,
  extraInput: Record<string, unknown> = {}
) {
  try {
    const { url: imageUrl } = await resolveImage(opts.image);
    console.log("[image]");
    console.log(`  imageUrl: ${imageUrl}`);

    const body: RunRequest = {
      agent: { name: agentName, version: agentVersion },
      input: { originalImage: imageUrl, ...extraInput },
      params,
    };

    const { executionId } = await submitRun(body);
    printSubmitted(executionId);

    if (opts.wait !== false) {
      const data = await waitForCompletion(executionId);
      printPollResult(data);
    } else {
      console.log("[info]");
      console.log(`  message: Use 'weshop status ${executionId}' to check progress`);
    }
  } catch (err) {
    printError(err);
    process.exit(1);
  }
}
