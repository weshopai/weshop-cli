import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "The person in Figure 1 is wearing the clothes shown in Figure 2";

export const aiClothesChangerCmd = new Command("ai-clothes-changer")
  .summary("AI clothes changer — dress a person (image 1) in the garment shown in another photo (image 2)")
  .description(
    "Change the clothes on a person by providing two images:\n" +
    "  image 1 (--image, first): the person to dress\n" +
    "  image 2 (--image, second): the garment or outfit to apply\n\n" +
    "Requires exactly 2 images. Reference them in your prompt as 'image 1' and 'image 2'.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop ai-clothes-changer --image ./person.png --image ./garment.png\n" +
    "  weshop ai-clothes-changer --image ./model.png --image ./dress.png --prompt 'The person in image 1 wearing the dress from image 2'\n" +
    "  weshop ai-clothes-changer --image ./person.png --image ./outfit.png --batch 2"
  )
  .requiredOption("--image <path|url...>", "Two images: person (image 1) and garment (image 2) — local file paths or URLs")
  .option("--prompt <text>", "Custom clothing instruction (default: person in image 1 wears clothes from image 2)")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const imageList: string[] = opts.image;
    if (imageList.length !== 2) {
      console.error("[error]\n  message: Exactly 2 images required: person (image 1) and garment (image 2)");
      process.exit(1);
    }
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("ai-clothes-changer", "v1.0", { images: imageList, wait: opts.wait }, params, extraInput);
  });
