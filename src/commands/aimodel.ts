import { Command } from "commander";
import { executeRun } from "../run-helper.js";
import { resolveImage } from "../client.js";

export const aimodelCmd = new Command("aimodel")
  .summary("Fashion model photos — replace the model, swap the scene or background while keeping the garment")
  .description(
    "Fashion model photos — replace the model, swap the scene or background while keeping the garment.\n\n" +
    "Mask types (--mask-type):\n" +
    "  autoApparelSegment           Preserve full-body clothing; replace model face, body, and background\n" +
    "  autoUpperApparelSegment      Preserve upper garment only; replace everything else\n" +
    "  autoLowerApparelSegment      Preserve lower garment only; replace everything else\n" +
    "  autoSubjectSegment           Preserve the foreground subject; replace background only\n" +
    "  autoHumanSegment             Preserve body + background; replace face/head only (face swap)\n" +
    "  inverseAutoHumanSegment      Preserve face only; replace outfit and background\n" +
    "  custom                       Caller-defined region via --custom-mask (PNG, same size as source, transparent=editable)\n\n" +
    "Generation mode (--generation-mode):\n" +
    "  freeCreation    AI generates freely, less constrained by the source style\n" +
    "  referToOrigin   AI stays close to the source image style\n\n" +
    "Pose mode (--pose):\n" +
    "  originalImagePose     Keep the same pose as the source image (default)\n" +
    "  referenceImagePose    Adopt the pose from the --location-id reference image\n" +
    "  freePose              Let AI decide the pose freely\n\n" +
    "At least one of --prompt, --location-id, or --model-id must be provided.\n" +
    "Recommended: use --location-id / --model-id for best results (run 'weshop info aimodel' to list).\n" +
    "If using only --prompt without preset IDs, set --generation-mode freeCreation.\n\n" +
    "Examples:\n" +
    "  weshop aimodel --image ./model.png --mask-type autoApparelSegment --generation-mode freeCreation --prompt 'street style photo'\n" +
    "  weshop aimodel --image ./model.png --mask-type autoSubjectSegment --generation-mode referToOrigin --location-id 42 --batch 2\n" +
    "  weshop aimodel --image ./model.png --mask-type custom --generation-mode freeCreation --custom-mask ./mask.png --prompt 'studio photo'"
  )
  .requiredOption("--image <path|url>", "Source image — local file path or public URL (local files are auto-uploaded)")
  .requiredOption("--mask-type <type>", "Region to preserve (see mask types above)")
  .requiredOption("--generation-mode <mode>", "Generation mode: freeCreation (free AI) or referToOrigin (stay close to source)")
  .option("--prompt <text>", "Describe the desired look, style, or scene of the result")
  .option("--location-id <id>", "Replace background with a preset scene by ID (use 'weshop info aimodel' to list)", parseInt)
  .option("--model-id <id>", "Replace model face with a preset fashion model by ID (use 'weshop info aimodel' to list)", parseInt)
  .option("--negative-prompt <text>", "Describe elements to avoid in the result, e.g. 'blurry, dark'")
  .option("--pose <mode>", "Pose control: originalImagePose (default), referenceImagePose, or freePose")
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
    if (opts.modelId) params.fashionModelId = opts.modelId;
    if (opts.negativePrompt) params.negTextDescription = opts.negativePrompt;
    if (opts.pose) params.pose = opts.pose;
    if (opts.customMask) params.customMaskUrl = (await resolveImage(opts.customMask)).url;
    if (opts.batch) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("aimodel", "v1.0", opts, params, extraInput);
  });
