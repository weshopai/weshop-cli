import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "A random flag design with metallic insignia, realistic fabric folds, and suitable background.";

export const aiFlagGeneratorCmd = new Command("ai-flag-generator")
  .summary("AI flag generator — create a custom flag design from text or a reference image")
  .description(
    "Generate a custom flag design with metallic insignia and realistic fabric folds.\n" +
    "Image is optional — text-only generation is supported.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop ai-flag-generator --prompt 'Flag of a fictional dragon kingdom, red and gold'\n" +
    "  weshop ai-flag-generator --image ./logo.png --prompt 'Flag featuring this logo on a blue background'\n" +
    "  weshop ai-flag-generator --prompt 'Minimalist tech company flag' --batch 4"
  )
  .option("--image <path|url>", "Reference image for the flag design — local file path or URL (optional)")
  .option("--prompt <text>", "Describe the desired flag design")
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
      const body: RunRequest = { agent: { name: "ai-flag-generator", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
