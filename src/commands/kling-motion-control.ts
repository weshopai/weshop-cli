import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const klingMotionControlCmd = new Command("kling-motion-control")
  .summary("Kling Motion Control — transfer motion from a reference video onto a character image")
  .description(
    "Transfer motion from a reference video onto a character image using Kling Motion Control.\n\n" +
    "Inputs:\n" +
    "  --image  Character still (local file path or URL)\n" +
    "  --video  Motion reference clip (hosted URL only; local video files are not auto-uploaded)\n\n" +
    "Optional --prompt refines background, lighting, or styling while preserving motion.\n" +
    "Results come back in video[N].url.\n\n" +
    "Examples:\n" +
    "  weshop kling-motion-control --image ./character.png --video https://example.com/dance.mp4\n" +
    "  weshop kling-motion-control --image ./avatar.png --video https://example.com/motion.mp4 --prompt 'Neon city background at night'"
  )
  .requiredOption("--video <url>", "Motion reference video URL")
  .requiredOption("--image <path|url>", "Character image — local file path or URL")
  .option("--prompt <text>", "Optional refinement for background, style, or scene details")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {};
    if (opts.prompt) params.textDescription = opts.prompt;
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun(
      "kling-motion-control",
      "v1.0",
      { image: opts.image, videos: [opts.video], wait: opts.wait },
      params,
      extraInput
    );
  });
