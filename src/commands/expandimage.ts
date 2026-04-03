import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const expandimageCmd = new Command("expandimage")
  .summary("Expand the canvas to a larger size — AI fills the new area to blend naturally")
  .description(
    "Expand the canvas to a larger size — AI fills the new area to blend naturally.\n\n" +
    "The original image is placed within the larger canvas (not stretched).\n" +
    "The added area is filled by AI to blend naturally with the original.\n" +
    "By default the original is centered; use --fill-left / --fill-top to offset.\n\n" +
    "Examples:\n" +
    "  weshop expandimage --image ./photo.png --width 2048 --height 2048\n" +
    "  weshop expandimage --image ./photo.png --width 2048 --height 2048 --fill-left 0 --fill-top 0 --batch 2"
  )
  .requiredOption("--image <path|url>", "Source image — local file path or public URL (local files are auto-uploaded)")
  .requiredOption("--width <px>", "Target canvas width in pixels (max 4096)", parseInt)
  .requiredOption("--height <px>", "Target canvas height in pixels (max 4096)", parseInt)
  .option("--fill-left <px>", "Horizontal offset: distance from left edge of canvas to left edge of original (default: centered)", parseInt)
  .option("--fill-top <px>", "Vertical offset: distance from top edge of canvas to top edge of original (default: centered)", parseInt)
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 4)", parseInt)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      targetWidth: opts.width,
      targetHeight: opts.height,
    };
    if (opts.fillLeft != null) params.fillLeft = opts.fillLeft;
    if (opts.fillTop != null) params.fillTop = opts.fillTop;
    if (opts.batch) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("expandimage", "v1.0", opts, params, extraInput);
  });
