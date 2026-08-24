import { Command } from "commander";
import { resolveImage } from "../client.js";
import { executeRun } from "../run-helper.js";

export const seedance25Cmd = new Command("seedance-25")
  .summary("Seedance 2.5 — create videos from text, first/last frames, multimodal references, or video extension")
  .description(
    "Create cinematic videos with Seedance 2.5 by ByteDance.\n" +
    "Results come back in video[N].url. --return-last-frame requests a final-frame image URL when WeShop successfully persists it.\n\n" +
    "Text-only generation is supported. Optionally pass up to 30 reference images, 10 reference videos, and 10 reference audios (50 total).\n" +
    "First/last-frame mode cannot be combined with ordinary references or video extension. Extension mode supports up to 10 videos including the target video.\n" +
    "When using multiple images, refer to them in the prompt as image 1, image 2, etc.\n" +
    "--video, --extend-video, and --audio must be hosted URLs (local video/audio upload is not supported).\n\n" +
    "Duration (--duration): -1 or 4s-30s (default: 4s)\n" +
    "Aspect ratio (--aspect-ratio): 21:9, 16:9, 9:16, 3:4 (default), 4:3, 1:1, adaptive\n" +
    "Generate audio (--generate-audio): true (default) or false\n\n" +
    "Examples:\n" +
    "  weshop seedance-25 --prompt 'Cinematic drone shot over a coastal city at golden hour'\n" +
    "  weshop seedance-25 --image ./character.png --image ./scene.png --prompt 'Image 1 is the character walking through the scene in image 2' --duration 12s --aspect-ratio 16:9\n" +
    "  weshop seedance-25 --first-frame ./first.png --last-frame ./last.png --prompt 'A product rotates slowly in a studio' --duration 8s --resolution 1080p\n" +
    "  weshop seedance-25 --extend-video https://example.com/source.mov --extend-direction backward --video https://example.com/style.mp4 --prompt 'Continue video 1 naturally' --output-format mov --duration -1\n" +
    "  weshop seedance-25 --prompt 'A slow aerial move over a valley' --return-last-frame"
  )
  .option("--image <path|url...>", "Reference images — local file paths or URLs (up to 30, optional)")
  .option("--video <url...>", "Optional reference videos — hosted URLs only (up to 10 total with --extend-video)")
  .option("--audio <url...>", "Optional reference audios — hosted URLs only (up to 10)")
  .option("--first-frame <path|url>", "First frame — local image path or URL")
  .option("--last-frame <path|url>", "Last frame — local image path or URL; requires --first-frame")
  .option("--extend-video <url>", "Video to extend — hosted URL only")
  .option("--extend-direction <direction>", "Extension direction: forward or backward")
  .requiredOption("--prompt <text>", "Describe the desired video scene, motion, camera, and audio")
  .option("--model <name>", "Seedance 2.5 model (default: Seedance_25)")
  .option("--duration <time>", "Video duration: -1 or 4s-30s (default: 4s)")
  .option("--aspect-ratio <ratio>", "Output aspect ratio, including adaptive (default: 3:4)")
  .option("--resolution <resolution>", "Output resolution: 480p, 720p, or 1080p (default: 720p)")
  .option("--output-format <format>", "Output format: mp4 or mov (default: mp4)")
  .option("--return-last-frame", "Request the generated video's final-frame image URL (best effort)")
  .option("--generate-audio <bool>", "Generate native audio: true (default) or false")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const imageList: string[] | undefined = opts.image;
    const videos: string[] | undefined = opts.video;
    const audios: string[] | undefined = opts.audio;
    if (opts.lastFrame && !opts.firstFrame) throw new Error("--last-frame requires --first-frame");
    if (opts.firstFrame && (imageList?.length || videos?.length || audios?.length || opts.extendVideo)) {
      throw new Error("--first-frame cannot be combined with reference media or --extend-video");
    }
    if (opts.extendVideo && !/^https?:\/\//.test(opts.extendVideo)) throw new Error("--extend-video must be a hosted URL");
    if (videos?.some((video) => !/^https?:\/\//.test(video))) throw new Error("--video values must be hosted URLs");
    if (audios?.some((audio) => !/^https?:\/\//.test(audio))) throw new Error("--audio values must be hosted URLs");
    if (opts.extendVideo && !["forward", "backward"].includes(opts.extendDirection)) {
      throw new Error("--extend-direction must be forward or backward when --extend-video is set");
    }
    if (opts.resolution && !["480p", "720p", "1080p"].includes(opts.resolution)) throw new Error("--resolution must be 480p, 720p, or 1080p");
    if (opts.outputFormat && !["mp4", "mov"].includes(opts.outputFormat)) throw new Error("--output-format must be mp4 or mov");
    if (opts.duration && opts.duration !== "-1" && !/^([4-9]|[12][0-9]|30)s$/.test(opts.duration)) throw new Error("--duration must be -1 or 4s-30s");
    if (opts.aspectRatio && !["21:9", "16:9", "4:3", "1:1", "3:4", "9:16", "adaptive"].includes(opts.aspectRatio)) throw new Error("invalid --aspect-ratio");

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
    if ((imageList?.length ?? 0) + (videos?.length ?? 0) + (audios?.length ?? 0) > 50) {
      throw new Error("Maximum 50 reference media items allowed");
    }

    const referenceVideos = [...(videos ?? [])];
    if (opts.extendVideo) {
      const nonExtendVideos = referenceVideos.filter((video) => video !== opts.extendVideo);
      referenceVideos.splice(0, referenceVideos.length, ...nonExtendVideos);
      referenceVideos.unshift(opts.extendVideo);
    }
    if (referenceVideos.length > 10) throw new Error("Maximum 10 videos allowed, including --extend-video");

    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      modelName: opts.model ?? "Seedance_25",
      duration: opts.duration ?? "4s",
      aspectRatio: opts.aspectRatio ?? "3:4",
      generateAudio: opts.generateAudio ?? "true",
    };
    if (opts.firstFrame) params.firstFrame = (await resolveImage(opts.firstFrame)).url;
    if (opts.lastFrame) params.lastFrame = (await resolveImage(opts.lastFrame)).url;
    if (opts.extendVideo) {
      params.extendVideo = opts.extendVideo;
      params.extendDirection = opts.extendDirection;
    }
    if (opts.resolution) params.resolution = opts.resolution;
    if (opts.outputFormat) params.outputFormat = opts.outputFormat;
    if (opts.returnLastFrame) params.returnLastFrame = true;
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun(
      "seedance-25",
      "v1.0",
      {
        images: imageList,
        videos: referenceVideos.length ? referenceVideos : undefined,
        audios: audios?.length ? audios : undefined,
        wait: opts.wait,
      },
      params,
      extraInput
    );
  });
