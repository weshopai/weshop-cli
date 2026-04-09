import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "Change skin tone to a healthy wheat color while keeping original face detail and lighting composition.";

export const skinColorChangerCmd = new Command("skin-color-changer")
  .summary("AI skin color changer — change a person's skin tone while preserving face details")
  .description(
    "Transform a portrait photo by changing the skin tone while preserving original\n" +
    "face details and lighting composition.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop skin-color-changer --image ./person.png\n" +
    "  weshop skin-color-changer --image ./person.png --prompt 'Change skin tone to a deep tan'\n" +
    "  weshop skin-color-changer --image ./person.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input portrait image — local file path or URL")
  .option("--prompt <text>", "Custom skin tone instruction (default: healthy wheat color)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("skin-color-changer", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
