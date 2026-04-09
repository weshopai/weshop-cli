import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "Turn this image into rough pencil sketch without changing details.";

export const imageToSketchCmd = new Command("image-to-sketch")
  .summary("AI image to sketch — convert a photo into a rough pencil sketch")
  .description(
    "Convert any photo into a rough pencil sketch while preserving the original details.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop image-to-sketch --image ./photo.png\n" +
    "  weshop image-to-sketch --image ./portrait.png --prompt 'Fine line art sketch, detailed shading'\n" +
    "  weshop image-to-sketch --image ./photo.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input image — local file path or URL")
  .option("--prompt <text>", "Custom sketch style instruction")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("image-to-sketch", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
