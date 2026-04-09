import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "A screenshot of a 3D modeling software interface, showing the Blender viewport. At the center of the scene is a highly realistic 3D model of the main subject of this image in full and realistic rendering, with no visible topology or wireframe. The model is placed on a gray 3D grid ground with an infinite horizon. The software UI toolbars are visible along the side, a coordinate axis widget appears in the corner, the viewport is in solid shading mode, and the overall scene represents a 3D asset design workspace. 4k resolution and ratio.";

export const ai3dRenderingCmd = new Command("ai-3d-rendering")
  .summary("AI 3D rendering — transform a photo into a Blender-style 3D model viewport screenshot")
  .description(
    "Transform any photo into a realistic 3D model displayed in a Blender viewport interface,\n" +
    "complete with software UI, grid ground, and coordinate axis widget.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    "  Blender viewport screenshot with a realistic 3D model of the subject, gray grid ground,\n" +
    "  software UI toolbars, solid shading mode, 4K resolution.\n\n" +
    "Examples:\n" +
    "  weshop ai-3d-rendering --image ./object.png\n" +
    "  weshop ai-3d-rendering --image ./car.png --prompt 'Blender 3D model of the car, wireframe mode'\n" +
    "  weshop ai-3d-rendering --image ./character.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input image — local file path or URL")
  .option("--prompt <text>", "Custom 3D rendering instruction")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("ai-3d-rendering", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
