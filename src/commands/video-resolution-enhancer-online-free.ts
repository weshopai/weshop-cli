import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const videoResolutionEnhancerOnlineFreeCmd = new Command("video-resolution-enhancer-online-free")
  .summary("Video resolution enhancer online free — upscale and enhance video resolution using AI")
  .description(
    "Upscale and enhance video resolution using AI.\n\n" +
    "Provide the video as a URL (--video). Local video files are not auto-uploaded;\n" +
    "use 'weshop upload' first to get a hosted URL if needed.\n\n" +
    "Video size (--video-size): target output resolution, e.g. 2K, 4K\n\n" +
    "Examples:\n" +
    "  weshop video-resolution-enhancer-online-free --video https://example.com/video.mp4\n" +
    "  weshop video-resolution-enhancer-online-free --video https://example.com/video.mp4 --video-size 4K\n" +
    "  weshop video-resolution-enhancer-online-free --video https://example.com/video.mp4 --no-wait"
  )
  .requiredOption("--video <url>", "Input video URL")
  .option("--video-size <size>", "Target output resolution, e.g. 2K or 4K")
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {};
    if (opts.videoSize) params.videoSize = opts.videoSize;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("video-resolution-enhancer-online-free", "v1.0", { videos: [opts.video], wait: opts.wait }, params, extraInput);
  });
