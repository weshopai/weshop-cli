import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "Merge these two photos together naturally. Don't simply put element on the another image, try to generate a merged photo.";

export const imageMixerCmd = new Command("image-mixer")
  .summary("Image mixer — naturally merge two photos into a single cohesive image")
  .description(
    "Merge two photos together into a single naturally blended image.\n" +
    "Requires exactly 2 images. Reference them in your prompt as 'image 1' and 'image 2'.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop image-mixer --image ./photo1.png --image ./photo2.png\n" +
    "  weshop image-mixer --image ./person.png --image ./background.png --prompt 'Place image 1 person into image 2 scene naturally'\n" +
    "  weshop image-mixer --image ./a.png --image ./b.png --batch 2"
  )
  .requiredOption("--image <path|url...>", "Two images to mix — local file paths or URLs (exactly 2 required)")
  .option("--prompt <text>", "Custom merge instruction (default: naturally merge both photos)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const imageList: string[] = opts.image;
      if (imageList.length !== 2) {
        console.error("[error]\n  message: Exactly 2 images required for image-mixer");
        process.exit(1);
      }
      const urls: string[] = [];
      for (const img of imageList) {
        const { url } = await resolveImage(img);
        urls.push(url);
      }
      const params: Record<string, unknown> = {
        textDescription: opts.prompt ?? DEFAULT_PROMPT,
        images: urls,
      };
      if (opts.batch != null) params.batchCount = opts.batch;
      const input: Record<string, unknown> = { originalImage: urls[0] };
      if (opts.taskName) input.taskName = opts.taskName;
      const body: RunRequest = { agent: { name: "image-mixer", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
