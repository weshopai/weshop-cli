import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "what will this person look like when he/she is 60";

export const aiAgingCmd = new Command("ai-aging")
  .summary("AI age progression — transform a portrait to show how the person will look older")
  .description(
    "Apply AI age progression to a portrait photo. Shows how the person will look at an older age.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop ai-aging --image ./person.png\n" +
    "  weshop ai-aging --image ./person.png --prompt 'What will this person look like at 80'\n" +
    "  weshop ai-aging --image ./person.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input portrait image — local file path or URL")
  .option("--prompt <text>", "Custom aging instruction (default: age to 60)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("ai-aging", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
