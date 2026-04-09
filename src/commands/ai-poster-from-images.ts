import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "Make a poster based on the uploaded picture and user instructions. Based on the uploaded image, determine the main color of the brand. If not available, you can use the main color of the product. The poster design should conform to the aesthetic standards of modern design styles, try to be simple and elegant. Font should have difference in sizes and a fitting style for good aesthetics.";

export const aiPosterFromImagesCmd = new Command("ai-poster-from-images")
  .summary("AI poster generator — create a designed poster from up to 5 reference images")
  .description(
    "Generate a professional poster from reference images and a text prompt.\n" +
    "Supports up to 5 input images. Images are optional — text-only generation is supported.\n\n" +
    "Aspect ratio (--aspect-ratio):\n" +
    "  1:1, 2:3, 3:2, 4:3, 3:4, 16:9, 9:16, 21:9  (default: 1:1)\n\n" +
    "Image size (--image-size):\n" +
    "  1K (default), 2K, 4K\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    "  Creates a modern, elegant poster using the brand color from the uploaded image.\n\n" +
    "Examples:\n" +
    "  weshop ai-poster-from-images --image ./product.png --prompt 'Summer sale poster, bold typography'\n" +
    "  weshop ai-poster-from-images --image ./logo.png --image ./product.png --prompt 'Brand launch poster' --aspect-ratio 9:16\n" +
    "  weshop ai-poster-from-images --prompt 'Minimalist tech conference poster' --image-size 2K"
  )
  .option("--image <path|url...>", "Reference images — local file paths or URLs (up to 5, optional)")
  .option("--prompt <text>", "Describe the desired poster (default: modern elegant poster from image)")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (default: 1:1)")
  .option("--image-size <size>", "Output resolution: 1K (default), 2K, or 4K")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const params: Record<string, unknown> = {
        textDescription: opts.prompt ?? DEFAULT_PROMPT,
        aspectRatio: opts.aspectRatio ?? "1:1",
        imageSize: opts.imageSize ?? "1K",
      };
      if (opts.batch != null) params.batchCount = opts.batch;

      const input: Record<string, unknown> = {};
      if (opts.taskName) input.taskName = opts.taskName;

      if (opts.image && opts.image.length > 0) {
        const imageList: string[] = opts.image;
        if (imageList.length > 5) {
          console.error("[error]\n  message: Maximum 5 images allowed");
          process.exit(1);
        }
        const urls: string[] = [];
        for (const img of imageList) {
          const { url } = await resolveImage(img);
          urls.push(url);
        }
        params.images = urls;
        input.originalImage = urls[0];
      }

      const body: RunRequest = {
        agent: { name: "ai-poster-from-images", version: "v1.0" },
        input,
        params,
      };

      const { executionId } = await submitRun(body);
      printSubmitted(executionId);

      if (opts.wait !== false) {
        const data = await waitForCompletion(executionId);
        printPollResult(data);
      } else {
        console.log("[info]");
        console.log(`  message: Use 'weshop status ${executionId}' to check progress`);
      }
    } catch (err) {
      printError(err);
      process.exit(1);
    }
  });
