import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "Change this person's gender to the opposite one.";

export const genderSwapCmd = new Command("gender-swap")
  .summary("AI gender swap — transform a portrait to the opposite gender while preserving identity")
  .description(
    "Transform a portrait photo to show the person as the opposite gender.\n" +
    "Preserves facial identity, features, and photo realism.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop gender-swap --image ./person.png\n" +
    "  weshop gender-swap --image ./person.png --prompt 'Change to female, keep the hairstyle'\n" +
    "  weshop gender-swap --image ./person.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input portrait image — local file path or URL")
  .option("--prompt <text>", "Custom gender transformation instruction")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("gender-swap", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
