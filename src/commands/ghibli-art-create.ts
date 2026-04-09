import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "Turn this image into ghibli style";

export const ghibliArtCreateCmd = new Command("ghibli-art-create")
  .summary("AI Ghibli art creator — transform any photo into Studio Ghibli anime art style")
  .description(
    "Transform any photo into Studio Ghibli-style anime art. Image is optional.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop ghibli-art-create --image ./photo.png\n" +
    "  weshop ghibli-art-create --image ./landscape.png --prompt 'Ghibli style with soft watercolor and magical atmosphere'\n" +
    "  weshop ghibli-art-create --batch 2 --image ./portrait.png"
  )
  .option("--image <path|url>", "Input image — local file path or URL (optional)")
  .option("--prompt <text>", "Custom Ghibli style instruction")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("ghibli-art-create", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
