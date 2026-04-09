import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "naturally undress and change the outfit into a thin bikini while keeping body proportions natural. Keep Model dancing tiktok dance.";

export const aiHotGirlImageCmd = new Command("ai-hot-girl-image")
  .summary("AI hot girl image — transform a person photo into a bikini model image or video")
  .description(
    "Transform a portrait or full-body photo into a bikini model image or video.\n\n" +
    "Generated type (--generated-type):\n" +
    "  video   Generate a short video (default)\n" +
    "  image   Generate a still image\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop ai-hot-girl-image --image ./person.png --prompt 'Bikini model on a beach'\n" +
    "  weshop ai-hot-girl-image --image ./person.png --generated-type image --batch 2\n" +
    "  weshop ai-hot-girl-image --image ./person.png --generated-type video --no-wait"
  )
  .requiredOption("--image <path|url>", "Input portrait or full-body photo — local file path or URL")
  .option("--prompt <text>", "Describe the desired bikini model scene")
  .option("--generated-type <type>", "Output type: video (default) or image")
  .option("--batch <count>", "Number of outputs to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      textDescription: opts.prompt ?? DEFAULT_PROMPT,
      generatedType: opts.generatedType ?? "video",
    };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("ai-hot-girl-image", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
