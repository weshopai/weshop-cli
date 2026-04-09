import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

export const seedanceCmd = new Command("seedance")
  .summary("Seedance video generator — create cinematic AI videos using Seedance 2.0 by ByteDance")
  .description(
    "Generate cinematic AI videos using Seedance models by ByteDance.\n" +
    "Results come back in video[N].url.\n\n" +
    "Model (--model):\n" +
    "  Seedance_20          Seedance 2.0 (default)\n" +
    "  Seedance_15_Pro      Seedance 1.5 Pro\n" +
    "  Seedance_10_Pro      Seedance 1.0 Pro\n" +
    "  Seedance_10_Pro_Fast Seedance 1.0 Pro Fast\n\n" +
    "Duration (--duration):\n" +
    "  Seedance_20/1.5_Pro: 4s-15s  (default: 4s)\n" +
    "  Seedance_10_Pro/Fast: 2s-12s  (default: 4s)\n\n" +
    "Aspect ratio (--aspect-ratio):\n" +
    "  Seedance_20/1.5_Pro: 21:9, 16:9, 9:16, 3:4, 4:3, 1:1  (default: 3:4)\n" +
    "  Seedance_10_Pro/Fast: 16:9, 9:16, 3:4, 4:3, 1:1  (default: 3:4)\n\n" +
    "Generate audio (--generate-audio): true or false (Seedance_20 and 1.5_Pro only, default: true)\n\n" +
    "Examples:\n" +
    "  weshop seedance --image ./scene.png --prompt 'Cinematic drone shot over a city'\n" +
    "  weshop seedance --image ./photo.png --prompt 'Person walks in slow motion' --model Seedance_15_Pro --duration 8s\n" +
    "  weshop seedance --image ./landscape.png --prompt 'Sunset timelapse' --aspect-ratio 16:9 --no-wait"
  )
  .requiredOption("--image <path|url>", "Input image — local file path or URL")
  .requiredOption("--prompt <text>", "Describe the desired video scene")
  .option("--model <name>", "Seedance model version (default: Seedance_20)")
  .option("--duration <time>", "Video duration, e.g. 4s, 8s (default: 4s)")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (default: 3:4)")
  .option("--generate-audio <bool>", "Generate audio: true (default) or false (Seedance_20 and 1.5_Pro only)")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const { url: imageUrl } = await resolveImage(opts.image);
      const params: Record<string, unknown> = {
        textDescription: opts.prompt,
        images: [imageUrl],
        modelName: opts.model ?? "Seedance_20",
        duration: opts.duration ?? "4s",
        aspectRatio: opts.aspectRatio ?? "3:4",
        generateAudio: opts.generateAudio ?? "true",
      };
      if (opts.batch != null) params.batchCount = opts.batch;
      const input: Record<string, unknown> = { originalImage: imageUrl };
      if (opts.taskName) input.taskName = opts.taskName;
      const body: RunRequest = { agent: { name: "seedance", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
