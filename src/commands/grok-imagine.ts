import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const grokImagineCmd = new Command("grok-imagine")
  .summary("Grok Imagine image generator — create high-resolution images from text using xAI Aurora")
  .description(
    "Generate high-resolution images from text using xAI's Aurora model (Grok Imagine).\n" +
    "Image is optional.\n\n" +
    "Examples:\n" +
    "  weshop grok-imagine --prompt 'A photorealistic astronaut on Mars at sunset'\n" +
    "  weshop grok-imagine --image ./reference.png --prompt 'In this style, a futuristic city'\n" +
    "  weshop grok-imagine --prompt 'Abstract art with neon colors' --batch 4"
  )
  .option("--image <path|url>", "Reference image — local file path or URL (optional)")
  .requiredOption("--prompt <text>", "Describe the desired image")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("grok-imagine", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
