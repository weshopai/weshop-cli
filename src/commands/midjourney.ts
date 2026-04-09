import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const midjourneyCmd = new Command("midjourney")
  .summary("Midjourney image generator — create high-quality images using Midjourney v6.1, v7, or Niji 6")
  .description(
    "Generate images using Midjourney models. Image is optional.\n\n" +
    "Model (--model):\n" +
    "  Midjourney_6_1   Midjourney v6.1 (default)\n" +
    "  Midjourney_7     Midjourney v7\n" +
    "  Midjourney_Niji_6  Niji 6 — anime style\n\n" +
    "Aspect ratio (--aspect-ratio):\n" +
    "  1:1, 4:3, 3:4, 16:9, 9:16  (default: 1:1)\n\n" +
    "Examples:\n" +
    "  weshop midjourney --prompt 'A futuristic city at sunset, cinematic lighting'\n" +
    "  weshop midjourney --image ./reference.png --prompt 'In the style of this image, a mountain landscape'\n" +
    "  weshop midjourney --prompt 'Anime girl in a forest' --model Midjourney_Niji_6 --aspect-ratio 9:16"
  )
  .option("--image <path|url>", "Reference image — local file path or URL (optional)")
  .requiredOption("--prompt <text>", "Describe the desired image")
  .option("--model <name>", "Model: Midjourney_6_1 (default), Midjourney_7, or Midjourney_Niji_6")
  .option("--aspect-ratio <ratio>", "Output aspect ratio: 1:1, 4:3, 3:4, 16:9, 9:16 (default: 1:1)")
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      modelName: opts.model ?? "Midjourney_6_1",
      aspectRatio: opts.aspectRatio ?? "1:1",
    };

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("midjourney", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
