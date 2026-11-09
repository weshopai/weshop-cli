import { Command } from "commander";
import { executeRun } from "../run-helper.js";
import { resolveImage } from "../client.js";
import { durationInRange, hostedUrls, requireOption } from "../video-options.js";

const REFERENCE = "Kling_4_0_Reference", I2V = "Kling_4_0_I2V";
export const klingCmd = new Command("kling")
  .summary("Kling video generation — legacy first/last frames, or explicit Kling 4.0 reference and keyframe modes")
  .description(
    "Generate videos with Kling. CLI default remains Kling_3_0, 5s; Web defaults to Kling 4.0 Reference.\n\n" +
    "Legacy --image: 1-2 images, first frame then last frame; Kling_2_1_Master accepts only the first.\n" +
    "Models: Kling_3_0 (default), Kling_2_6, Kling_2_5_Turbo, Kling_2_1_Master, Kling_2_1, Kling_4_0_Reference, Kling_4_0_I2V.\n" +
    "Kling 4.0: 3s-30s (default 10s), 720p/1080p (default 1080p).\n" +
    "Reference: text only, up to 10 reference images and 5 hosted reference videos. Images are references, not first frames.\n" +
    "I2V: text only, or --image first [last], or explicit --first-frame/--last-frame; up to 10 images total including middle frames. No video references.\n" +
    "--middle-frames is a JSON array of {url, id?}; image paths are uploaded automatically. Do not combine --image with explicit first/last frames.\n" +
    "Kling 4.0 does not accept --generate-audio. Keyframes determine aspect ratio; omit --aspect-ratio or use adaptive for I2V with frames.\n" +
    "Legacy audio is supported for Kling_3_0 and Kling_2_6. Results use the existing video output format.\n\n" +
    "Examples:\n" +
    "  weshop kling --image ./first.png --prompt 'Slow camera pan'\n" +
    "  weshop kling --model Kling_4_0_Reference --image ./subject.png --prompt 'Keep the subject walking' --resolution 720p\n" +
    "  weshop kling --model Kling_4_0_I2V --first-frame ./first.png --last-frame ./last.png --middle-frames '[{\"url\":\"./middle.png\",\"id\":\"middle\"}]' --prompt 'Smooth transition'"
  )
  .option("--image <path|url...>", "Legacy/I2V first and optional last frame; 4.0 Reference: up to 10 references")
  .option("--video <url...>", "Hosted reference videos (Kling 4.0 Reference only, up to 5)")
  .option("--first-frame <path|url>", "Explicit first frame (Kling 4.0 I2V)")
  .option("--last-frame <path|url>", "Explicit last frame (Kling 4.0 I2V)")
  .option("--middle-frames <json>", "JSON array of {url, id?} intermediate frames (Kling 4.0 I2V)")
  .requiredOption("--prompt <text>", "Describe the desired motion or scene")
  .option("--model <name>", "Kling model (CLI default: Kling_3_0)")
  .option("--duration <time>", "Legacy default 5s; Kling 4.0 default 10s")
  .option("--resolution <size>", "Kling 4.0: 720p or 1080p (default)")
  .option("--aspect-ratio <ratio>", "Kling 4.0: auto by endpoint when omitted; keyframes determine ratio")
  .option("--generate-audio <bool>", "Legacy Kling_3_0/Kling_2_6 audio: true or false")
  .option("--batch <count>", "Number of videos, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return after submission; query with weshop status")
  .action(async (opts) => {
    const model = opts.model ?? "Kling_3_0";
    const is4 = model === REFERENCE || model === I2V;
    const images: string[] = opts.image ?? [];
    const videos: string[] = opts.video ?? [];
    const params: Record<string, unknown> = { textDescription: opts.prompt, modelName: model, duration: opts.duration ?? (is4 ? "10s" : "5s"), batchCount: opts.batch };
    if (!is4) {
      // Keep historical validation and flags for legacy models.
      requireOption(images.length >= 1 && images.length <= 2, "Legacy Kling requires 1-2 images (first and optional last frame)");
      requireOption(!(images.length === 2 && model === "Kling_2_1_Master"), "Kling_2_1_Master does not support a last frame");
      requireOption(!videos.length && !opts.firstFrame && !opts.lastFrame && opts.middleFrames === undefined && opts.resolution === undefined && opts.aspectRatio === undefined, "New video controls require a Kling 4.0 model");
      if (opts.generateAudio !== undefined) params.generateAudio = opts.generateAudio;
    } else {
      durationInRange(String(params.duration), 3, 30);
      requireOption(["720p", "1080p"].includes(opts.resolution ?? "1080p"), "Kling 4.0 resolution must be 720p or 1080p");
      requireOption(opts.generateAudio === undefined, "Kling 4.0 does not support --generate-audio");
      hostedUrls(videos, "--video");
      let ascii = 0, other = 0;
      for (const character of Array.from(opts.prompt as string)) {
        if (character.codePointAt(0)! <= 127) ascii++; else other++;
      }
      requireOption(ascii / 26000 + other / 11000 <= 1, "Kling 4.0 prompt exceeds character limit");
      let middle: { url: string; id?: string }[] = [];
      if (opts.middleFrames !== undefined) {
        try { middle = JSON.parse(opts.middleFrames); } catch { requireOption(false, "--middle-frames must be a JSON array of {url, id?}"); }
        requireOption(Array.isArray(middle) && middle.every(f => f && typeof f === "object" && typeof f.url === "string" && f.url.trim() !== "" && (f.id === undefined || typeof f.id === "string")), "--middle-frames must be a JSON array of {url, id?}");
      }
      if (model === REFERENCE) {
        requireOption(opts.prompt.trim().length > 0, "Kling 4.0 Reference prompt is required");
        requireOption(!opts.firstFrame && !opts.lastFrame && middle.length === 0, "Reference does not accept keyframes; select Kling_4_0_I2V");
        requireOption(images.length <= 10 && videos.length <= 5, "Reference supports at most 10 images and 5 videos");
        const ratios = ["16:9", "9:16", "1:1", "21:9", ...(images.length || videos.length ? ["adaptive"] : [])];
        requireOption(opts.aspectRatio === undefined || ratios.includes(opts.aspectRatio), "Invalid aspect ratio for Kling 4.0 Reference");
      } else {
        requireOption(videos.length === 0, "Kling 4.0 I2V does not accept videos");
        requireOption(!(images.length && (opts.firstFrame || opts.lastFrame)), "Do not combine --image with explicit first/last frames");
        requireOption(images.length <= 2 && images.length + middle.length + Number(!!opts.firstFrame) + Number(!!opts.lastFrame) <= 10, "I2V supports first/last images and at most 10 total keyframes");
        const hasFrames = images.length || middle.length || opts.firstFrame || opts.lastFrame;
        requireOption(!!hasFrames || opts.prompt.trim().length > 0, "Kling 4.0 text-only prompt is required");
        const ratios = hasFrames ? ["adaptive", ""] : ["16:9", "9:16", "1:1", "21:9"];
        requireOption(opts.aspectRatio === undefined || ratios.includes(opts.aspectRatio), "Keyframes determine the I2V aspect ratio; omit it or use adaptive");
        const ids = middle.map(f => f.id).filter(Boolean);
        requireOption(new Set(ids).size === ids.length, "Duplicate middle-frame IDs");
      }
      // Validate everything before uploading local assets.
      params.resolution = opts.resolution ?? "1080p";
      if (opts.aspectRatio !== undefined) params.aspectRatio = opts.aspectRatio;
      if (opts.firstFrame) params.firstFrame = (await resolveImage(opts.firstFrame)).url;
      if (opts.lastFrame) params.lastFrame = (await resolveImage(opts.lastFrame)).url;
      if (opts.middleFrames !== undefined) params.middleFrames = await Promise.all(middle.map(async f => ({ ...f, url: (await resolveImage(f.url)).url })));
    }
    await executeRun("kling", "v1.0", { images, videos, wait: opts.wait }, params, opts.taskName ? { taskName: opts.taskName } : {});
  });
