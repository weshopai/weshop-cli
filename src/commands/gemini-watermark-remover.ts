import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const geminiWatermarkRemoverCmd = new Command("gemini-watermark-remover")
  .summary("Gemini watermark remover — remove watermarks, logos, or text from a video")
  .description(
    "Remove watermarks, logos, subtitles, or text overlays from a video.\n\n" +
    "Provide the video as a URL (--video). Local video files are not auto-uploaded;\n" +
    "use 'weshop upload' first to get a hosted URL if needed.\n\n" +
    "Examples:\n" +
    "  weshop gemini-watermark-remover --video https://example.com/video.mp4\n" +
    "  weshop gemini-watermark-remover --video https://example.com/video.mp4 --no-wait"
  )
  .requiredOption("--video <url>", "Input video URL")
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { watermarkSelectType: "autoDetect" };
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("gemini-watermark-remover", "v1.0", { videos: [opts.video], wait: opts.wait }, params, extraInput);
  });
