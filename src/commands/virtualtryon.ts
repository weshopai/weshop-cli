import { Command } from "commander";
import { executeRun } from "../run-helper.js";
import { resolveImage } from "../client.js";

export const virtualtryonCmd = new Command("virtualtryon")
  .summary("Virtual try-on — put a garment onto a generated model with optional model/background references")
  .description(
    "Virtual try-on — put a garment onto a generated model with optional model/background references.\n\n" +
    "The --image is the garment to preserve in the result.\n\n" +
    "Generation version (--gen-version):\n" +
    "  weshopFlash   Fast generation\n" +
    "  weshopPro     High quality (supports --aspect-ratio)\n" +
    "  bananaPro     Banana engine (requires --image-size, supports --aspect-ratio)\n\n" +
    "Prompt mode (--prompt-mode):\n" +
    "  auto     System generates the prompt automatically\n" +
    "  custom   You provide the prompt via --prompt (required)\n\n" +
    "In --prompt text, use these references:\n" +
    "  Figure 1 = the garment image (--image)\n" +
    "  Figure 2 = the model reference (--model-image)\n" +
    "  Figure 3 = the background reference (--location-image)\n\n" +
    "Examples:\n" +
    "  weshop virtualtryon --image ./dress.png --gen-version weshopPro --prompt-mode auto --aspect-ratio 2:3\n" +
    "  weshop virtualtryon --image ./shirt.png --gen-version weshopFlash --prompt-mode custom --prompt 'Figure 1 on Figure 2 in outdoor setting'\n" +
    "  weshop virtualtryon --image ./jacket.png --gen-version bananaPro --prompt-mode auto --image-size 2K --model-image ./model.png"
  )
  .requiredOption("--image <path|url>", "Garment image — local file path or public URL (local files are auto-uploaded)")
  .requiredOption("--gen-version <ver>", "Generation engine: weshopFlash, weshopPro, or bananaPro")
  .requiredOption("--prompt-mode <type>", "Prompt mode: auto (system generates) or custom (you provide --prompt)")
  .option("--prompt <text>", "Text description of desired result (required when --prompt-mode=custom). Use Figure 1/2/3 to reference images")
  .option("--model-image <path|url>", "Model reference image — the generated model will resemble this person")
  .option("--location-image <path|url>", "Background reference image — the generated scene will use this background")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (weshopPro/bananaPro only): 1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9")
  .option("--image-size <size>", "Output resolution (bananaPro only): 1K, 2K, or 4K")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      generateVersion: opts.genVersion,
      descriptionType: opts.promptMode,
    };
    if (opts.prompt) params.textDescription = opts.prompt;
    if (opts.aspectRatio) params.aspectRatio = opts.aspectRatio;
    if (opts.imageSize) params.imageSize = opts.imageSize;
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.modelImage) extraInput.fashionModelImage = (await resolveImage(opts.modelImage)).url;
    if (opts.locationImage) extraInput.locationImage = (await resolveImage(opts.locationImage)).url;
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("virtualtryon", "v1.0", opts, params, extraInput);
  });
