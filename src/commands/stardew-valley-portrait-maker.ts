import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "Generate a Stardew Valley Style Head Portrait image, 1:1 ratio, 45 angle toward left, try to replicate exactly as the game.";

export const stardewValleyPortraitMakerCmd = new Command("stardew-valley-portrait-maker")
  .summary("AI Stardew Valley portrait maker — create a Stardew Valley game-style character portrait")
  .description(
    "Generate a Stardew Valley-style head portrait from a reference photo or text description.\n" +
    "Image is optional — text-only generation is supported.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop stardew-valley-portrait-maker --image ./person.png\n" +
    "  weshop stardew-valley-portrait-maker --prompt 'Stardew Valley farmer with red hair and overalls'\n" +
    "  weshop stardew-valley-portrait-maker --image ./person.png --batch 2"
  )
  .option("--image <path|url>", "Reference portrait image — local file path or URL (optional)")
  .option("--prompt <text>", "Custom character description (default: Stardew Valley style portrait)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("stardew-valley-portrait-maker", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
