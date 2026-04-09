import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

export const grokImagineVideoCmd = new Command("grok-imagine-video")
  .summary("Grok Imagine video generator — create cinematic AI videos with native audio using xAI")
  .description(
    "Generate cinematic AI videos with native audio using xAI's Grok Imagine Video.\n" +
    "Results come back in video[N].url.\n\n" +
    "Duration (--duration):\n" +
    "  6s (default), 10s\n\n" +
    "Aspect ratio (--aspect-ratio):\n" +
    "  16:9 (default), 9:16, 1:1\n\n" +
    "Examples:\n" +
    "  weshop grok-imagine-video --image ./scene.png --prompt 'A rocket launching into space'\n" +
    "  weshop grok-imagine-video --image ./photo.png --prompt 'Person walks through a neon-lit city' --duration 10s\n" +
    "  weshop grok-imagine-video --image ./landscape.png --prompt 'Timelapse of a storm' --aspect-ratio 9:16 --no-wait"
  )
  .requiredOption("--image <path|url>", "Input image — local file path or URL")
  .requiredOption("--prompt <text>", "Describe the desired video scene")
  .option("--duration <time>", "Video duration: 6s (default) or 10s")
  .option("--aspect-ratio <ratio>", "Output aspect ratio: 16:9 (default), 9:16, or 1:1")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const { url: imageUrl } = await resolveImage(opts.image);
      const params: Record<string, unknown> = {
        textDescription: opts.prompt,
        images: [imageUrl],
        duration: opts.duration ?? "6s",
        aspectRatio: opts.aspectRatio ?? "16:9",
      };
      if (opts.batch != null) params.batchCount = opts.batch;
      const input: Record<string, unknown> = { originalImage: imageUrl };
      if (opts.taskName) input.taskName = opts.taskName;
      const body: RunRequest = { agent: { name: "grok-imagine-video", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
