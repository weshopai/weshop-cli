import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "Please don't change any elements that I provide. Generate a chaotic and creative multi-media collage with a completely randomized aesthetic. Combine a wide array of contrasting elements: vintage magazine cutouts, neon-colored glitch art, 19th-century botanical illustrations, and sharp vector geometric shapes. The composition should be an experimental mix of textures—including torn glossy paper, rough cardboard, transparent celluloid film, and metallic foil. Incorporate a clashing color palette that shifts randomly across the canvas. Features an unpredictable focal point, layered with 3D drop shadows to create a sense of physical depth. High resolution, maximalist detail, eclectic and avant-garde style.";

export const aiGroupPhotoGeneratorCmd = new Command("ai-group-photo-generator")
  .summary("AI group photo generator — create a creative group photo or collage from up to 10 images")
  .description(
    "Generate a creative group photo or multi-media collage from up to 10 reference images.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    "  Chaotic avant-garde collage mixing vintage cutouts, neon glitch art, botanical\n" +
    "  illustrations, and geometric shapes with mixed textures.\n\n" +
    "Examples:\n" +
    "  weshop ai-group-photo-generator --image ./photo1.png --image ./photo2.png --image ./photo3.png\n" +
    "  weshop ai-group-photo-generator --image ./a.png --image ./b.png --prompt 'Natural group photo on a beach'\n" +
    "  weshop ai-group-photo-generator --image ./img1.png --image ./img2.png --batch 2"
  )
  .requiredOption("--image <path|url...>", "Reference images — local file paths or URLs (up to 10)")
  .option("--prompt <text>", "Custom group photo or collage style instruction")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const imageList: string[] = opts.image;
    if (imageList.length > 10) { console.error("[error]\n  message: Maximum 10 images allowed"); process.exit(1); }
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("ai-group-photo-generator", "v1.0", { images: imageList, wait: opts.wait }, params, extraInput);
  });
