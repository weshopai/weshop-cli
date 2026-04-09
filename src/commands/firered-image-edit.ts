import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const fireredImageEditCmd = new Command("firered-image-edit")
  .summary("FireRed image editor — edit or generate images with high fidelity using FireRed open-source model")
  .description(
    "Edit or generate images using the FireRed open-source AI model.\n" +
    "Supports up to 3 reference images. Images are optional.\n\n" +
    "Aspect ratio (--aspect-ratio):\n" +
    "  auto (default), 1:1, 2:3, 3:2, 4:3, 3:4, 16:9, 9:16\n\n" +
    "Examples:\n" +
    "  weshop firered-image-edit --prompt 'A photorealistic portrait of a woman in a garden'\n" +
    "  weshop firered-image-edit --image ./photo.png --prompt 'Change the background to a snowy mountain'\n" +
    "  weshop firered-image-edit --image ./a.png --image ./b.png --prompt 'Combine these two scenes' --aspect-ratio 16:9"
  )
  .option("--image <path|url...>", "Reference images — local file paths or URLs (up to 3, optional)")
  .requiredOption("--prompt <text>", "Describe the desired edit or generation")
  .option("--aspect-ratio <ratio>", "Output aspect ratio: auto (default), 1:1, 2:3, 3:2, 4:3, 3:4, 16:9, 9:16")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const imageList: string[] | undefined = opts.image;
    if (imageList && imageList.length > 3) {
      console.error("[error]\n  message: Maximum 3 images allowed");
      process.exit(1);
    }

    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      aspectRatio: opts.aspectRatio ?? "auto",
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("firered-image-edit", "v1.0", { images: imageList, wait: opts.wait }, params, extraInput);
  });
