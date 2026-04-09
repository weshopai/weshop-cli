import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

export const qwenImageEditCmd = new Command("qwen-image-edit")
  .summary("AI image editing — edit or generate images with natural language instructions")
  .description(
    "AI image editing — edit or generate images with natural language instructions using Qwen Image Edit.\n\n" +
    "Provide a text prompt describing the desired edit or generation. Optionally attach up to 5\n" +
    "reference images. When no image is provided the model generates from the prompt alone.\n\n" +
    "Examples:\n" +
    "  weshop qwen-image-edit --prompt 'A cat sitting on a rainbow'\n" +
    "  weshop qwen-image-edit --image ./photo.png --prompt 'Make the sky more dramatic'\n" +
    "  weshop qwen-image-edit --image ./a.png --image ./b.png --prompt 'Combine these two scenes using image 1 as the base and image 2 as the style reference' --batch 2"
  )
  .option("--image <path|url...>", "Reference images — local file paths or URLs (up to 5, optional)")
  .requiredOption("--prompt <text>", "Describe the desired edit or generation")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const params: Record<string, unknown> = {
        textDescription: opts.prompt,
      };
      if (opts.batch != null) params.batchCount = opts.batch;

      const input: Record<string, unknown> = {};
      if (opts.taskName) input.taskName = opts.taskName;

      // Resolve and upload images if provided
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
        agent: { name: "qwen-image-edit", version: "v1.0" },
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
