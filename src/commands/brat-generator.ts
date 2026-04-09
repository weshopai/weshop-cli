import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "a pure [color] background with text [Brat] on it. 1:1 ratio.";

export const bratGeneratorCmd = new Command("brat-generator")
  .summary("AI brat generator — create a Charli XCX brat-style album cover meme with custom text and color")
  .description(
    "Generate a brat-style meme or album cover inspired by Charli XCX.\n" +
    "Image is optional — text-only generation is supported.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop brat-generator --prompt 'a pure lime green background with text [brat] on it. 1:1 ratio.'\n" +
    "  weshop brat-generator --prompt 'a pure pink background with text [your name] on it. 1:1 ratio.' --batch 2"
  )
  .option("--image <path|url>", "Reference image — local file path or URL (optional)")
  .option("--prompt <text>", "Describe the brat cover (default: random color with Brat text)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("brat-generator", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
