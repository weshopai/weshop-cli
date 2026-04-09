import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT = "Remove [any style] filter you think this photo have, including b&w filter.";

export const removeFilterFromPhotoCmd = new Command("remove-filter-from-photo")
  .summary("AI filter remover — remove photo filters and restore natural image colors")
  .description(
    "Remove any applied filters from a photo and restore natural colors. Image is optional.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop remove-filter-from-photo --image ./filtered-photo.png\n" +
    "  weshop remove-filter-from-photo --image ./photo.png --prompt 'Remove the vintage sepia filter'\n" +
    "  weshop remove-filter-from-photo --image ./photo.png --batch 2"
  )
  .option("--image <path|url>", "Input filtered photo — local file path or URL (optional)")
  .option("--prompt <text>", "Describe the filter to remove (default: auto-detect and remove all filters)")
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
      const body: RunRequest = { agent: { name: "remove-filter-from-photo", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
