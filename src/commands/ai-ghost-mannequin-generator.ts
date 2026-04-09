import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  'Transform the clothing from the image into a professional "ghost mannequin" photography effect. Remove the original model or body completely. The garment should appear hollow and three-dimensional, retaining the shape as if worn by an invisible form. Clearly show the inside of the neck opening, cuffs, and hem, revealing the inner fabric texture and labels. The clothing is floating against a clean, pure white studio background. Soft studio lighting emphasizes fabric folds and texture.';

export const aiGhostMannequinGeneratorCmd = new Command("ai-ghost-mannequin-generator")
  .summary("AI ghost mannequin generator — create a professional ghost mannequin effect from a clothing photo")
  .description(
    "Transform a clothing photo into a professional ghost mannequin effect — the garment\n" +
    "appears hollow and 3D as if worn by an invisible form, on a white studio background.\n\n" +
    "Aspect ratio (--aspect-ratio):\n" +
    "  auto, 1:1, 2:3, 3:2, 4:3, 3:4, 16:9, 9:16, 21:9  (default: 1:1)\n\n" +
    "Image size (--image-size):\n" +
    "  1K (default), 2K, 4K\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    "  Ghost mannequin effect, hollow 3D garment, white studio background, fabric texture visible.\n\n" +
    "Examples:\n" +
    "  weshop ai-ghost-mannequin-generator --image ./shirt.png\n" +
    "  weshop ai-ghost-mannequin-generator --image ./jacket.png --aspect-ratio 3:4 --image-size 2K\n" +
    "  weshop ai-ghost-mannequin-generator --image ./dress.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input clothing photo — local file path or URL")
  .option("--prompt <text>", "Custom ghost mannequin instruction")
  .option("--aspect-ratio <ratio>", "Output aspect ratio: auto, 1:1, 2:3, 3:2, 4:3, 3:4, 16:9, 9:16, 21:9 (default: 1:1)")
  .option("--image-size <size>", "Output resolution: 1K (default), 2K, or 4K")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      textDescription: opts.prompt ?? DEFAULT_PROMPT,
      aspectRatio: opts.aspectRatio ?? "1:1",
      imageSize: opts.imageSize ?? "1K",
    };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("ai-ghost-mannequin-generator", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
