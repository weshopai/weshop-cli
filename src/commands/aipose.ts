import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const aiposeCmd = new Command("aipose")
  .summary("Change the human pose in a photo while keeping the garment unchanged")
  .description(
    "Change the human pose in a photo while keeping the garment unchanged.\n\n" +
    "Generation version (--gen-version):\n" +
    "  lite   Faster, lighter quality (default)\n" +
    "  pro    Higher quality, slower\n\n" +
    "Examples:\n" +
    "  weshop aipose --image ./model.png --prompt 'standing with hands on hips, facing camera'\n" +
    "  weshop aipose --image ./model.png --prompt 'walking pose, looking left' --gen-version pro --batch 2"
  )
  .requiredOption("--image <path|url>", "Source image — local file path or public URL (local files are auto-uploaded)")
  .requiredOption("--prompt <text>", "Pose instruction describing the desired pose")
  .option("--gen-version <ver>", "Generation quality: lite (default) or pro")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 4)", parseInt)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
    };
    if (opts.genVersion) params.generateVersion = opts.genVersion;
    if (opts.batch) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("aipose", "v1.0", opts, params, extraInput);
  });
