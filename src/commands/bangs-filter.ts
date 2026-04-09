import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "Give this person bangs naturally, don't change their hair color.";

export const bangsFilterCmd = new Command("bangs-filter")
  .summary("AI bangs filter — add natural-looking bangs to a person's hairstyle")
  .description(
    "Transform a portrait photo by adding natural-looking bangs while preserving\n" +
    "the original hair color and other details.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop bangs-filter --image ./person.png\n" +
    "  weshop bangs-filter --image ./person.png --prompt 'Add curtain bangs, keep the blonde color'\n" +
    "  weshop bangs-filter --image ./person.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input portrait image — local file path or URL")
  .option("--prompt <text>", "Custom bangs style instruction")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("bangs-filter", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
