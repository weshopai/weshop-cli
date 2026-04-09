import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const aiImageAnimationCmd = new Command("ai-image-animation")
  .summary("AI image animation — animate a static image into a dynamic video using Kling")
  .description(
    "Animate a static image into a dynamic video. Results come back in video[N].url.\n\n" +
    "Model (--model):\n" +
    "  Kling_3_0   Kling 3.0 — supports 3s-15s duration (default)\n" +
    "  Kling_2_6   Kling 2.6 — supports 5s, 10s duration\n\n" +
    "Duration (--duration):\n" +
    "  Kling_3_0:  3s, 4s, 5s, 6s, 7s, 8s, 9s, 10s, 11s, 12s, 13s, 14s, 15s  (default: 5s)\n" +
    "  Kling_2_6:  5s, 10s  (default: 5s)\n\n" +
    "Generate audio (--generate-audio): true or false (default: true)\n\n" +
    "Examples:\n" +
    "  weshop ai-image-animation --image ./photo.png --prompt 'Gentle breeze, leaves rustling'\n" +
    "  weshop ai-image-animation --image ./portrait.png --prompt 'Person slowly turns and smiles' --model Kling_3_0 --duration 8s\n" +
    "  weshop ai-image-animation --image ./scene.png --prompt 'Camera pan left' --generate-audio false"
  )
  .requiredOption("--image <path|url>", "Input image to animate — local file path or URL")
  .requiredOption("--prompt <text>", "Describe the desired animation or motion")
  .option("--model <name>", "Kling model: Kling_3_0 (default) or Kling_2_6")
  .option("--duration <time>", "Video duration, e.g. 5s, 10s (default: 5s)")
  .option("--generate-audio <bool>", "Generate audio: true (default) or false")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      modelName: opts.model ?? "Kling_3_0",
      duration: opts.duration ?? "5s",
      generateAudio: opts.generateAudio ?? "true",
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("ai-image-animation", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
