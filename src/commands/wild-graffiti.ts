import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "wild style graffiti, spray paint texture, artistic chaos, plain background.";

export const wildGraffitiCmd = new Command("wild-graffiti")
  .summary("AI wild graffiti generator — create wild-style spray paint graffiti art from text or image")
  .description(
    "Generate wild-style graffiti art with spray paint texture and artistic chaos.\n" +
    "Image is optional — text-only generation is supported.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop wild-graffiti --prompt 'Wild style graffiti spelling KIRO, neon colors'\n" +
    "  weshop wild-graffiti --image ./sketch.png --prompt 'Turn this into wild style graffiti'\n" +
    "  weshop wild-graffiti --prompt 'Throw-up graffiti bubble letters' --batch 4"
  )
  .option("--image <path|url>", "Reference image — local file path or URL (optional)")
  .option("--prompt <text>", "Describe the desired graffiti style or text")
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
      const body: RunRequest = { agent: { name: "wild-graffiti-generator", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
