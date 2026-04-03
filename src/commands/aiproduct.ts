import { Command } from "commander";
import { executeRun } from "../run-helper.js";
import { resolveImage } from "../client.js";

export const aiproductCmd = new Command("aiproduct")
  .summary("Product still-life photos — replace or enhance the background around a product")
  .description(
    "Product still-life photos — replace or enhance the background around a product.\n\n" +
    "Mask types (--mask-type):\n" +
    "  autoSubjectSegment   Preserve the product; replace background\n" +
    "  custom               Caller-defined region via --custom-mask (PNG, same size as source, transparent=editable)\n\n" +
    "Generation mode (--generation-mode):\n" +
    "  freeCreation    AI generates freely, less constrained by the source style\n" +
    "  referToOrigin   AI stays close to the source image style\n\n" +
    "At least one of --prompt or --location-id must be provided.\n" +
    "Recommended: use --location-id for best results (run 'weshop info aiproduct' to list).\n" +
    "If using only --prompt without preset IDs, set --generation-mode freeCreation.\n\n" +
    "Examples:\n" +
    "  weshop aiproduct --image ./product.png --mask-type autoSubjectSegment --generation-mode freeCreation --prompt 'marble table, soft lighting'\n" +
    "  weshop aiproduct --image ./product.png --mask-type autoSubjectSegment --generation-mode referToOrigin --location-id 10 --batch 2\n" +
    "  weshop aiproduct --image ./product.png --mask-type custom --generation-mode freeCreation --custom-mask ./mask.png --prompt 'wooden desk'"
  )
  .requiredOption("--image <path|url>", "Source image — local file path or public URL (local files are auto-uploaded)")
  .requiredOption("--mask-type <type>", "Region to preserve: autoSubjectSegment or custom")
  .requiredOption("--generation-mode <mode>", "Generation mode: freeCreation (free AI) or referToOrigin (stay close to source)")
  .option("--prompt <text>", "Describe the desired background or scene")
  .option("--location-id <id>", "Replace background with a preset scene by ID (use 'weshop info aiproduct' to list)", parseInt)
  .option("--negative-prompt <text>", "Describe elements to avoid in the result")
  .option("--custom-mask <path|url>", "PNG mask image defining the protected region. Masked area is preserved, transparent area is editable. Must match source image dimensions")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 4)", parseInt)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      generatedContent: opts.generationMode,
      maskType: opts.maskType,
    };
    if (opts.prompt) params.textDescription = opts.prompt;
    if (opts.locationId) params.locationId = opts.locationId;
    if (opts.negativePrompt) params.negTextDescription = opts.negativePrompt;
    if (opts.customMask) params.customMaskUrl = (await resolveImage(opts.customMask)).url;
    if (opts.batch) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("aiproduct", "v1.0", opts, params, extraInput);
  });
