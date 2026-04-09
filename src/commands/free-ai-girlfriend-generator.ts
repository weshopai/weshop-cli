import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "A random AI girlfriend portrait, beautiful young woman, {ethnicity}, {hairstyle}, {makeup}, {vibe}, gentle soft smile, natural skin texture, cinematic soft lighting, {scene}, shallow depth of field, realistic photography, emotional warm atmosphere, 50mm lens, f1.8, ultra-detailed, 4k, masterpiece.";

export const freeAiGirlfriendGeneratorCmd = new Command("free-ai-girlfriend-generator")
  .summary("AI girlfriend generator — generate a realistic AI girlfriend portrait from text or reference image")
  .description(
    "Generate a photorealistic AI girlfriend portrait. Image is optional.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    "  Random AI girlfriend portrait with randomized ethnicity, hairstyle, makeup, vibe, and scene.\n\n" +
    "Examples:\n" +
    "  weshop free-ai-girlfriend-generator --prompt 'Asian woman, long black hair, casual vibe, coffee shop'\n" +
    "  weshop free-ai-girlfriend-generator --image ./reference.png --prompt 'Similar style, outdoor park setting'\n" +
    "  weshop free-ai-girlfriend-generator --batch 4"
  )
  .option("--image <path|url>", "Reference image — local file path or URL (optional)")
  .option("--prompt <text>", "Describe the desired girlfriend portrait")
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
      const body: RunRequest = { agent: { name: "free-ai-girlfriend-generator", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
