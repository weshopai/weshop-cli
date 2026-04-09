import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "wild style graffiti, spray paint texture, artistic chaos, plain background.";

export const wildGraffitiCmd = new Command("wild-graffiti")
  .summary("AI wild graffiti generator — create wild-style spray paint graffiti art from text or image")
  .description(
    "Generate wild-style graffiti art with spray paint texture and artistic chaos.\n" +
    "Image is optional — text-only generation is supported.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop wild-graffiti --prompt 'Wild style graffiti spelling KIRO, neon colors'\n" +
    "  weshop wild-graffiti --image ./sketch.png --prompt 'Turn this into wild style graffiti'\n" +
    "  weshop wild-graffiti --prompt 'Throw-up graffiti bubble letters' --batch 4"
  )
  .option("--image <path|url>", "Reference image — local file path or URL (optional)")
  .option("--prompt <text>", "Describe the desired graffiti style or text")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("wild-graffiti-generator", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
