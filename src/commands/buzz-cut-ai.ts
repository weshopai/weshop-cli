import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "Change the hairstyle to a buzz cut.";

export const buzzCutAiCmd = new Command("buzz-cut-ai")
  .summary("AI buzz cut filter — change a person's hairstyle to a buzz cut")
  .description(
    "Transform a portrait photo by changing the hairstyle to a buzz cut.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop buzz-cut-ai --image ./person.png\n" +
    "  weshop buzz-cut-ai --image ./person.png --prompt 'Short military buzz cut, keep face details'\n" +
    "  weshop buzz-cut-ai --image ./person.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input portrait image — local file path or URL")
  .option("--prompt <text>", "Custom hairstyle instruction (default: buzz cut)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("buzz-cut-ai", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
