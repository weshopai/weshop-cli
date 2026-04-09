import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT = "undress the outfit into sexy bikini while keeping body proportions natural.";

export const clothingMagicRemoverCmd = new Command("clothing-magic-remover")
  .summary("AI clothing remover — erase accessories or partial clothing while keeping textures realistic")
  .description(
    "Remove or erase clothing items from a person photo while keeping textures realistic.\n" +
    "Prompt is required.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop clothing-magic-remover --image ./person.png --prompt 'Remove the jacket, keep the shirt'\n" +
    "  weshop clothing-magic-remover --image ./person.png --prompt 'Erase the top, replace with bikini' --batch 2"
  )
  .requiredOption("--image <path|url>", "Input person photo — local file path or URL")
  .requiredOption("--prompt <text>", "Describe what clothing to remove")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const { url: imageUrl } = await resolveImage(opts.image);
      const params: Record<string, unknown> = { textDescription: opts.prompt, images: [imageUrl] };
      if (opts.batch != null) params.batchCount = opts.batch;
      const input: Record<string, unknown> = { originalImage: imageUrl };
      if (opts.taskName) input.taskName = opts.taskName;
      const body: RunRequest = { agent: { name: "clothing-magic-remover", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
