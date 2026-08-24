import { Command } from "commander";
import { resolveImage } from "../client.js";
import { executeRun } from "../run-helper.js";

function invalidSeedanceOption(message: string): never {
  console.error(`[error]\n  message: ${message}`);
  process.exit(1);
}

export const seedanceCmd = new Command("seedance")
  .summary("Seedance video generator — create cinematic AI videos using Seedance 2.0 by ByteDance")
  .description(
    "Generate cinematic AI videos using Seedance models by ByteDance.\n" +
    "Results come back in video[N].url. --return-last-frame requests a final-frame image URL when WeShop successfully persists it.\n\n" +
    "Seedance 2.0 and Mini support text-only generation, first/last frames, multimodal references, and video extension.\n" +
    "When using multiple images, refer to them in the prompt as image 1, image 2, etc.\n\n" +
    "Model (--model):\n" +
    "  Seedance_20          Seedance 2.0 (default) — 480p, 720p, 1080p, 4k\n" +
    "  Seedance_20_Mini     Seedance 2.0 Mini — 480p, 720p\n" +
    "  Seedance_15_Pro      Seedance 1.5 Pro — uses the first image as first frame\n" +
    "  Seedance_10_Pro      Seedance 1.0 Pro — uses the first image as first frame\n" +
    "  Seedance_10_Pro_Fast Seedance 1.0 Pro Fast — uses the first image as first frame\n\n" +
    "Duration (--duration):\n" +
    "  Seedance_20/Mini/1.5_Pro: 4s-15s  (default: 4s)\n" +
    "  Seedance_10_Pro/Fast: 2s-12s  (default: 4s)\n\n" +
    "Aspect ratio (--aspect-ratio):\n" +
    "  Seedance_20/Mini: 21:9, 16:9, 9:16, 3:4, 4:3, 1:1, adaptive  (default: 16:9)\n" +
    "  Seedance_10_Pro/Fast: 16:9, 9:16, 3:4, 4:3, 1:1  (default: 3:4)\n\n" +
    "Generate audio (--generate-audio): true or false (Seedance_20 and 1.5_Pro only, default: true)\n\n" +
    "Examples:\n" +
    "  weshop seedance --prompt 'Cinematic drone shot over a city' --resolution 720p\n" +
    "  weshop seedance --image ./keyframe.png --image ./character.png --prompt 'Image 1 is the scene; image 2 is the character walking through it' --model Seedance_20\n" +
    "  weshop seedance --image ./photo.png --prompt 'Person walks in slow motion' --model Seedance_15_Pro --duration 8s\n" +
    "  weshop seedance --first-frame ./first.png --last-frame ./last.png --prompt 'A product rotates slowly in a studio' --resolution 1080p\n" +
    "  weshop seedance --extend-video https://example.com/source.mp4 --extend-direction forward --prompt 'Continue naturally' --resolution 720p\n" +
    "  weshop seedance --prompt 'A slow aerial move over a valley' --return-last-frame"
  )
  .option("--image <path|url...>", "Reference images — local file paths or URLs (up to 9, optional)")
  .option("--video <url...>", "Reference videos — hosted URLs only (up to 3, optional)")
  .option("--audio <url...>", "Reference audios — hosted URLs only (up to 3, optional)")
  .option("--first-frame <path|url>", "First frame — local image path or URL")
  .option("--last-frame <path|url>", "Last frame — local image path or URL; requires --first-frame")
  .option("--extend-video <url>", "Video to extend — hosted URL only")
  .option("--extend-direction <direction>", "Extension direction: forward or backward")
  .requiredOption("--prompt <text>", "Describe the desired video scene")
  .option("--model <name>", "Seedance model version (default: Seedance_20)")
  .option("--duration <time>", "Video duration: 4s-15s (default: 4s)")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (2.0/Mini default: 16:9)")
  .option("--resolution <resolution>", "2.0: 480p, 720p, 1080p, 4k; Mini: 480p or 720p")
  .option("--return-last-frame", "Request the generated video's final-frame image URL (best effort)")
  .option("--generate-audio <bool>", "Generate audio: true (default) or false (Seedance_20 and 1.5_Pro only)")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const modelName = opts.model ?? "Seedance_20";
    const isSeedance20Series = modelName === "Seedance_20" || modelName === "Seedance_20_Mini";
    const imageList: string[] | undefined = opts.image;
    const videos: string[] | undefined = opts.video;
    const audios: string[] | undefined = opts.audio;

    if (isSeedance20Series) {
      if (opts.lastFrame && !opts.firstFrame) invalidSeedanceOption("--last-frame requires --first-frame");
      if (opts.extendVideo && !/^https?:\/\//.test(opts.extendVideo)) invalidSeedanceOption("--extend-video must be a hosted URL");
      if (opts.extendVideo && !["forward", "backward"].includes(opts.extendDirection)) invalidSeedanceOption("--extend-direction must be forward or backward when --extend-video is set");
      if (opts.duration && !/^([4-9]|1[0-5])s$/.test(opts.duration)) invalidSeedanceOption("--duration must be 4s-15s");
      if (opts.aspectRatio && !["21:9", "16:9", "4:3", "1:1", "3:4", "9:16", "adaptive"].includes(opts.aspectRatio)) invalidSeedanceOption("invalid --aspect-ratio");
      if (opts.resolution && !["480p", "720p", "1080p", "4k"].includes(opts.resolution)) invalidSeedanceOption("--resolution must be 480p, 720p, 1080p, or 4k");
      if (modelName === "Seedance_20_Mini" && opts.resolution && !["480p", "720p"].includes(opts.resolution)) invalidSeedanceOption("Seedance_20_Mini only supports 480p or 720p");
      if ((imageList?.length ?? 0) > 9) invalidSeedanceOption("Maximum 9 images allowed");
      if ((videos?.length ?? 0) > 3) invalidSeedanceOption("Maximum 3 videos allowed");
      if ((audios?.length ?? 0) > 3) invalidSeedanceOption("Maximum 3 audios allowed");
      if (videos?.some((video) => !/^https?:\/\//.test(video))) invalidSeedanceOption("--video values must be hosted URLs");
      if (audios?.some((audio) => !/^https?:\/\//.test(audio))) invalidSeedanceOption("--audio values must be hosted URLs");
      if (!imageList?.length && !videos?.length && (audios?.length ?? 0) > 0) invalidSeedanceOption("Seedance 2.0 does not support audio-only input");
      if (opts.firstFrame && (imageList?.length || videos?.length || audios?.length || opts.extendVideo)) invalidSeedanceOption("--first-frame cannot be combined with reference media or --extend-video");
      if (opts.extendVideo && (imageList?.length || videos?.length || audios?.length)) invalidSeedanceOption("--extend-video cannot be combined with additional reference media");
      if (opts.aspectRatio === "adaptive" && !opts.firstFrame && !opts.extendVideo) invalidSeedanceOption("--aspect-ratio adaptive requires --first-frame or --extend-video");
    } else if (!imageList?.length) {
      invalidSeedanceOption("--image is required for Seedance 1.x models");
    }

    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      modelName,
      duration: opts.duration ?? "4s",
      aspectRatio: opts.aspectRatio ?? (isSeedance20Series ? "16:9" : "3:4"),
      generateAudio: opts.generateAudio ?? "true",
    };
    if (isSeedance20Series) {
      params.resolution = opts.resolution ?? "720p";
      if (opts.firstFrame) params.firstFrame = (await resolveImage(opts.firstFrame)).url;
      if (opts.lastFrame) params.lastFrame = (await resolveImage(opts.lastFrame)).url;
      if (opts.extendVideo) {
        params.extendVideo = opts.extendVideo;
        params.extendDirection = opts.extendDirection;
      }
      if (opts.returnLastFrame) params.returnLastFrame = true;
    }
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    const referenceVideos = opts.extendVideo ? [opts.extendVideo] : videos;
    await executeRun("seedance", "v1.0", { images: imageList, videos: referenceVideos, audios, wait: opts.wait }, params, extraInput);
  });
