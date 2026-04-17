import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "Crop the head and create a 2-inch ID photo in [offical Travel ID style] with: [white background];[Professional business attire], maintain exact facial features";

export const aiHeadshotGeneratorCmd = new Command("ai-headshot-generator")
  .summary("AI headshot generator — create professional ID-style headshots from a single portrait photo")
  .description(
    "Generate professional ID-style or business headshots from a single portrait image.\n\n" +
      "Provide one portrait image. The agent crops and reformats it into an ID-style or profile headshot while preserving facial identity.\n\n" +
      "Default prompt (used when --prompt is omitted):\n" +
      `  "${DEFAULT_PROMPT}"\n\n` +
      "Examples:\n" +
      "  weshop ai-headshot-generator --image ./portrait.png\n" +
      "  weshop ai-headshot-generator --image ./selfie.jpg --prompt 'LinkedIn profile headshot, soft natural lighting, business casual outfit'\n" +
      "  weshop ai-headshot-generator --image ./photo.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input portrait image — local file path or URL")
  .option("--prompt <text>", "Custom headshot style and composition instructions (optional)")
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

    await executeRun("ai-headshot-generator", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });

