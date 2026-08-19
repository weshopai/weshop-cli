import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const seedance25Cmd = new Command("seedance-25")
  .summary("Seedance 2.5 — create native 4–30 second cinematic videos from text, with optional reference images, videos, and audio")
  .description(
    "Create native 4–30 second cinematic videos with Seedance 2.5 by ByteDance.\n" +
    "Results come back in video[N].url.\n\n" +
    "Text-only generation is supported. Optionally pass up to 30 reference images, 10 reference videos, and 10 reference audios.\n" +
    "When using multiple images, refer to them in the prompt as image 1, image 2, etc.\n" +
    "--video and --audio must be hosted URLs (local video/audio upload is not supported).\n\n" +
    "Duration (--duration): 4s-30s (default: 4s)\n" +
    "Aspect ratio (--aspect-ratio): 21:9, 16:9, 9:16, 3:4 (default), 4:3, 1:1\n" +
    "Generate audio (--generate-audio): true (default) or false\n\n" +
    "Examples:\n" +
    "  weshop seedance-25 --prompt 'Cinematic drone shot over a coastal city at golden hour'\n" +
    "  weshop seedance-25 --image ./character.png --image ./scene.png --prompt 'Image 1 is the character walking through the scene in image 2' --duration 12s --aspect-ratio 16:9\n" +
    "  weshop seedance-25 --image ./product.png --video https://example.com/motion.mp4 --audio https://example.com/voice.mp3 --prompt 'Keep the product from image 1, follow the camera move, use the audio as voiceover' --duration 8s --generate-audio false"
  )
  .option("--image <path|url...>", "Reference images — local file paths or URLs (up to 30, optional)")
  .option("--video <url...>", "Optional reference videos — hosted URLs only (up to 10)")
  .option("--audio <url...>", "Optional reference audios — hosted URLs only (up to 10)")
  .requiredOption("--prompt <text>", "Describe the desired video scene, motion, camera, and audio")
  .option("--model <name>", "Seedance 2.5 model (default: Seedance_25)")
  .option("--duration <time>", "Video duration, 4s-30s (default: 4s)")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (default: 3:4)")
  .option("--generate-audio <bool>", "Generate native audio: true (default) or false")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const imageList: string[] | undefined = opts.image;
    const videos: string[] | undefined = opts.video;
    const audios: string[] | undefined = opts.audio;

    if (imageList && imageList.length > 30) {
      console.error("[error]\n  message: Maximum 30 images allowed");
      process.exit(1);
    }
    if (videos && videos.length > 10) {
      console.error("[error]\n  message: Maximum 10 videos allowed");
      process.exit(1);
    }
    if (audios && audios.length > 10) {
      console.error("[error]\n  message: Maximum 10 audios allowed");
      process.exit(1);
    }

    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      modelName: opts.model ?? "Seedance_25",
      duration: opts.duration ?? "4s",
      aspectRatio: opts.aspectRatio ?? "3:4",
      generateAudio: opts.generateAudio ?? "true",
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun(
      "seedance-25",
      "v1.0",
      {
        images: imageList,
        videos: videos?.length ? videos : undefined,
        audios: audios?.length ? audios : undefined,
        wait: opts.wait,
      },
      params,
      extraInput
    );
  });
