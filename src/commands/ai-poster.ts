import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const aiPosterCmd = new Command("ai-poster")
  .summary("AI poster generator — create a designed poster from text prompt and optional reference images")
  .description(
    "Generate a professional poster from a text prompt. Supports up to 6 reference images.\n" +
    "Images are optional — text-only generation is supported.\n\n" +
    "Model (--model):\n" +
    "  jimeng   Jimeng model (default) — no image-size or aspect-ratio options\n" +
    "  nano     Nano model — supports --image-size and --aspect-ratio\n" +
    "  nano2    Nano2 model — supports --image-size and --aspect-ratio\n\n" +
    "Image size (--image-size, nano/nano2 only):\n" +
    "  1K (default), 2K, 4K\n\n" +
    "Aspect ratio (--aspect-ratio, nano/nano2 only):\n" +
    "  1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9  (default: 1:1)\n\n" +
    "Examples:\n" +
    "  weshop ai-poster --prompt 'Summer sale poster, bold red typography, white background'\n" +
    "  weshop ai-poster --image ./product.png --prompt 'Product launch poster for sneakers' --model nano2 --aspect-ratio 9:16\n" +
    "  weshop ai-poster --image ./logo.png --image ./product.png --prompt 'Brand poster' --image-size 2K"
  )
  .option("--image <path|url...>", "Reference images — local file paths or URLs (up to 6, optional)")
  .requiredOption("--prompt <text>", "Describe the desired poster")
  .option("--model <name>", "Model to use: jimeng (default), nano, or nano2")
  .option("--image-size <size>", "Output resolution: 1K (default), 2K, or 4K (nano/nano2 only)")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (nano/nano2 only, default: 1:1)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      modelName: opts.model ?? "jimeng",
    };
    if (opts.batch != null) params.batchCount = opts.batch;
    if (opts.imageSize) params.imageSize = opts.imageSize;
    if (opts.aspectRatio) params.aspectRatio = opts.aspectRatio;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    if (opts.image && opts.image.length > 0) {
      const imageList: string[] = opts.image;
      if (imageList.length > 6) { console.error("[error]\n  message: Maximum 6 images allowed"); process.exit(1); }
      await executeRun("ai-poster", "v1.0", { images: imageList, wait: opts.wait }, params, extraInput);
    } else {
      await executeRun("ai-poster", "v1.0", { wait: opts.wait }, params, extraInput);
    }
  });
