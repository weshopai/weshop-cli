import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const klingO1Cmd = new Command("kling-O1")
  .summary("Kling O1 AI video generator — create cinematic videos with Omni One control via text, reference images, first/last frames, or a reference video")
  .description(
    "Create cinematic videos with Kling O1 (Omni One).\n" +
    "Results come back in video[N].url.\n\n" +
    "Model (--model):\n" +
    "  Kling_Video_O1_Ele  Reference mode (default) — text-only, or up to 4 reference images + 1 reference video\n" +
    "  Kling_Video_O1_I2V  Image to Video — image 1 = first frame, image 2 = optional last frame\n\n" +
    "When using multiple reference images, refer to them in the prompt as image 1, image 2, etc.\n" +
    "--video must be a hosted URL (local video upload is not supported).\n" +
    "Aspect ratio is used in Reference mode and is hidden when a reference video is provided.\n\n" +
    "Duration (--duration): 3s-10s (default: 5s)\n" +
    "Aspect ratio (--aspect-ratio): 9:16 (default), 16:9, 1:1\n\n" +
    "Examples:\n" +
    "  weshop kling-O1 --prompt 'Cinematic night drive through rain, neon reflections, tracking shot'\n" +
    "  weshop kling-O1 --image ./character.png --image ./outfit.png --prompt 'Keep image 1 identity wearing the outfit from image 2' --model Kling_Video_O1_Ele\n" +
    "  weshop kling-O1 --image ./first.png --image ./last.png --prompt 'Walk from the doorway to the window' --model Kling_Video_O1_I2V --duration 8s\n" +
    "  weshop kling-O1 --image ./char.png --video https://example.com/ref.mp4 --prompt 'Keep image 1 identity and follow the reference video motion'"
  )
  .option("--image <path|url...>", "Reference or frame images — local file paths or URLs (Ele: up to 4; I2V: 1–2)")
  .option("--video <url>", "Optional reference video — hosted URL only (Reference mode)")
  .requiredOption("--prompt <text>", "Describe the desired video, motion, or edit")
  .option("--model <name>", "Kling O1 mode: Kling_Video_O1_Ele (default) or Kling_Video_O1_I2V")
  .option("--duration <time>", "Video duration, 3s-10s (default: 5s)")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (default: 9:16)")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const modelName = opts.model ?? "Kling_Video_O1_Ele";
    const imageList: string[] = opts.image ?? [];

    if (modelName === "Kling_Video_O1_I2V") {
      if (imageList.length < 1 || imageList.length > 2) {
        console.error("[error]\n  message: Kling_Video_O1_I2V requires 1–2 images (image 1 = first frame, image 2 = last frame)");
        process.exit(1);
      }
      if (opts.video) {
        console.error("[error]\n  message: Kling_Video_O1_I2V does not support --video; use Kling_Video_O1_Ele for reference video");
        process.exit(1);
      }
    } else if (imageList.length > 4) {
      console.error("[error]\n  message: Maximum 4 images allowed in Reference mode");
      process.exit(1);
    }

    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      modelName,
      duration: opts.duration ?? "5s",
      aspectRatio: opts.aspectRatio ?? "9:16",
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun(
      "kling-O1",
      "v1.0",
      {
        images: imageList.length ? imageList : undefined,
        videos: opts.video ? [opts.video] : undefined,
        wait: opts.wait,
      },
      params,
      extraInput
    );
  });
