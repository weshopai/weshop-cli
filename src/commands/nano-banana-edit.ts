import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const NANO_MODELS = new Set(["nano1", "nano", "nano2"]);

export const nanoBananaEditCmd = new Command("nano-banana-edit")
  .summary("Nano Banana image editor — generate or edit images with Gemini-based Nano models")
  .description(
    "Generate or edit images using WeShop Nano Banana models (Gemini image backends).\n\n" +
    "You can run text-only, use up to nine reference images, or combine images with a prompt.\n" +
    "When using multiple images, refer to them in the prompt as image 1, image 2, etc.\n\n" +
    "Model (--model):\n" +
    "  nano1   Nano Banana\n" +
    "  nano    Nano Banana Pro\n" +
    "  nano2   Nano Banana 2 (default)\n\n" +
    "Image size (--image-size):\n" +
    "  1K   1K resolution (default)\n" +
    "  2K   2K resolution\n" +
    "  4K   4K resolution\n" +
    "(Primarily used with nano and nano2.)\n\n" +
    "Aspect ratio (--aspect-ratio):\n" +
    "  auto (default), 1:1, 2:3, 3:2, 4:3, 3:4, 4:5, 5:4, 16:9, 9:16, 21:9\n" +
    "With model nano2 you may also use: 1:4, 4:1, 1:8, 8:1\n\n" +
    "Examples:\n" +
    "  weshop nano-banana-edit --prompt 'A photorealistic macro shot of dew on a leaf'\n" +
    "  weshop nano-banana-edit --image ./product.png --prompt 'White seamless studio background'\n" +
    "  weshop nano-banana-edit --image ./a.png --image ./b.png --prompt 'Apply the lighting from image 2 to the subject in image 1' --model nano --image-size 2K --aspect-ratio 3:4"
  )
  .option("--image <path|url...>", "Reference images — local file paths or URLs (up to 9, optional)")
  .option("--prompt <text>", "Describe the desired edit or generation (optional)")
  .option("--model <name>", "nano1 | nano | nano2 (default: nano2)")
  .option("--aspect-ratio <ratio>", "Aspect ratio (default: auto)")
  .option("--image-size <size>", "Output resolution: 1K (default), 2K, or 4K")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const imageList: string[] | undefined = opts.image;
    if (imageList && imageList.length > 9) {
      console.error("[error]\n  message: Maximum 9 images allowed");
      process.exit(1);
    }

    const modelName = (opts.model ?? "nano2") as string;
    if (!NANO_MODELS.has(modelName)) {
      console.error("[error]\n  message: --model must be one of: nano1, nano, nano2");
      process.exit(1);
    }

    const params: Record<string, unknown> = {
      modelName,
      aspectRatio: opts.aspectRatio ?? "auto",
      imageSize: opts.imageSize ?? "1K",
      textDescription: opts.prompt ?? "",
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("nano-banana-edit", "v1.0", { images: imageList, wait: opts.wait }, params, extraInput);
  });
