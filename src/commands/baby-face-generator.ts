import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "Generate a realistic photo of a [female] baby based on the two uploaded parent photos. Blend the facial features, skin tones, ethnic characteristics and any specific feature from both parents to create a natural-looking child. Child photo only.";

export const babyFaceGeneratorCmd = new Command("baby-face-generator")
  .summary("AI baby face generator — predict what a baby would look like from two parent photos")
  .description(
    "Generate a realistic baby photo by blending features from two parent photos.\n" +
    "Supports up to 2 images. Images are optional.\n\n" +
    "In your --prompt, reference parents as 'image 1' and 'image 2'.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    "  Female baby blending facial features, skin tones, and ethnic characteristics from both parents.\n\n" +
    "Examples:\n" +
    "  weshop baby-face-generator --image ./parent1.png --image ./parent2.png\n" +
    "  weshop baby-face-generator --image ./mom.png --image ./dad.png --prompt 'Male baby, blend features from image 1 and image 2'\n" +
    "  weshop baby-face-generator --image ./parent1.png --image ./parent2.png --batch 4"
  )
  .option("--image <path|url...>", "Parent photos — local file paths or URLs (up to 2, optional)")
  .option("--prompt <text>", "Custom baby generation instruction")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    if (opts.image && opts.image.length > 0) {
      const imageList: string[] = opts.image;
      if (imageList.length > 2) { console.error("[error]\n  message: Maximum 2 images allowed"); process.exit(1); }
      await executeRun("baby-face-generator", "v1.0", { images: imageList, wait: opts.wait }, params, extraInput);
    } else {
      await executeRun("baby-face-generator", "v1.0", { wait: opts.wait }, params, extraInput);
    }
  });
