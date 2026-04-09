import { Command } from "commander";
import { submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

export const logoRemoverFromVideoCmd = new Command("logo-remover-from-video")
  .summary("Logo remover from video — remove logos or watermarks from a video")
  .description(
    "Remove logos, watermarks, or brand overlays from a video using AI.\n\n" +
    "Provide the video as a URL (--video). Local video files are not auto-uploaded;\n" +
    "use 'weshop upload' first to get a hosted URL if needed.\n\n" +
    "Examples:\n" +
    "  weshop logo-remover-from-video --video https://example.com/video.mp4\n" +
    "  weshop logo-remover-from-video --video https://example.com/video.mp4 --no-wait"
  )
  .requiredOption("--video <url>", "Input video URL")
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const params: Record<string, unknown> = { videos: [opts.video], watermarkSelectType: "autoDetect" };
      const input: Record<string, unknown> = { videos: [opts.video] };
      if (opts.taskName) input.taskName = opts.taskName;
      const body: RunRequest = { agent: { name: "logo-remover-from-video", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
