import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const gptImageCmd = new Command("gpt-image")
  .summary("GPT Image 2 generator — create high-quality images and product visuals from prompts")
  .description(
    "Generate or edit images with OpenAI GPT Image 2.\n\n" +
    "Supports text-only generation or up to 5 reference images.\n" +
    "When using multiple images, refer to them in the prompt as image 1, image 2, etc.\n\n" +
    "Aspect ratio (--aspect-ratio):\n" +
    "  auto, 1:1, 2:3, 3:2, 4:3, 3:4 (default), 16:9, 9:16, 21:9\n\n" +
    "Image size (--image-size): 1K (default), 2K, 4K\n\n" +
    "Quality (--quality): low (default), medium, high\n\n" +
    "Examples:\n" +
    "  weshop gpt-image --prompt 'Studio product photo of wireless earbuds on white seamless background'\n" +
    "  weshop gpt-image --image ./product.png --prompt 'Remove background and add soft shadow' --quality high\n" +
    "  weshop gpt-image --image ./a.png --image ./b.png --prompt 'Combine the product from image 1 with the lighting from image 2'"
  )
  .requiredOption("--prompt <text>", "Describe the image to generate or how to edit references")
  .option("--image <path|url...>", "Reference images — local file paths or URLs (up to 5, optional)")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (default: 3:4)")
  .option("--image-size <size>", "Output resolution: 1K (default), 2K, or 4K")
  .option("--quality <tier>", "Output quality: low (default), medium, or high")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const imageList: string[] | undefined = opts.image;
    if (imageList && imageList.length > 5) {
      console.error("[error]\n  message: Maximum 5 images allowed");
      process.exit(1);
    }

    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      aspectRatio: opts.aspectRatio ?? "3:4",
      imageSize: opts.imageSize ?? "1K",
      quality: opts.quality ?? "low",
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun(
      "gpt-image",
      "v1.0",
      { images: imageList, wait: opts.wait },
      params,
      extraInput
    );
  });
