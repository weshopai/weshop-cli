import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const minimaxH3Cmd = new Command("minimax-h3")
  .summary("MiniMax H3 — build multimodal AI videos from text, reference images, and optional reference videos and audio")
  .description(
    "Build multimodal AI videos with MiniMax H3.\n" +
    "Results come back in video[N].url.\n\n" +
    "Model (--model):\n" +
    "  MiniMax_H3_Reference  Reference mode (default) — text-only, or up to 9 images + 3 videos + 3 audios\n" +
    "  MiniMax_H3_I2V        Image to Video — requires 1–2 images (image 1 = first frame, image 2 = last frame); no video/audio input; aspect ratio must be adaptive\n\n" +
    "--video and --audio must be hosted URLs (local video/audio upload is not supported).\n\n" +
    "Duration (--duration): 5s-15s (default: 5s)\n" +
    "Aspect ratio (--aspect-ratio): adaptive (default), 21:9, 16:9, 4:3, 1:1, 3:4, 9:16\n\n" +
    "Examples:\n" +
    "  weshop minimax-h3 --prompt 'A product slowly rotates on a studio table, soft rim light'\n" +
    "  weshop minimax-h3 --image ./character.png --prompt 'Keep image 1 identity walking through a rainy street' --aspect-ratio 9:16\n" +
    "  weshop minimax-h3 --image ./first.png --image ./last.png --prompt 'Walk from the doorway to the window' --model MiniMax_H3_I2V --duration 8s\n" +
    "  weshop minimax-h3 --image ./char.png --video https://example.com/motion.mp4 --audio https://example.com/voice.mp3 --prompt 'Keep image 1 identity, follow the reference video, use the audio as voice'"
  )
  .option("--image <path|url...>", "Reference or frame images — local file paths or URLs (Reference: up to 9; I2V: 1–2)")
  .option("--video <url...>", "Optional reference videos — hosted URLs only (up to 3, Reference mode)")
  .option("--audio <url...>", "Optional reference audios — hosted URLs only (up to 3, Reference mode)")
  .requiredOption("--prompt <text>", "Describe the desired video, motion, camera, and audio")
  .option("--model <name>", "MiniMax H3 mode: MiniMax_H3_Reference (default) or MiniMax_H3_I2V")
  .option("--duration <time>", "Video duration, 5s-15s (default: 5s)")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (default: adaptive)")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const modelName = opts.model ?? "MiniMax_H3_Reference";
    const imageList: string[] = opts.image ?? [];
    const videos: string[] | undefined = opts.video;
    const audios: string[] | undefined = opts.audio;
    const aspectRatio = opts.aspectRatio ?? "adaptive";

    if (modelName === "MiniMax_H3_I2V") {
      if (imageList.length < 1 || imageList.length > 2) {
        console.error("[error]\n  message: MiniMax_H3_I2V requires 1–2 images (image 1 = first frame, image 2 = last frame)");
        process.exit(1);
      }
      if ((videos && videos.length > 0) || (audios && audios.length > 0)) {
        console.error("[error]\n  message: MiniMax_H3_I2V does not support --video or --audio; use MiniMax_H3_Reference");
        process.exit(1);
      }
      if (aspectRatio !== "adaptive") {
        console.error("[error]\n  message: MiniMax_H3_I2V requires --aspect-ratio adaptive");
        process.exit(1);
      }
    } else {
      if (imageList.length > 9) {
        console.error("[error]\n  message: Maximum 9 images allowed in Reference mode");
        process.exit(1);
      }
      if (videos && videos.length > 3) {
        console.error("[error]\n  message: Maximum 3 videos allowed");
        process.exit(1);
      }
      if (audios && audios.length > 3) {
        console.error("[error]\n  message: Maximum 3 audios allowed");
        process.exit(1);
      }
    }

    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      modelName,
      duration: opts.duration ?? "5s",
      aspectRatio,
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun(
      "minimax-h3",
      "v1.0",
      {
        images: imageList.length ? imageList : undefined,
        videos: videos?.length ? videos : undefined,
        audios: audios?.length ? audios : undefined,
        wait: opts.wait,
      },
      params,
      extraInput
    );
  });
