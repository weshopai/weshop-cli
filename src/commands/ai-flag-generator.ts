import { Command } from "commander";
import { executeRun } from "../run-helper.js";

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
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("ai-flag-generator", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
