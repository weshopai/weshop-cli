import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT = "Change to ［short hair］";

export const aiHairstyleChangerCmd = new Command("ai-hairstyle-changer")
  .summary("AI hairstyle changer — change a person's hairstyle from a photo or text description")
  .description(
    "Change a person's hairstyle using AI. Image is optional.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop ai-hairstyle-changer --image ./person.png\n" +
    "  weshop ai-hairstyle-changer --image ./person.png --prompt 'Change to long wavy hair, dark brown'\n" +
    "  weshop ai-hairstyle-changer --image ./person.png --prompt 'Pixie cut with side swept bangs' --batch 4"
  )
  .option("--image <path|url>", "Reference person image — local file path or URL (optional)")
  .option("--prompt <text>", "Describe the desired hairstyle (default: short hair)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
      if (opts.batch != null) params.batchCount = opts.batch;
      const input: Record<string, unknown> = {};
      if (opts.taskName) input.taskName = opts.taskName;
      if (opts.image) {
        const { url: imageUrl } = await resolveImage(opts.image);
        params.images = [imageUrl];
        input.originalImage = imageUrl;
      }
      const body: RunRequest = { agent: { name: "ai-hairstyle-changer", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
