import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

export const seedreamCmd = new Command("seedream")
  .summary("AI image generation — create and edit images with Seedream 5.0")
  .description(
    "AI image generation — create and edit images using the Seedream 5.0 model by ByteDance.\n\n" +
    "Provide a text prompt to generate images from scratch, or attach up to 14 reference images\n" +
    "for guided editing. Images are optional — text-only generation is supported.\n\n" +
    "Image size (--image-size):\n" +
    "  2K    2K resolution (default)\n" +
    "  3K    3K resolution\n\n" +
    "Aspect ratio (--aspect-ratio):\n" +
    "  1:1, 2:3, 3:2, 4:3, 3:4, 16:9, 9:16, 21:9  (default: 3:4)\n\n" +
    "Output format (--output-format):\n" +
    "  jpeg   JPEG format (default)\n" +
    "  png    PNG format\n\n" +
    "Tools (--tool):\n" +
    "  web_search   Enable web search for prompt enrichment\n\n" +
    "Examples:\n" +
    "  weshop seedream --prompt 'A futuristic cityscape at sunset'\n" +
    "  weshop seedream --image ./sketch.png --prompt 'Turn this into a photorealistic scene' --image-size 3K\n" +
    "  weshop seedream --prompt 'Product photo of sneakers' --aspect-ratio 1:1 --output-format png --batch 4"
  )
  .option("--image <path|url...>", "Reference images — local file paths or URLs (up to 14, optional)")
  .requiredOption("--prompt <text>", "Describe the desired image or edit")
  .option("--image-size <size>", "Output resolution: 2K (default) or 3K")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (default: 3:4)")
  .option("--output-format <fmt>", "Output format: jpeg (default) or png")
  .option("--tool <name...>", "Enable tools, e.g. web_search")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const params: Record<string, unknown> = {
        textDescription: opts.prompt,
      };
      if (opts.batch != null) params.batchCount = opts.batch;
      if (opts.imageSize) params.imageSize = opts.imageSize;
      if (opts.aspectRatio) params.aspectRatio = opts.aspectRatio;
      if (opts.outputFormat) params.outputFormat = opts.outputFormat;
      if (opts.tool) params.tools = opts.tool;

      const input: Record<string, unknown> = {};
      if (opts.taskName) input.taskName = opts.taskName;

      if (opts.image && opts.image.length > 0) {
        const imageList: string[] = opts.image;
        if (imageList.length > 14) {
          console.error("[error]\n  message: Maximum 14 images allowed");
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
        agent: { name: "seedream", version: "v1.0" },
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
