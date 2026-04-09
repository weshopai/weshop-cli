import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "Pet taking a bath. Maintain realistic proportions including the number of limbs.";

export const aiDogCmd = new Command("ai-dog")
  .summary("AI pet portrait generator — create or transform pet photos with a text prompt; image is optional")
  .description(
    "Generate or transform pet photos using AI. Can create a pet image from text alone,\n" +
    "or transform an existing pet photo based on your prompt.\n\n" +
    "Image is optional — when omitted, the agent generates a pet from the prompt alone.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop ai-dog --prompt 'A golden retriever playing in the snow'\n" +
    "  weshop ai-dog --image ./my-dog.png --prompt 'My dog wearing a party hat'\n" +
    "  weshop ai-dog --image ./pet.png --batch 4\n" +
    "  weshop ai-dog --no-wait --prompt 'A cute corgi on a beach'"
  )
  .option("--image <path|url>", "Input pet photo — local file path or URL (optional)")
  .option("--prompt <text>", "Describe the desired pet scene or transformation")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const params: Record<string, unknown> = {
        textDescription: opts.prompt ?? DEFAULT_PROMPT,
      };
      if (opts.batch != null) params.batchCount = opts.batch;

      const input: Record<string, unknown> = {};
      if (opts.taskName) input.taskName = opts.taskName;

      if (opts.image) {
        const { url: imageUrl } = await resolveImage(opts.image);
        params.images = [imageUrl];
        input.originalImage = imageUrl;
      }

      const body: RunRequest = {
        agent: { name: "ai-dog", version: "v1.0" },
        input,
        params,
      };

      const { executionId } = await submitRun(body);
      printSubmitted(executionId);

      if (opts.wait !== false) {
        printPollResult(await waitForCompletion(executionId));
      } else {
        console.log("[info]");
        console.log(`  message: Use 'weshop status ${executionId}' to check progress`);
      }
    } catch (err) {
      printError(err);
      process.exit(1);
    }
  });
