import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "You are a professional landscape designer. Your task is to create a new [Modern style] landscape design for this yard. You need to retain the materials and core structure of the yard while upgrading the landscape to make it modern, beautiful, and practical.  *If image2 exists, you should integrate the style of image2.";

export const aiLandscapeDesignFreeCmd = new Command("ai-landscape-design-free")
  .summary("AI landscape designer — redesign a yard or outdoor space with a new landscape style")
  .description(
    "Redesign a yard or outdoor space with a new landscape style. Supports up to 2 images:\n" +
    "  image 1: the yard to redesign\n" +
    "  image 2 (optional): a style reference image\n\n" +
    "Images are optional — text-only generation is supported.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    "  Modern landscape design, retaining core structure, integrating style from image 2 if provided.\n\n" +
    "Examples:\n" +
    "  weshop ai-landscape-design-free --image ./yard.png\n" +
    "  weshop ai-landscape-design-free --image ./yard.png --image ./style-ref.png --prompt 'Japanese zen garden style'\n" +
    "  weshop ai-landscape-design-free --image ./garden.png --batch 4"
  )
  .option("--image <path|url...>", "Yard photo and optional style reference — local file paths or URLs (up to 2)")
  .option("--prompt <text>", "Describe the desired landscape style")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    if (opts.image && opts.image.length > 0) {
      const imageList: string[] = opts.image;
      if (imageList.length > 2) { console.error("[error]\n  message: Maximum 2 images allowed"); process.exit(1); }
      await executeRun("ai-landscape-design-free", "v1.0", { images: imageList, wait: opts.wait }, params, extraInput);
    } else {
      await executeRun("ai-landscape-design-free", "v1.0", { wait: opts.wait }, params, extraInput);
    }
  });
