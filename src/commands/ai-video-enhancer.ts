import { Command } from "commander";
import { submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

export const aiVideoEnhancerCmd = new Command("ai-video-enhancer")
  .summary("AI video enhancer — upscale and enhance video quality using AI")
  .description(
    "Upscale and enhance video quality using AI.\n\n" +
    "Provide the video as a URL (--video). Local video files are not auto-uploaded;\n" +
    "use 'weshop upload' first to get a hosted URL if needed.\n\n" +
    "Video requirements:\n" +
    "  - Max resolution: 2048x2048\n" +
    "  - Duration: 1–120 seconds\n\n" +
    "Video size (--video-size): target output resolution, e.g. 2K, 4K\n\n" +
    "Examples:\n" +
    "  weshop ai-video-enhancer --video https://example.com/video.mp4\n" +
    "  weshop ai-video-enhancer --video https://example.com/video.mp4 --video-size 4K\n" +
    "  weshop ai-video-enhancer --video https://example.com/video.mp4 --no-wait"
  )
  .requiredOption("--video <url>", "Input video URL")
  .option("--video-size <size>", "Target output resolution, e.g. 2K or 4K")
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const params: Record<string, unknown> = {
        videos: [opts.video],
      };
      if (opts.videoSize) params.videoSize = opts.videoSize;
      const input: Record<string, unknown> = {
        videos: [opts.video],
      };
      if (opts.taskName) input.taskName = opts.taskName;
      const body: RunRequest = { agent: { name: "ai-video-enhancer", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
