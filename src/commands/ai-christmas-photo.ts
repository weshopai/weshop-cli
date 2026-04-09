import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "Create a Christmas-themed portrait photo based on the provided image. The overall scene should convey a festive Christmas party atmosphere, incorporating classic Christmas decorative elements such as gift boxes, bells, apples, and snowmen. Must include a decorated Christmas tree with hanging ornaments, a small teddy bear plush placed nearby, and a large Santa Claus plush toy positioned in the background. In the foreground, golden confetti and falling snow should be visible, featuring motion blur effects to enhance the sense of movement and festivity. The photography style should use direct on-camera flash, creating a bold, frontal lighting effect. The overall aesthetic should evoke a vintage film look with subtle Y2K influences, featuring visible film grain and noise texture. Emphasize catchlights in the eyes as much as possible. The primary color palette should consist of vivid red, green, and white, with optional dark blue accents. The background vary between a white wall, a photo studio, a deep night sky filled with stars, or others as long as it aligns with a Christmas theme. The shot type can be randomly chosen between medium shot, full-body shot, or close-up. For wardrobe styling, select Christmas-themed outfits, such as Christmas sweaters, Santa hats, red scarves, or winter attire. The original facial details and body proportions of the subject must be strictly preserved.";

export const aiChristmasPhotoCmd = new Command("ai-christmas-photo")
  .summary("AI Christmas photo generator — transform a portrait into a festive Christmas scene")
  .description(
    "Transform a portrait photo into a festive Christmas-themed scene with decorations,\n" +
    "holiday outfits, and cinematic Y2K film aesthetics.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    "  Festive Christmas party scene with tree, ornaments, Santa plush, golden confetti,\n" +
    "  falling snow, vintage film look, preserving original face and body proportions.\n\n" +
    "Examples:\n" +
    "  weshop ai-christmas-photo --image ./person.png\n" +
    "  weshop ai-christmas-photo --image ./person.png --prompt 'Cozy Christmas morning scene by the fireplace'\n" +
    "  weshop ai-christmas-photo --image ./person.png --batch 4"
  )
  .requiredOption("--image <path|url>", "Input portrait image — local file path or URL")
  .option("--prompt <text>", "Custom Christmas scene instruction")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const { url: imageUrl } = await resolveImage(opts.image);
      const params: Record<string, unknown> = {
        textDescription: opts.prompt ?? DEFAULT_PROMPT,
        images: [imageUrl],
      };
      if (opts.batch != null) params.batchCount = opts.batch;
      const input: Record<string, unknown> = { originalImage: imageUrl };
      if (opts.taskName) input.taskName = opts.taskName;
      const body: RunRequest = { agent: { name: "ai-christmas-photo", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) {
        printPollResult(await waitForCompletion(executionId));
      } else {
        console.log("[info]");
        console.log(`  message: Use 'weshop status ${executionId}' to check progress`);
      }
    } catch (err) { printError(err); process.exit(1); }
  });
