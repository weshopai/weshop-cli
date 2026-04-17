import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "Combine the two uploaded portraits into one romantic couple's photo, sitting close together, natural lighting, realistic style";

export const aiCouplePhotoMakerCmd = new Command("ai-couple-photo-maker")
  .summary("AI couple photo maker — combine two portrait photos into one realistic romantic couple image")
  .description(
    "Generate a realistic romantic couple photo by combining two separate portrait images into a single scene.\n\n" +
      "Provide two portrait images (image 1 and image 2). The agent merges them into one couple photo while keeping facial identity and overall realism.\n\n" +
      "Default prompt (used when --prompt is omitted):\n" +
      `  "${DEFAULT_PROMPT}"\n\n` +
      "Examples:\n" +
      "  weshop ai-couple-photo-maker --image ./person1.png --image ./person2.png\n" +
      "  weshop ai-couple-photo-maker --image ./a.png --image ./b.png --prompt 'Casual couple photo, walking together in a park at sunset'\n" +
      "  weshop ai-couple-photo-maker --image ./selfie1.jpg --image ./selfie2.jpg --batch 2"
  )
  .requiredOption("--image <path|url...>", "Two portrait images — local file paths or URLs (up to 2)")
  .option("--prompt <text>", "Custom instructions for how the couple photo should look")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const imageList: string[] = opts.image;
    if (imageList.length > 2) {
      console.error("[error]\n  message: Maximum 2 images allowed");
      process.exit(1);
    }

    const params: Record<string, unknown> = {
      textDescription: opts.prompt ?? DEFAULT_PROMPT,
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("ai-couple-photo-maker", "v1.0", { images: imageList, wait: opts.wait }, params, extraInput);
  });

