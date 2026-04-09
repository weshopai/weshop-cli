import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "Change the fabric to a super-thin and sheer material with no color, allowing for faint visibility through it.";

export const aiXrayClothesCmd = new Command("ai-xray-clothes")
  .summary("AI x-ray clothes filter — make clothing appear sheer and see-through")
  .description(
    "Transform a photo by making the clothing appear as a super-thin sheer material\n" +
    "with faint visibility through it.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop ai-xray-clothes --image ./person.png\n" +
    "  weshop ai-xray-clothes --image ./person.png --prompt 'Make the top appear as thin wet fabric'\n" +
    "  weshop ai-xray-clothes --image ./person.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input photo — local file path or URL")
  .option("--prompt <text>", "Custom sheer fabric instruction")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("ai-xray-clothes", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
