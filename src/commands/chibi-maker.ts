import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "Turn this photo into a chibi sticker.";

export const chibiMakerCmd = new Command("chibi-maker")
  .summary("AI chibi maker — convert a photo into a cute chibi character sticker")
  .description(
    "Transform any photo into a cute chibi-style character or avatar sticker.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop chibi-maker --image ./person.png\n" +
    "  weshop chibi-maker --image ./person.png --prompt 'Chibi anime style with big sparkly eyes'\n" +
    "  weshop chibi-maker --image ./person.png --batch 4"
  )
  .requiredOption("--image <path|url>", "Input photo — local file path or URL")
  .option("--prompt <text>", "Custom chibi style instruction")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("chibi-maker", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
