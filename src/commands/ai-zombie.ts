import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "Turn this person into zombie, realistic.";

export const aiZombieCmd = new Command("ai-zombie")
  .summary("AI zombie filter — transform a portrait into a realistic zombie")
  .description(
    "Transform a portrait photo into a realistic zombie with decayed skin, wounds,\n" +
    "and undead features.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop ai-zombie --image ./person.png\n" +
    "  weshop ai-zombie --image ./person.png --prompt 'Fresh zombie, torn clothes, glowing eyes'\n" +
    "  weshop ai-zombie --image ./person.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input portrait image — local file path or URL")
  .option("--prompt <text>", "Custom zombie transformation instruction")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("ai-zombie", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
