import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const seedanceCmd = new Command("seedance")
  .summary("Seedance video generator — create cinematic AI videos using Seedance 2.0, 2.0 Mini, 1.5 Pro, or 1.0 by ByteDance")
  .description(
    "Generate cinematic AI videos using Seedance models by ByteDance.\n" +
    "Results come back in video[N].url.\n\n" +
    "Supports one input image, or up to 9 reference images (Seedance_20 / Seedance_20_Mini multimodal).\n" +
    "When using multiple images, refer to them in the prompt as image 1, image 2, etc.\n" +
    "Agent version stays v1.0; existing Seedance_20 / 1.5 / 1.0 model names are unchanged.\n\n" +
    "Model (--model):\n" +
    "  Seedance_20          Seedance 2.0 (default) — multi-image reference supported\n" +
    "  Seedance_20_Mini     Seedance 2.0 Mini — same multimodal inputs, lower cost, 720p\n" +
    "  Seedance_15_Pro      Seedance 1.5 Pro — uses the first image as first frame\n" +
    "  Seedance_10_Pro      Seedance 1.0 Pro — uses the first image as first frame\n" +
    "  Seedance_10_Pro_Fast Seedance 1.0 Pro Fast — uses the first image as first frame\n\n" +
    "Duration (--duration):\n" +
    "  Seedance_20/20_Mini/1.5_Pro: 4s-15s  (default: 4s)\n" +
    "  Seedance_10_Pro/Fast: 2s-12s  (default: 4s)\n\n" +
    "Aspect ratio (--aspect-ratio):\n" +
    "  Seedance_20/20_Mini/1.5_Pro: 21:9, 16:9, 9:16, 3:4, 4:3, 1:1  (default: 3:4)\n" +
    "  Seedance_10_Pro/Fast: 16:9, 9:16, 3:4, 4:3, 1:1  (default: 3:4)\n\n" +
    "Generate audio (--generate-audio): true or false (Seedance_20, Seedance_20_Mini, and 1.5_Pro only, default: true)\n\n" +
    "Examples:\n" +
    "  weshop seedance --image ./scene.png --prompt 'Cinematic drone shot over a city'\n" +
    "  weshop seedance --image ./keyframe.png --image ./character.png --prompt 'Image 1 is the scene; image 2 is the character walking through it' --model Seedance_20\n" +
    "  weshop seedance --image ./scene.png --prompt 'Cinematic drone shot over a city' --model Seedance_20_Mini --duration 8s\n" +
    "  weshop seedance --image ./photo.png --prompt 'Person walks in slow motion' --model Seedance_15_Pro --duration 8s\n" +
    "  weshop seedance --image ./landscape.png --prompt 'Sunset timelapse' --aspect-ratio 16:9 --no-wait"
  )
  .requiredOption("--image <path|url...>", "Input / reference images — local file paths or URLs (1–9; multi-image best with Seedance_20 and Seedance_20_Mini)")
  .requiredOption("--prompt <text>", "Describe the desired video scene")
  .option("--model <name>", "Seedance model version (default: Seedance_20)")
  .option("--duration <time>", "Video duration, e.g. 4s, 8s (default: 4s)")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (default: 3:4)")
  .option("--generate-audio <bool>", "Generate audio: true (default) or false (Seedance_20, Seedance_20_Mini, and 1.5_Pro only)")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const imageList: string[] = opts.image;
    if (imageList.length > 9) {
      console.error("[error]\n  message: Maximum 9 images allowed");
      process.exit(1);
    }

    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      modelName: opts.model ?? "Seedance_20",
      duration: opts.duration ?? "4s",
      aspectRatio: opts.aspectRatio ?? "3:4",
      generateAudio: opts.generateAudio ?? "true",
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("seedance", "v1.0", { images: imageList, wait: opts.wait }, params, extraInput);
  });
