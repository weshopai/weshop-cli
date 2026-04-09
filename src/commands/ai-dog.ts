import { Command } from "commander";
import { executeRun } from "../run-helper.js";

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
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("ai-dog", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
