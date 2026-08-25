import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const SEEDREAM_PRO = "Seedream_50_Pro";
const SEEDREAM_LITE = "Seedream_50_Lite";

export const seedreamCmd = new Command("seedream")
  .summary("AI image generation — create and edit images using Seedream 5.0 Pro or Lite by ByteDance")
  .description(
    "AI image generation — create and edit images using Seedream 5.0 Pro or Lite by ByteDance.\n\n" +
    "Provide a text prompt to generate images from scratch, or attach reference images\n" +
    "for guided editing. Images are optional — text-only generation is supported.\n" +
    "Agent version stays v1.0; --model is optional so older CLI clients that omit modelName still work.\n\n" +
    "Model (--model):\n" +
    "  Seedream_50_Pro   Seedream 5.0 Pro (default when omitted) — up to 10 images; 1K/2K; aspect auto; no tools\n" +
    "  Seedream_50_Lite  Seedream 5.0 Lite — up to 14 images; 2K/3K; web_search supported\n\n" +
    "Image size (--image-size):\n" +
    "  Seedream_50_Pro:  1K (default), 2K\n" +
    "  Seedream_50_Lite: 2K (default), 3K\n" +
    "  3K is Lite-only. Historical commands that pass --image-size 3K without --model stay on Lite.\n\n" +
    "Aspect ratio (--aspect-ratio):\n" +
    "  Seedream_50_Pro:  auto (default), 1:1, 2:3, 3:2, 4:3, 3:4, 16:9, 9:16, 21:9\n" +
    "  Seedream_50_Lite: 1:1, 2:3, 3:2, 4:3, 3:4 (default), 16:9, 9:16, 21:9\n\n" +
    "Output format (--output-format):\n" +
    "  jpeg   JPEG format (default)\n" +
    "  png    PNG format\n\n" +
    "Tools (--tool):\n" +
    "  web_search   Enable web search for prompt enrichment (Lite only)\n\n" +
    "Examples:\n" +
    "  weshop seedream --prompt 'A futuristic cityscape at sunset'\n" +
    "  weshop seedream --prompt 'Product photo of sneakers' --model Seedream_50_Pro --image-size 2K --aspect-ratio auto\n" +
    "  weshop seedream --image ./sketch.png --prompt 'Turn this into a photorealistic scene' --model Seedream_50_Lite --image-size 3K\n" +
    "  weshop seedream --prompt 'Product photo of sneakers' --aspect-ratio 1:1 --output-format png --batch 4"
  )
  .option("--image <path|url...>", "Reference images — local file paths or URLs (Pro: up to 10; Lite: up to 14; optional)")
  .requiredOption("--prompt <text>", "Describe the desired image or edit")
  .option("--model <name>", "Seedream model: Seedream_50_Pro (default) or Seedream_50_Lite")
  .option("--image-size <size>", "Output resolution: Pro 1K/2K; Lite 2K/3K")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (Pro default: auto; Lite default: 3:4)")
  .option("--output-format <fmt>", "Output format: jpeg (default) or png")
  .option("--tool <name...>", "Enable tools, e.g. web_search (Lite only)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const imageList: string[] | undefined = opts.image;
    const imageCount = imageList?.length ?? 0;
    const requestedModel: string | undefined = opts.model;
    // Historical CLI omitted modelName. Keep that payload when the caller does
    // not pass --model, except for Lite-only flags (3K, tools, >10 images).
    const inferredLite =
      !requestedModel &&
      (opts.imageSize === "3K" || Boolean(opts.tool) || imageCount > 10);
    const modelName = requestedModel ?? (inferredLite ? SEEDREAM_LITE : undefined);
    const effectiveModel = modelName ?? SEEDREAM_PRO;
    const maxImages = effectiveModel === SEEDREAM_PRO ? 10 : 14;

    if (imageCount > maxImages) {
      console.error(
        `[error]\n  message: Maximum ${maxImages} images allowed for ${effectiveModel}`
      );
      process.exit(1);
    }
    if (effectiveModel === SEEDREAM_PRO && opts.imageSize === "3K") {
      console.error("[error]\n  message: Seedream_50_Pro does not support --image-size 3K; use Seedream_50_Lite or 1K/2K");
      process.exit(1);
    }
    if (effectiveModel === SEEDREAM_LITE && opts.imageSize === "1K") {
      console.error("[error]\n  message: Seedream_50_Lite does not support --image-size 1K; use Seedream_50_Pro or 2K/3K");
      process.exit(1);
    }
    if (effectiveModel === SEEDREAM_PRO && opts.tool) {
      console.error("[error]\n  message: --tool is not supported for Seedream_50_Pro; use Seedream_50_Lite");
      process.exit(1);
    }

    const params: Record<string, unknown> = { textDescription: opts.prompt };
    if (modelName) params.modelName = modelName;
    if (opts.batch != null) params.batchCount = opts.batch;
    if (opts.imageSize) params.imageSize = opts.imageSize;
    if (opts.aspectRatio) params.aspectRatio = opts.aspectRatio;
    if (opts.outputFormat) params.outputFormat = opts.outputFormat;
    if (opts.tool) params.tools = opts.tool;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("seedream", "v1.0", { images: imageList, wait: opts.wait }, params, extraInput);
  });
