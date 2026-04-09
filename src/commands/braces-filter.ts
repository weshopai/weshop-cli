import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "Add braces in this person's tooth";

export const bracesFilterCmd = new Command("braces-filter")
  .summary("AI braces filter — add dental braces to a person's teeth in a portrait photo")
  .description(
    "Transform a portrait photo by adding realistic dental braces to the person's teeth.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop braces-filter --image ./person.png\n" +
    "  weshop braces-filter --image ./person.png --prompt 'Add colorful rubber band braces'\n" +
    "  weshop braces-filter --image ./person.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input portrait image — local file path or URL")
  .option("--prompt <text>", "Custom braces instruction")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("braces-filter", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
