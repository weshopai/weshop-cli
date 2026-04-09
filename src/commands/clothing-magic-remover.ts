import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "undress the outfit into sexy bikini while keeping body proportions natural.";

export const clothingMagicRemoverCmd = new Command("clothing-magic-remover")
  .summary("AI clothing remover — erase accessories or partial clothing while keeping textures realistic")
  .description(
    "Remove or erase clothing items from a person photo while keeping textures realistic.\n" +
    "Prompt is required.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop clothing-magic-remover --image ./person.png --prompt 'Remove the jacket, keep the shirt'\n" +
    "  weshop clothing-magic-remover --image ./person.png --prompt 'Erase the top, replace with bikini' --batch 2"
  )
  .requiredOption("--image <path|url>", "Input person photo — local file path or URL")
  .option("--prompt <text>", "Describe what clothing to remove")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("clothing-magic-remover", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
