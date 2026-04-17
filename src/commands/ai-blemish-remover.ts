import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "remove facial imperfections and acne spots, keep natural skin texture and facial expression, preserve identity and lighting";

export const aiBlemishRemoverCmd = new Command("ai-blemish-remover")
  .summary("AI blemish remover — clean up acne and blemishes while keeping natural skin and facial details")
  .description(
    "Automatically remove acne, spots, and other small facial imperfections while preserving natural skin texture, lighting, and facial identity.\n\n" +
      "Provide one portrait image. The agent targets blemishes and local imperfections instead of altering facial structure.\n\n" +
      "Default prompt (used when --prompt is omitted):\n" +
      `  "${DEFAULT_PROMPT}"\n\n` +
      "Examples:\n" +
      "  weshop ai-blemish-remover --image ./face.png\n" +
      "  weshop ai-blemish-remover --image ./portrait.jpg --prompt 'Clean pimples and red spots, keep pores and natural texture'\n" +
      "  weshop ai-blemish-remover --image ./photo.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input portrait image — local file path or URL")
  .option("--prompt <text>", "Custom blemish removal instructions (optional)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      textDescription: opts.prompt ?? DEFAULT_PROMPT,
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("ai-blemish-remover", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });

