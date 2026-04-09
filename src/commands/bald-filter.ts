import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "Change the hairstyle to bald. Don't change any other detail or face.";

export const baldFilterCmd = new Command("bald-filter")
  .summary("AI bald filter — make a person appear bald while preserving all other facial details")
  .description(
    "Transform a portrait photo by removing the hair to make the person appear bald.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop bald-filter --image ./person.png\n" +
    "  weshop bald-filter --image ./person.png --prompt 'Make bald with a shiny head'\n" +
    "  weshop bald-filter --image ./person.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input portrait image — local file path or URL")
  .option("--prompt <text>", "Custom instruction (default: bald, no other changes)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("bald-filter", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
