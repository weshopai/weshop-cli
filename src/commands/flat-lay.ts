import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

export const flatLayCmd = new Command("flat-lay")
  .summary("AI flat-lay clothing generator — create professional flat-lay product images from a photo")
  .description(
    "Generate a professional flat-lay clothing image from a garment or model photo.\n" +
    "Requires a prompt describing the desired output.\n\n" +
    "Model (--model):\n" +
    "  nano2   Default model (default)\n" +
    "  nano    Nano model\n\n" +
    "Image size (--image-size):\n" +
    "  1K   1K resolution (default)\n" +
    "  2K   2K resolution\n" +
    "  4K   4K resolution\n\n" +
    "Aspect ratio (--aspect-ratio):\n" +
    "  1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9  (default: 1:1)\n\n" +
    "Examples:\n" +
    "  weshop flat-lay --image ./jacket.png --prompt 'A flat-lay white background image of the jacket'\n" +
    "  weshop flat-lay --image ./outfit.png --prompt 'Flat-lay of the full outfit on marble surface' --model nano2 --image-size 2K\n" +
    "  weshop flat-lay --image ./shirt.png --prompt 'Flat-lay white background shirt' --aspect-ratio 3:4 --batch 2"
  )
  .requiredOption("--image <path|url>", "Input garment or model photo — local file path or URL")
  .requiredOption("--prompt <text>", "Describe the desired flat-lay output")
  .option("--model <name>", "Model to use: nano2 (default) or nano")
  .option("--image-size <size>", "Output resolution: 1K (default), 2K, or 4K")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (default: 1:1)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const { url: imageUrl } = await resolveImage(opts.image);

      const params: Record<string, unknown> = {
        textDescription: opts.prompt,
        images: [imageUrl],
        modelName: opts.model ?? "nano2",
        imageSize: opts.imageSize ?? "1K",
        aspectRatio: opts.aspectRatio ?? "1:1",
      };
      if (opts.batch != null) params.batchCount = opts.batch;

      const input: Record<string, unknown> = { originalImage: imageUrl };
      if (opts.taskName) input.taskName = opts.taskName;

      const body: RunRequest = {
        agent: { name: "flat-lay", version: "v1.0" },
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
