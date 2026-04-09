import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT = "Turn this photo into anime.";

export const animeImageConverterCmd = new Command("anime-image-converter")
  .summary("AI anime image converter — transform any photo into anime art style")
  .description(
    "Convert any photo into anime-style artwork.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop anime-image-converter --image ./photo.png\n" +
    "  weshop anime-image-converter --image ./portrait.png --prompt 'Studio Ghibli anime style, soft watercolor'\n" +
    "  weshop anime-image-converter --image ./photo.png --batch 4"
  )
  .requiredOption("--image <path|url>", "Input image — local file path or URL")
  .option("--prompt <text>", "Custom anime style instruction")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const { url: imageUrl } = await resolveImage(opts.image);
      const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT, images: [imageUrl] };
      if (opts.batch != null) params.batchCount = opts.batch;
      const input: Record<string, unknown> = { originalImage: imageUrl };
      if (opts.taskName) input.taskName = opts.taskName;
      const body: RunRequest = { agent: { name: "anime-image-converter", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
