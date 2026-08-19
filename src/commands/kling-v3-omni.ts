import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const klingV3OmniCmd = new Command("kling-v3-omni")
  .summary("Kling 3.0 Omni — create multimodal AI videos from text, reference images, and an optional reference video, with native audio")
  .description(
    "Create multimodal AI videos with Kling 3.0 Omni from text, up to 4 reference images, and an optional reference video.\n" +
    "Results come back in video[N].url.\n\n" +
    "Images and video are optional. Text-only generation is supported.\n" +
    "When using multiple images, refer to them in the prompt as image 1, image 2, etc.\n" +
    "--video must be a hosted URL (local video upload is not supported).\n" +
    "Aspect ratio is ignored when a reference video is provided.\n\n" +
    "Duration (--duration): 3s-15s (default: 5s)\n" +
    "Aspect ratio (--aspect-ratio): 16:9 (default), 9:16, 1:1\n" +
    "Generate audio (--generate-audio): true or false (default: false)\n\n" +
    "Examples:\n" +
    "  weshop kling-v3-omni --prompt 'A woman walks through neon rain, tracking shot, ambient city sound'\n" +
    "  weshop kling-v3-omni --image ./character.png --prompt 'Keep image 1 identity; she turns and smiles at camera' --duration 8s --aspect-ratio 9:16 --generate-audio true\n" +
    "  weshop kling-v3-omni --image ./char.png --video https://example.com/ref.mp4 --prompt 'Keep the character from image 1 and the motion from the reference video'"
  )
  .option("--image <path|url...>", "Reference images — local file paths or URLs (up to 4, optional)")
  .option("--video <url>", "Optional reference video — hosted URL only")
  .requiredOption("--prompt <text>", "Describe the desired video, character action, camera, and audio")
  .option("--model <name>", "Kling 3.0 Omni model (default: Kling_V3_Omni)")
  .option("--duration <time>", "Video duration, 3s-15s (default: 5s)")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (default: 16:9)")
  .option("--generate-audio <bool>", "Generate native audio: true or false (default: false)")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const imageList: string[] | undefined = opts.image;
    if (imageList && imageList.length > 4) {
      console.error("[error]\n  message: Maximum 4 images allowed");
      process.exit(1);
    }

    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      modelName: opts.model ?? "Kling_V3_Omni",
      duration: opts.duration ?? "5s",
      aspectRatio: opts.aspectRatio ?? "16:9",
      generateAudio: opts.generateAudio ?? "false",
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun(
      "kling-v3-omni",
      "v1.0",
      {
        images: imageList,
        videos: opts.video ? [opts.video] : undefined,
        wait: opts.wait,
      },
      params,
      extraInput
    );
  });
