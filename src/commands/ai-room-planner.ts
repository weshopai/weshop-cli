import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "Identify the room type, layout, key furniture objects, clutter, and windows from the source. Redesign the room  in [modern style] without changing major decoration. Keep room structure and window position. Implement a clean, integrated modern palette.";

export const aiRoomPlannerCmd = new Command("ai-room-planner")
  .summary("AI room planner — redesign a room photo with a new interior design style")
  .description(
    "Redesign a room photo with a new interior design style while preserving the room\n" +
    "structure and window positions. Image is optional.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    "  Modern style redesign, clean integrated palette, preserving structure and windows.\n\n" +
    "Examples:\n" +
    "  weshop ai-room-planner --image ./room.png\n" +
    "  weshop ai-room-planner --image ./living-room.png --prompt 'Scandinavian minimalist style, white and wood tones'\n" +
    "  weshop ai-room-planner --image ./bedroom.png --batch 4"
  )
  .option("--image <path|url>", "Input room photo — local file path or URL (optional)")
  .option("--prompt <text>", "Describe the desired interior design style")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
      if (opts.batch != null) params.batchCount = opts.batch;
      const input: Record<string, unknown> = {};
      if (opts.taskName) input.taskName = opts.taskName;
      if (opts.image) {
        const { url: imageUrl } = await resolveImage(opts.image);
        params.images = [imageUrl];
        input.originalImage = imageUrl;
      }
      const body: RunRequest = { agent: { name: "ai-room-planner", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
