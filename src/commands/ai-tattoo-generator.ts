import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "Generate aline art style single piece no color tattoo design try-on, small, on arm.";

export const aiTattooGeneratorCmd = new Command("ai-tattoo-generator")
  .summary("AI tattoo generator — create a tattoo design try-on from text or reference image")
  .description(
    "Generate a tattoo design and apply it as a try-on. Image is optional.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop ai-tattoo-generator --image ./person.png\n" +
    "  weshop ai-tattoo-generator --image ./person.png --prompt 'Dragon tattoo on forearm, black ink'\n" +
    "  weshop ai-tattoo-generator --prompt 'Minimalist mountain tattoo design' --batch 4"
  )
  .option("--image <path|url>", "Reference person image — local file path or URL (optional)")
  .option("--prompt <text>", "Describe the desired tattoo design and placement")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("ai-tattoo-generator", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
