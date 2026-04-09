import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

export const wanAiCmd = new Command("wan-ai")
  .summary("Wan AI video generator — create AI videos from images and text using Wan AI")
  .description(
    "Generate AI videos from images and text using Wan AI.\n" +
    "Results come back in video[N].url.\n\n" +
    "Duration (--duration):\n" +
    "  3s, 4s, 5s (default), 6s, 7s, 8s\n\n" +
    "Examples:\n" +
    "  weshop wan-ai --image ./scene.png --prompt 'Ocean waves crashing on rocks'\n" +
    "  weshop wan-ai --image ./photo.png --prompt 'Person dancing in slow motion' --duration 8s\n" +
    "  weshop wan-ai --image ./landscape.png --prompt 'Sunrise over mountains' --no-wait"
  )
  .requiredOption("--image <path|url>", "Input image — local file path or URL")
  .requiredOption("--prompt <text>", "Describe the desired video scene")
  .option("--duration <time>", "Video duration: 3s, 4s, 5s (default), 6s, 7s, or 8s")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const { url: imageUrl } = await resolveImage(opts.image);
      const params: Record<string, unknown> = {
        textDescription: opts.prompt,
        images: [imageUrl],
        duration: opts.duration ?? "5s",
      };
      if (opts.batch != null) params.batchCount = opts.batch;
      const input: Record<string, unknown> = { originalImage: imageUrl };
      if (opts.taskName) input.taskName = opts.taskName;
      const body: RunRequest = { agent: { name: "wan-ai", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
