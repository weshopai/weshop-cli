import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const viduAiCmd = new Command("vidu-ai")
  .summary("Vidu Q3 AI video generator — create cinematic short videos with Vidu Q3 Pro or Pro Fast")
  .description(
    "Generate cinematic AI videos from an image and prompt using Vidu Q3.\n" +
    "Results come back in video[N].url.\n\n" +
    "Model (--model):\n" +
    "  Vidu_Q3_Pro       Vidu Q3 Pro (default)\n" +
    "  Vidu_Q3_Pro_Fast  Vidu Q3 Pro Fast\n\n" +
    "Duration (--duration): 4s (default) through 16s\n\n" +
    "Aspect ratio (--aspect-ratio): 16:9 (default for Pro), 9:16, 3:4, 4:3, 1:1\n\n" +
    "Generate audio (--generate-audio): true (default), false\n\n" +
    "Examples:\n" +
    "  weshop vidu-ai --image ./scene.png --prompt 'Cinematic tracking shot through a rainy street'\n" +
    "  weshop vidu-ai --image ./product.png --prompt 'Product reveal with dramatic lighting' --model Vidu_Q3_Pro_Fast --duration 8s"
  )
  .requiredOption("--image <path|url>", "Input image — local file path or URL")
  .requiredOption("--prompt <text>", "Describe the desired video scene")
  .option("--model <name>", "Vidu model version (default: Vidu_Q3_Pro)")
  .option("--duration <time>", "Video duration, e.g. 4s, 8s, 16s (default: 4s)")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (default: 16:9 for Pro, 9:16 for Pro Fast)")
  .option("--generate-audio <bool>", "Generate audio: true (default) or false")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const modelName = opts.model ?? "Vidu_Q3_Pro";
    const defaultAspect = modelName === "Vidu_Q3_Pro_Fast" ? "9:16" : "16:9";

    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      modelName,
      duration: opts.duration ?? "4s",
      aspectRatio: opts.aspectRatio ?? defaultAspect,
      generateAudio: opts.generateAudio ?? "true",
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("vidu-ai", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
