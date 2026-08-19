import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const sulphur2Cmd = new Command("sulphur2")
  .summary("Sulphur 2 AI video generator — create cinematic short videos from a still image and prompt using the LTX 2.3 video model")
  .description(
    "Generate cinematic short videos from an image and prompt using Sulphur 2 (LTX 2.3).\n" +
    "Results come back in video[N].url.\n\n" +
    "An input image is required and is used as the first frame.\n" +
    "Write the prompt with subject, action, camera movement, lighting, mood, and style.\n\n" +
    "Duration (--duration): 5s (default), 6s, 7s, 8s, 9s, 10s\n" +
    "Aspect ratio (--aspect-ratio): auto, 16:9 (default), 9:16, 1:1, 3:4, 4:3\n\n" +
    "Examples:\n" +
    "  weshop sulphur2 --image ./product.png --prompt 'Slow orbit around a studio-lit product on a reflective surface'\n" +
    "  weshop sulphur2 --image ./portrait.png --prompt 'Subject turns toward camera, golden hour backlight, gentle dolly-in' --duration 8s --aspect-ratio 9:16"
  )
  .requiredOption("--image <path|url>", "Input image — local file path or URL")
  .requiredOption("--prompt <text>", "Describe the desired motion, camera, lighting, and scene")
  .option("--duration <time>", "Video duration: 5s (default), 6s, 7s, 8s, 9s, or 10s")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (default: 16:9)")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      duration: opts.duration ?? "5s",
      aspectRatio: opts.aspectRatio ?? "16:9",
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("sulphur2", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
