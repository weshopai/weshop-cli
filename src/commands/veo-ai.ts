import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const veoAiCmd = new Command("veo-ai")
  .summary("Veo 3 AI video generator — create cinematic videos from images and text using Google Veo 3.1")
  .description(
    "Generate cinematic AI videos from an image and prompt using Google Veo 3.1.\n" +
    "Results come back in video[N].url.\n\n" +
    "Model (--model):\n" +
    "  Veo_3_1       Veo 3.1 (default)\n" +
    "  Veo_3_1_Fast  Veo 3.1 Fast\n\n" +
    "Duration (--duration): 4s (default), 6s, 8s\n\n" +
    "Aspect ratio (--aspect-ratio): 16:9 (default for Veo_3_1), 9:16\n\n" +
    "Examples:\n" +
    "  weshop veo-ai --image ./scene.png --prompt 'Slow aerial drift over a coastal cliff at golden hour'\n" +
    "  weshop veo-ai --image ./portrait.png --prompt 'Subject smiles and looks at camera' --model Veo_3_1_Fast --duration 6s --aspect-ratio 9:16"
  )
  .requiredOption("--image <path|url>", "Input image — local file path or URL")
  .requiredOption("--prompt <text>", "Describe the desired video scene")
  .option("--model <name>", "Veo model version (default: Veo_3_1)")
  .option("--duration <time>", "Video duration: 4s (default), 6s, or 8s")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (default: 16:9)")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const modelName = opts.model ?? "Veo_3_1";
    const defaultAspect = modelName === "Veo_3_1_Fast" ? "9:16" : "16:9";

    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      modelName,
      duration: opts.duration ?? "4s",
      aspectRatio: opts.aspectRatio ?? defaultAspect,
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("veo-ai", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
