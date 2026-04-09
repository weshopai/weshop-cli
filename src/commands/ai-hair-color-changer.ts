import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "Change hair color naturally. choose whatever suit the person's skin tone or randomly between Rose Gold/Pinkish Brown/Dark Blue. Don't change hair style or other details.";

export const aiHairColorChangerCmd = new Command("ai-hair-color-changer")
  .summary("AI hair color changer — change a person's hair color while preserving hairstyle and details")
  .description(
    "Transform a portrait photo by changing the hair color naturally.\n" +
    "Preserves the original hairstyle and all other details.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop ai-hair-color-changer --image ./person.png\n" +
    "  weshop ai-hair-color-changer --image ./person.png --prompt 'Change hair to platinum blonde'\n" +
    "  weshop ai-hair-color-changer --image ./person.png --batch 4"
  )
  .requiredOption("--image <path|url>", "Input portrait image — local file path or URL")
  .option("--prompt <text>", "Custom hair color instruction (default: AI-chosen color for skin tone)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("ai-hair-color-changer", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
