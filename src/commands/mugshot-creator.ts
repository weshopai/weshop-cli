import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "Generate a mugshot of this person, height measurement background, keep face and appearance detail.";

export const mugshotCreatorCmd = new Command("mugshot-creator")
  .summary("AI mugshot creator — generate a police-style mugshot photo from a portrait")
  .description(
    "Transform a portrait photo into a police-style mugshot with height measurement\n" +
    "background while preserving face and appearance details.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop mugshot-creator --image ./person.png\n" +
    "  weshop mugshot-creator --image ./person.png --prompt 'Classic police mugshot, front and side view'\n" +
    "  weshop mugshot-creator --image ./person.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input portrait image — local file path or URL")
  .option("--prompt <text>", "Custom mugshot instruction")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("mugshot-creator", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
