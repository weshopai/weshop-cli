import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT = "Convert the uploaded 2d image into a 3d image based on the user instructions.";

export const twoDTo3dImageConverterCmd = new Command("2d-to-3d-image-converter")
  .summary("AI 2D to 3D image converter — transform a flat 2D image into a 3D rendered version")
  .description(
    "Convert a 2D image into a 3D rendered version using AI.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop 2d-to-3d-image-converter --image ./drawing.png\n" +
    "  weshop 2d-to-3d-image-converter --image ./sketch.png --prompt 'Convert to 3D with realistic lighting and depth'\n" +
    "  weshop 2d-to-3d-image-converter --image ./flat-art.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input 2D image — local file path or URL")
  .option("--prompt <text>", "Custom 3D conversion instruction")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const { url: imageUrl } = await resolveImage(opts.image);
      const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT, images: [imageUrl] };
      if (opts.batch != null) params.batchCount = opts.batch;
      const input: Record<string, unknown> = { originalImage: imageUrl };
      if (opts.taskName) input.taskName = opts.taskName;
      const body: RunRequest = { agent: { name: "2d-to-3d-image-converter", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
