import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const sora2Cmd = new Command("sora-2")
  .summary("Sora 2 video generator — create cinematic videos with realistic physics using OpenAI Sora 2")
  .description(
    "Generate cinematic videos with realistic physics and storytelling using Sora 2.\n" +
    "Results come back in video[N].url.\n\n" +
    "Duration (--duration):\n" +
    "  4s (default), 8s, 12s\n\n" +
    "Aspect ratio (--aspect-ratio):\n" +
    "  16:9 (default), 9:16\n\n" +
    "Examples:\n" +
    "  weshop sora-2 --image ./scene.png --prompt 'A spaceship launching into orbit'\n" +
    "  weshop sora-2 --image ./photo.png --prompt 'Person walks through a rainy city' --duration 8s\n" +
    "  weshop sora-2 --image ./landscape.png --prompt 'Time-lapse of clouds moving' --aspect-ratio 16:9 --no-wait"
  )
  .requiredOption("--image <path|url>", "Input image — local file path or URL")
  .requiredOption("--prompt <text>", "Describe the desired video scene")
  .option("--duration <time>", "Video duration: 4s (default), 8s, or 12s")
  .option("--aspect-ratio <ratio>", "Output aspect ratio: 16:9 (default) or 9:16")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      duration: opts.duration ?? "4s",
      aspectRatio: opts.aspectRatio ?? "16:9",
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("sora-2", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
