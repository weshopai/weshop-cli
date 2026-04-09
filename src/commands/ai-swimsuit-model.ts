import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "naturally undress and change the outfit into a thin bikini while keeping body proportions natural. Keep Model dancing tiktok dance.";

export const aiSwimSuitModelCmd = new Command("ai-swimsuit-model")
  .summary("AI swimsuit model — transform a person photo into a swimsuit model image")
  .description(
    "Transform a portrait or full-body photo into a swimsuit model image.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop ai-swimsuit-model --image ./person.png\n" +
    "  weshop ai-swimsuit-model --image ./person.png --prompt 'One-piece swimsuit on a tropical beach'\n" +
    "  weshop ai-swimsuit-model --image ./person.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input person photo — local file path or URL")
  .option("--prompt <text>", "Custom swimsuit scene instruction")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("ai-swimsuit-model", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
