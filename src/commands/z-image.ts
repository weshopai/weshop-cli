import { Command } from "commander";
import { submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

export const zImageCmd = new Command("z-image")
  .summary("AI image generation — create high-quality images from text with Z-Image by Alibaba")
  .description(
    "AI image generation — create high-quality images from text using Z-Image by Alibaba.\n\n" +
    "Text-only generation — no image input supported.\n\n" +
    "Aspect ratio (--aspect-ratio):\n" +
    "  1:1, 2:3, 3:2, 4:3, 3:4, 16:9, 9:16, 21:9  (default: 1:1)\n\n" +
    "Examples:\n" +
    "  weshop z-image --prompt 'A futuristic cityscape at sunset'\n" +
    "  weshop z-image --prompt 'Product photo of sneakers on white background' --aspect-ratio 3:4\n" +
    "  weshop z-image --prompt 'Asian model in streetwear' --aspect-ratio 9:16 --no-wait"
  )
  .requiredOption("--prompt <text>", "Describe the desired image")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (default: 1:1): 1:1, 2:3, 3:2, 4:3, 3:4, 16:9, 9:16, 21:9")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const params: Record<string, unknown> = {
        textDescription: opts.prompt,
        aspectRatio: opts.aspectRatio ?? "1:1",
      };
      if (opts.batch != null) params.batchCount = opts.batch;

      const input: Record<string, unknown> = {};
      if (opts.taskName) input.taskName = opts.taskName;

      const body: RunRequest = {
        agent: { name: "z-image", version: "v1.0" },
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
