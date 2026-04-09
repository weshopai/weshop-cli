import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "Merge these two photos together naturally. Don't simply put element on the another image, try to generate a merged photo.";

export const aiImageCombinerCmd = new Command("ai-image-combiner")
  .summary("AI image combiner — naturally merge two photos into a single cohesive image")
  .description(
    "Merge two photos together into a single naturally blended image.\n" +
    "Requires exactly 2 images. Reference them in your prompt as 'image 1' and 'image 2'.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop ai-image-combiner --image ./photo1.png --image ./photo2.png\n" +
    "  weshop ai-image-combiner --image ./person.png --image ./background.png --prompt 'Place image 1 person into image 2 scene naturally'\n" +
    "  weshop ai-image-combiner --image ./a.png --image ./b.png --batch 2"
  )
  .requiredOption("--image <path|url...>", "Two images to combine — local file paths or URLs (exactly 2 required)")
  .option("--prompt <text>", "Custom merge instruction (default: naturally merge both photos)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const imageList: string[] = opts.image;
    if (imageList.length !== 2) {
      console.error("[error]\n  message: Exactly 2 images required for ai-image-combiner");
      process.exit(1);
    }
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("ai-image-combiner", "v1.0", { images: imageList, wait: opts.wait }, params, extraInput);
  });
