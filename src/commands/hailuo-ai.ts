import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const hailuoAiCmd = new Command("hailuo-ai")
  .summary("Hailuo AI video generator — create cinematic AI videos from images and text using MiniMax Hailuo")
  .description(
    "Generate cinematic AI videos from an image and prompt using MiniMax Hailuo.\n" +
    "Results come back in video[N].url.\n\n" +
    "Model (--model):\n" +
    "  Hailuo_02         Hailuo 02 (default)\n" +
    "  Hailuo_2_3_Fast   Hailuo 2.3 Fast\n" +
    "  Hailuo_2_3        Hailuo 2.3\n\n" +
    "Duration (--duration): 6s (default), 10s\n\n" +
    "Examples:\n" +
    "  weshop hailuo-ai --image ./scene.png --prompt 'Ocean waves at sunset'\n" +
    "  weshop hailuo-ai --image ./portrait.png --prompt 'Subject turns toward camera' --model Hailuo_2_3 --duration 10s"
  )
  .requiredOption("--image <path|url>", "Input image — local file path or URL")
  .requiredOption("--prompt <text>", "Describe the desired video scene or motion")
  .option("--model <name>", "Hailuo model version (default: Hailuo_02)")
  .option("--duration <time>", "Video duration: 6s (default) or 10s")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      modelName: opts.model ?? "Hailuo_02",
      duration: opts.duration ?? "6s",
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("hailuo-ai", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
