import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "Translate all text in this image to English. Keep the same design and aesthetics to maintain the style of the image. Don't simply put the text on the new image, try to generate text as original.";

export const aiTranslateCmd = new Command("ai-translate")
  .summary("AI image text translator — translate text in an image to another language while preserving design")
  .description(
    "Translate all text in an image to English (or a specified language) while preserving\n" +
    "the original design, layout, and visual style.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop ai-translate --image ./poster.png\n" +
    "  weshop ai-translate --image ./menu.png --prompt 'Translate all text to French, keep original design'\n" +
    "  weshop ai-translate --image ./sign.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input image containing text — local file path or URL")
  .option("--prompt <text>", "Custom translation instruction (default: translate to English)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const { url: imageUrl } = await resolveImage(opts.image);

      const params: Record<string, unknown> = {
        textDescription: opts.prompt ?? DEFAULT_PROMPT,
        images: [imageUrl],
      };
      if (opts.batch != null) params.batchCount = opts.batch;

      const input: Record<string, unknown> = { originalImage: imageUrl };
      if (opts.taskName) input.taskName = opts.taskName;

      const body: RunRequest = {
        agent: { name: "ai-translate", version: "v1.0" },
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
