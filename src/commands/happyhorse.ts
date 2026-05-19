import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const happyhorseCmd = new Command("happyhorse")
  .summary("HappyHorse AI video generator — create cinematic image-to-video clips with HappyHorse 1.0")
  .description(
    "Generate cinematic AI videos with HappyHorse 1.0 from an image and prompt.\n" +
    "Results come back in video[N].url.\n\n" +
    "Duration (--duration): 3s (default), 4s, 5s, 6s, 7s, 8s, 9s, 10s, 11s, 12s, 13s, 14s, 15s\n\n" +
    "Aspect ratio (--aspect-ratio): 9:16 (default), 16:9, 3:4, 4:3, 1:1\n\n" +
    "Examples:\n" +
    "  weshop happyhorse --image ./scene.png --prompt 'Slow cinematic push-in over a mountain lake at dawn'\n" +
    "  weshop happyhorse --image ./product.png --prompt 'Product rotates on a pedestal' --duration 8s --aspect-ratio 16:9"
  )
  .requiredOption("--image <path|url>", "Input image — local file path or URL")
  .requiredOption("--prompt <text>", "Describe the desired video scene")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (default: 9:16)")
  .option("--duration <time>", "Video duration, e.g. 3s, 8s, 15s (default: 3s)")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      modelName: "HappyHorse_10",
      aspectRatio: opts.aspectRatio ?? "9:16",
      duration: opts.duration ?? "3s",
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("happyhorse", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
