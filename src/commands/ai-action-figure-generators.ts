import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "A commercially available figure of the character from the illustration is produced in 1/ scale, featuring a realistic style and environment. The figure is displayed on a computer desk with a round, clear acrylic base devoid of any text. The ZBrush modeling process of the figure is shown on the computer screen. Beside the computer screen, a BANDAl-style toy box printed with the original illustration is positioned";

export const aiActionFigureGeneratorsCmd = new Command("ai-action-figure-generators")
  .summary("AI action figure generator — turn a photo or character into a collectible action figure display")
  .description(
    "Transform a photo or character illustration into a collectible action figure display\n" +
    "with a BANDAI-style toy box and ZBrush modeling screen. Image is optional.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    "  1/scale figure on a computer desk with acrylic base, ZBrush screen, BANDAI-style box.\n\n" +
    "Examples:\n" +
    "  weshop ai-action-figure-generators --image ./character.png\n" +
    "  weshop ai-action-figure-generators --image ./person.png --prompt 'Action figure in superhero pose, Marvel style box'\n" +
    "  weshop ai-action-figure-generators --batch 2"
  )
  .option("--image <path|url>", "Reference character or person image — local file path or URL (optional)")
  .option("--prompt <text>", "Custom action figure description")
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
      const body: RunRequest = { agent: { name: "ai-action-figure-generators", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
