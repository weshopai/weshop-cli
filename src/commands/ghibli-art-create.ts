import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT = "Turn this image into ghibli style";

export const ghibliArtCreateCmd = new Command("ghibli-art-create")
  .summary("AI Ghibli art creator — transform any photo into Studio Ghibli anime art style")
  .description(
    "Transform any photo into Studio Ghibli-style anime art. Image is optional.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop ghibli-art-create --image ./photo.png\n" +
    "  weshop ghibli-art-create --image ./landscape.png --prompt 'Ghibli style with soft watercolor and magical atmosphere'\n" +
    "  weshop ghibli-art-create --batch 2 --image ./portrait.png"
  )
  .option("--image <path|url>", "Input image — local file path or URL (optional)")
  .option("--prompt <text>", "Custom Ghibli style instruction")
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
      const body: RunRequest = { agent: { name: "ghibli-art-create", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
