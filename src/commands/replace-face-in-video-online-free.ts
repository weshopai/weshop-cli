import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const replaceFaceInVideoOnlineFreeCmd = new Command("replace-face-in-video-online-free")
  .summary("AI video face swap — replace a face in a video with a reference face photo")
  .description(
    "Replace a face in a video with a reference face from a photo.\n\n" +
    "Provide the video as a URL (--video). Local video files are not auto-uploaded;\n" +
    "use 'weshop upload' first to get a hosted URL if needed.\n\n" +
    "The --image option accepts a local file path or URL for the reference face photo.\n\n" +
    "Video requirements:\n" +
    "  - Format: .mp4 or .mov only\n" +
    "  - Resolution: min 340x340, max 3850x3850\n" +
    "  - Duration: 3–30 seconds\n\n" +
    "Face image requirements:\n" +
    "  - Min 300x300 pixels\n" +
    "  - Aspect ratio ≤ 2.5:1\n\n" +
    "Examples:\n" +
    "  weshop replace-face-in-video-online-free --video https://example.com/video.mp4 --image ./face.png\n" +
    "  weshop replace-face-in-video-online-free --video https://example.com/video.mp4 --image ./face.png --no-wait"
  )
  .requiredOption("--video <url>", "Input video URL")
  .requiredOption("--image <path|url>", "Reference face photo — local file path or URL")
  .option("--batch <count>", "Number of outputs to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {};
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    // image (face photo) goes through executeRun's single-image path; video goes via videos[]
    await executeRun(
      "replace-face-in-video-online-free", "v1.0",
      { image: opts.image, videos: [opts.video], wait: opts.wait },
      params,
      extraInput
    );
  });
