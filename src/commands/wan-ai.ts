import { Command } from "commander";
import { executeRun } from "../run-helper.js";
import { durationInRange, hostedUrls, requireOption } from "../video-options.js";

export const wanAiCmd = new Command("wan-ai")
  .summary("Wan video generation — legacy Wan 2.5 or explicit Wan 3.0 Reference/I2V")
  .description(
    "CLI default stays Wan 2.5: one image, 5s, with the historical request format.\n" +
    "Select --model Wan_3_0_Reference for text or up to 10 image, 5 video and 5 audio references (20 total).\n" +
    "Select --model Wan_3_0_I2V for 1-2 images: first frame, then optional last frame; no video/audio references.\n" +
    "Wan 3.0: 2s-30s (default 5s), 480P/720P/1080P (default 720P), adaptive aspect ratio (default), generated audio true (default).\n" +
    "I2V aspect ratio must be adaptive; Reference also supports 16:9, 4:3, 1:1, 3:4, 9:16.\n" +
    "Videos/audio must be hosted URLs; each reference clip is 1-15s, each media type totals at most 15s, and input video + output totals at most 30s (checked by server).\n\n" +
    "Examples:\n" +
    "  weshop wan-ai --image ./scene.png --prompt 'Ocean waves'\n" +
    "  weshop wan-ai --model Wan_3_0_Reference --prompt 'A cinematic ocean scene' --duration 10s\n" +
    "  weshop wan-ai --model Wan_3_0_I2V --image ./first.png ./last.png --prompt 'Smooth transition' --resolution 1080P"
  )
  .option("--image <path|url...>", "Legacy: one image; Reference: up to 10; I2V: first and optional last frame")
  .option("--video <url...>", "Hosted reference videos (Wan 3.0 Reference only, up to 5)")
  .option("--audio <url...>", "Hosted reference audio (Wan 3.0 Reference only, up to 5)")
  .requiredOption("--prompt <text>", "Describe the video scene")
  .option("--model <name>", "Wan_2_5 (default), Wan_3_0_Reference, or Wan_3_0_I2V")
  .option("--duration <time>", "Legacy: 3s-8s; Wan 3.0: 2s-30s (default: 5s)")
  .option("--resolution <size>", "Wan 3.0: 480P, 720P (default), 1080P")
  .option("--aspect-ratio <ratio>", "Wan 3.0 output ratio (default: adaptive)")
  .option("--generate-audio <bool>", "Wan 3.0 generated audio: true (default), false")
  .option("--batch <count>", "Number of videos, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return after submission; query with weshop status")
  .action(async opts => {
    const model = opts.model ?? "Wan_2_5", images: string[] = opts.image ?? [];
    const videos: string[] = opts.video ?? [], audios: string[] = opts.audio ?? [];
    requireOption(["Wan_2_5", "Wan_3_0_Reference", "Wan_3_0_I2V"].includes(model), "Unsupported Wan model");
    const is3 = model !== "Wan_2_5";
    const params: Record<string, unknown> = { textDescription: opts.prompt, duration: opts.duration ?? "5s", batchCount: opts.batch };
    if (!is3) {
      requireOption(images.length === 1, "Wan 2.5 requires exactly one image");
      requireOption(!videos.length && !audios.length && opts.resolution === undefined && opts.aspectRatio === undefined && opts.generateAudio === undefined, "New video controls require Wan 3.0");
      if (opts.model) params.modelName = model;
    } else {
      durationInRange(String(params.duration), 2, 30);
      const resolution = (opts.resolution ?? "720P").toUpperCase();
      const ratio = opts.aspectRatio ?? "adaptive", audio = opts.generateAudio ?? "true";
      requireOption(["480P", "720P", "1080P"].includes(resolution), "Wan 3.0 resolution must be 480P, 720P, or 1080P");
      requireOption(["true", "false"].includes(audio), "--generate-audio must be true or false");
      requireOption(["adaptive", "16:9", "4:3", "1:1", "3:4", "9:16"].includes(ratio), "Unsupported Wan aspect ratio");
      hostedUrls(videos, "--video"); hostedUrls(audios, "--audio");
      requireOption(opts.prompt.trim().length > 0 && Array.from(opts.prompt).length <= 20000, "Wan 3.0 prompt must contain 1-20000 characters");
      if (model === "Wan_3_0_I2V") {
        requireOption(images.length >= 1 && images.length <= 2 && !videos.length && !audios.length, "Wan 3.0 I2V requires 1-2 images and no video/audio references");
        requireOption(ratio === "adaptive", "Wan 3.0 I2V requires adaptive aspect ratio");
      } else requireOption(images.length <= 10 && videos.length <= 5 && audios.length <= 5 && images.length + videos.length + audios.length <= 20, "Wan Reference supports 10 images, 5 videos, 5 audios and 20 total references");
      Object.assign(params, { modelName: model, resolution, aspectRatio: ratio, generateAudio: audio });
    }
    // Preserve the legacy single-image path and its request shape.
    await executeRun("wan-ai", "v1.0", is3 ? { images, videos, audios, wait: opts.wait } : { image: images[0], wait: opts.wait }, params, opts.taskName ? { taskName: opts.taskName } : {});
  });
