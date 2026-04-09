import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "Take a selfie angle photo of this person and Harry Potter. No need to show the phone. choose appropriate background.";

export const celebAiCmd = new Command("celeb-ai")
  .summary("AI celebrity photo — place a person in a selfie with a celebrity or fictional character")
  .description(
    "Generate a selfie-style photo of the person alongside a celebrity or fictional character.\n" +
    "Supports up to 2 input images.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop celeb-ai --image ./person.png\n" +
    "  weshop celeb-ai --image ./person.png --prompt 'Selfie with Elon Musk at a tech conference'\n" +
    "  weshop celeb-ai --image ./person.png --batch 2"
  )
  .requiredOption("--image <path|url...>", "Input portrait image(s) — local file paths or URLs (up to 2)")
  .option("--prompt <text>", "Describe the celebrity or character and scene (default: selfie with Harry Potter)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const imageList: string[] = opts.image;
    if (imageList.length > 2) { console.error("[error]\n  message: Maximum 2 images allowed"); process.exit(1); }
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("celeb-ai", "v1.0", { images: imageList, wait: opts.wait }, params, extraInput);
  });
