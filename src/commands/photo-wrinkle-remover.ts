import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "Remove wrinkles from this person";

export const photoWrinkleRemoverCmd = new Command("photo-wrinkle-remover")
  .summary("Photo wrinkle remover — smooth facial wrinkles in portrait photos while keeping natural skin texture")
  .description(
    "Remove or soften facial wrinkles in a portrait photo while preserving natural skin texture and identity.\n\n" +
      "Provide one portrait image. The agent focuses on wrinkle areas and keeps lighting and overall appearance natural.\n\n" +
      "Default prompt (used when --prompt is omitted):\n" +
      `  "${DEFAULT_PROMPT}"\n\n` +
      "Examples:\n" +
      "  weshop photo-wrinkle-remover --image ./portrait.png\n" +
      "  weshop photo-wrinkle-remover --image ./face.jpg --prompt 'Gently reduce forehead and eye wrinkles, keep natural skin texture'\n" +
      "  weshop photo-wrinkle-remover --image ./photo.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input portrait image — local file path or URL")
  .option("--prompt <text>", "Custom wrinkle removal instructions (optional)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      textDescription: opts.prompt ?? DEFAULT_PROMPT,
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("photo-wrinkle-remover", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });

