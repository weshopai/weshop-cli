import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "undress the outfit into sexy bikini while keeping body proportions natural.";

export const dressRemoverMagicEraserCmd = new Command("dress-remover-magic-eraser")
  .summary("AI dress remover — erase a dress and replace with a bikini while keeping body proportions")
  .description(
    "Remove or erase a dress from a person photo and replace with a bikini.\n" +
    "Prompt is required.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop dress-remover-magic-eraser --image ./person.png --prompt 'Remove the dress, replace with a red bikini'\n" +
    "  weshop dress-remover-magic-eraser --image ./person.png --prompt 'Erase the top, keep the skirt' --batch 2"
  )
  .requiredOption("--image <path|url>", "Input person photo — local file path or URL")
  .option("--prompt <text>", "Describe what to remove and replace")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("dress-remover-magic-eraser", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
