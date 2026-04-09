import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

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
    try {
      const imageList: string[] = opts.image;
      if (imageList.length > 2) { console.error("[error]\n  message: Maximum 2 images allowed"); process.exit(1); }
      const urls: string[] = [];
      for (const img of imageList) { const { url } = await resolveImage(img); urls.push(url); }
      const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT, images: urls };
      if (opts.batch != null) params.batchCount = opts.batch;
      const input: Record<string, unknown> = { originalImage: urls[0] };
      if (opts.taskName) input.taskName = opts.taskName;
      const body: RunRequest = { agent: { name: "celeb-ai", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
