import { Command } from "commander";
import { executeRun } from "../run-helper.js";
import { resolveImage } from "../client.js";

export const removebgCmd = new Command("removebg")
  .summary("Remove the background or replace it with a solid color")
  .description(
    "Remove the background or replace it with a solid color.\n\n" +
    "Mask types (--mask-type):\n" +
    "  autoSubjectSegment   Preserve the foreground subject; remove/replace background\n" +
    "  custom               Caller-defined region via --custom-mask (PNG, same size as source, transparent=editable)\n\n" +
    "Provide at least one of --bg-hex or --bg-id to set the new background.\n\n" +
    "Examples:\n" +
    "  weshop removebg --image ./photo.png --mask-type autoSubjectSegment --bg-hex '#ffffff'\n" +
    "  weshop removebg --image ./photo.png --mask-type autoSubjectSegment --bg-id 3 --batch 2\n" +
    "  weshop removebg --image ./photo.png --mask-type custom --custom-mask ./mask.png --bg-hex '#000000'"
  )
  .requiredOption("--image <path|url>", "Source image — local file path or public URL (local files are auto-uploaded)")
  .requiredOption("--mask-type <type>", "Region to preserve: autoSubjectSegment or custom")
  .option("--bg-hex <color>", "Replace background with this hex color, e.g. '#ffffff' for white, '#000000' for black")
  .option("--bg-id <id>", "Replace background with a preset color by ID (use 'weshop info removeBG' to list)", parseInt)
  .option("--custom-mask <path|url>", "PNG mask image defining the protected region. Masked area is preserved, transparent area is editable. Must match source image dimensions")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 4)", parseInt)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      maskType: opts.maskType,
    };
    if (opts.bgHex) params.backgroundHex = opts.bgHex;
    if (opts.bgId) params.backgroundId = opts.bgId;
    if (opts.customMask) params.customMaskUrl = (await resolveImage(opts.customMask)).url;
    if (opts.batch) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("removeBG", "v1.0", opts, params, extraInput);
  });
