import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "Analyze the characteristics of these two faces, try imagine the person with both face features merged together. Don't simply put the face on the other image, try to generate a merged face. Keep Image 2 as the baseline.";

export const aiFaceMergeCmd = new Command("ai-face-merge")
  .summary("AI face merge — blend two faces together into a single realistic portrait")
  .description(
    "Merge two face photos into a single portrait that combines features from both.\n" +
    "Requires exactly 2 images. Image 2 is used as the baseline.\n\n" +
    "In your --prompt, reference images as 'image 1' and 'image 2'.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop ai-face-merge --image ./face1.png --image ./face2.png\n" +
    "  weshop ai-face-merge --image ./face1.png --image ./face2.png --prompt 'Merge image 1 and image 2, keep image 2 skin tone'\n" +
    "  weshop ai-face-merge --image ./a.png --image ./b.png --batch 2"
  )
  .requiredOption("--image <path|url...>", "Two face images — local file paths or URLs (exactly 2 required)")
  .option("--prompt <text>", "Custom merge instruction (default: blend both faces, image 2 as baseline)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const imageList: string[] = opts.image;
    if (imageList.length !== 2) {
      console.error("[error]\n  message: Exactly 2 images required for ai-face-merge");
      process.exit(1);
    }
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("ai-face-merge", "v1.0", { images: imageList, wait: opts.wait }, params, extraInput);
  });
