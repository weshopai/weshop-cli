import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "Imagine what this person would look like when she is pregnant for 8 months. Don't change her outfit or her appearance.";

export const pregnantAiCmd = new Command("pregnant-ai")
  .summary("Visualize how a person would look pregnant — transforms a portrait photo")
  .description(
    "Transform a portrait photo to show how the person would look 8 months pregnant.\n\n" +
    "Requires one input image of the person. The default prompt preserves the original\n" +
    "outfit and appearance while adding a realistic pregnancy look.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop pregnant-ai --image ./person.png\n" +
    "  weshop pregnant-ai --image ./person.png --prompt 'Show her 6 months pregnant, keep her dress'\n" +
    "  weshop pregnant-ai --image ./person.png --batch 2 --no-wait"
  )
  .requiredOption("--image <path|url>", "Input portrait image — local file path or URL")
  .option("--prompt <text>", "Custom instruction (default: 8-month pregnancy transformation)")
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
        agent: { name: "pregnant_ai", version: "v1.0" },
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
