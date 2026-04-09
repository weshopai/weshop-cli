import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "A minimalist flat-art vector illustration of a stylized anime face, Japanense style drawing. The face must be a square close-up 1:1 ratio, no background. No gradients, solid colors only, 2D minimalist aesthetic, no background.";

export const squareFaceIconGeneratorCmd = new Command("square-face-icon-generator")
  .summary("AI square face icon generator — create a minimalist anime-style square face avatar from a photo")
  .description(
    "Generate a minimalist flat-art anime-style square face icon from a reference photo.\n" +
    "Image is optional — text-only generation is supported.\n\n" +
    "The output is a 1:1 square icon with solid colors, no gradients, and a 2D minimalist aesthetic.\n" +
    "Features include stylized eyes, nose, mouth, skin tone, hair, and accessories (glasses if present).\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    "  Minimalist flat-art anime face, 1:1 square, solid colors, no background.\n\n" +
    "Examples:\n" +
    "  weshop square-face-icon-generator --image ./person.png\n" +
    "  weshop square-face-icon-generator --prompt 'Anime face icon, blue hair, happy expression'\n" +
    "  weshop square-face-icon-generator --image ./person.png --batch 4"
  )
  .option("--image <path|url>", "Reference portrait image — local file path or URL (optional)")
  .option("--prompt <text>", "Custom face icon description")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("square-face-icon-generator", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
