import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "Please generate a realistic portrait photograph of an Asian woman with long black hair, wearing a pure white sleeveless outfit, set against a plain white background.";

export const faceForgeCmd = new Command("face-forge")
  .summary("AI face morph & face swap — generate or transform portraits")
  .description(
    "AI face morph & face swap — generate or transform portraits using Face Forge.\n\n" +
    "Provide a text prompt describing the desired portrait. Optionally attach up to 3 reference\n" +
    "images for face swapping or morphing. When no image is provided, the model generates from\n" +
    "the prompt alone.\n\n" +
    "Default prompt (when --prompt is not customized):\n" +
    '  "Please generate a realistic portrait photograph of an Asian woman with long black hair,\n' +
    '   wearing a pure white sleeveless outfit, set against a plain white background."\n\n' +
    "Model (--model):\n" +
    "  jimeng    Jimeng model (default) — no image-size or aspect-ratio options\n" +
    "  nano      Nano model — supports --image-size and --aspect-ratio\n\n" +
    "Image size (--image-size, nano model only):\n" +
    "  1K    1K resolution (default)\n" +
    "  2K    2K resolution\n" +
    "  4K    4K resolution\n\n" +
    "Aspect ratio (--aspect-ratio, nano model only):\n" +
    "  1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9  (default: 1:1)\n\n" +
    "Examples:\n" +
    "  weshop face-forge --prompt 'A professional headshot of a young man in a suit'\n" +
    "  weshop face-forge --image ./face.png --prompt 'Transform into an oil painting portrait'\n" +
    "  weshop face-forge --image ./a.png --image ./b.png --prompt 'Merge image 1 and image 2 faces together' --model nano --image-size 2K --aspect-ratio 3:4"
  )
  .option("--image <path|url...>", "Reference images — local file paths or URLs (up to 3, optional)")
  .option("--prompt <text>", "Describe the desired portrait or transformation (default: generate a realistic portrait)")
  .option("--model <name>", "Model to use: jimeng (default) or nano")
  .option("--image-size <size>", "Output resolution: 1K (default), 2K, or 4K (nano model only)")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (nano model only, default: 1:1)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const imageList: string[] | undefined = opts.image;
    if (imageList && imageList.length > 3) {
      console.error("[error]\n  message: Maximum 3 images allowed");
      process.exit(1);
    }

    const params: Record<string, unknown> = {
      textDescription: opts.prompt ?? DEFAULT_PROMPT,
    };
    if (opts.batch != null) params.batchCount = opts.batch;
    if (opts.model) params.modelName = opts.model;
    if (opts.imageSize) params.imageSize = opts.imageSize;
    if (opts.aspectRatio) params.aspectRatio = opts.aspectRatio;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("face-forge", "v1.0", { images: imageList, wait: opts.wait }, params, extraInput);
  });
