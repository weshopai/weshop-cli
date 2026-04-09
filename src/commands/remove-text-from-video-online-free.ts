import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const removeTextFromVideoOnlineFreeCmd = new Command("remove-text-from-video-online-free")
  .summary("Remove text from video online free — remove text overlays or watermarks from a video")
  .description(
    "Remove text overlays, watermarks, or logos from a video using AI.\n\n" +
    "Provide the video as a URL (--video). Local video files are not auto-uploaded;\n" +
    "use 'weshop upload' first to get a hosted URL if needed.\n\n" +
    "Examples:\n" +
    "  weshop remove-text-from-video-online-free --video https://example.com/video.mp4\n" +
    "  weshop remove-text-from-video-online-free --video https://example.com/video.mp4 --no-wait"
  )
  .requiredOption("--video <url>", "Input video URL")
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { watermarkSelectType: "autoDetect" };
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("remove-text-from-video-online-free", "v1.0", { videos: [opts.video], wait: opts.wait }, params, extraInput);
  });
