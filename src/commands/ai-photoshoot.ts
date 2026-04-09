import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const aiPhotoshootCmd = new Command("ai-photoshoot")
  .summary("AI photoshoot — generate a professional photoshoot by combining a character photo and a reference scene")
  .description(
    "Generate a professional photoshoot by combining two images:\n" +
    "  image 1 (--image, first):  the character/person photo\n" +
    "  image 2 (--image, second): the reference scene or style image\n\n" +
    "Both images are required. The AI describes the scene from image 2, then generates\n" +
    "a new image placing the person from image 1 into that scene.\n\n" +
    "Use --prompt to add specific instructions (e.g. 'black sunglasses', 'red hair',\n" +
    "'sitting on the couch'). Without a prompt, the AI uses only the scene description.\n\n" +
    "Model (--model):\n" +
    "  qwen      Qwen model (default)\n" +
    "  firered   Firered model\n" +
    "  nano      Nano model — supports --image-size\n\n" +
    "Aspect ratio (--aspect-ratio):\n" +
    "  auto, 1:1, 2:3, 3:2, 4:3, 3:4, 16:9, 9:16  (default: auto)\n" +
    "  nano also supports: 21:9\n\n" +
    "Image size (--image-size, nano model only):\n" +
    "  1K (default), 2K, 4K\n\n" +
    "Examples:\n" +
    "  weshop ai-photoshoot --image ./person.png --image ./scene.png\n" +
    "  weshop ai-photoshoot --image ./person.png --image ./living-room.png --prompt 'Person sitting on the sofa, relaxed pose'\n" +
    "  weshop ai-photoshoot --image ./person.png --image ./reference.png --model firered --aspect-ratio 3:4\n" +
    "  weshop ai-photoshoot --image ./person.png --image ./style.png --model nano --image-size 2K --batch 2"
  )
  .requiredOption("--image <path|url...>", "Two images: character (image 1) and reference scene (image 2) — local file paths or URLs")
  .option("--prompt <text>", "Additional instructions for how the person should appear in the scene (e.g. 'sitting on the couch, wearing sunglasses')")
  .option("--model <name>", "Model to use: qwen (default), firered, or nano")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (default: auto)")
  .option("--image-size <size>", "Output resolution: 1K (default), 2K, or 4K (nano only)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const imageList: string[] = opts.image;
    if (imageList.length < 2) {
      console.error("[error]\n  message: ai-photoshoot requires exactly 2 images: character (image 1) and reference scene (image 2)");
      process.exit(1);
    }
    if (imageList.length > 2) {
      console.error("[error]\n  message: Maximum 2 images allowed for ai-photoshoot");
      process.exit(1);
    }
    const params: Record<string, unknown> = {
      modelName: opts.model ?? "qwen",
      aspectRatio: opts.aspectRatio ?? "auto",
    };
    if (opts.prompt) params.textDescription = opts.prompt;
    if (opts.imageSize) params.imageSize = opts.imageSize;
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("ai-photoshoot", "v1.0", { images: imageList, wait: opts.wait }, params, extraInput);
  });
