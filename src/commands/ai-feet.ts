import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "Low angle view of the subject's bare feet with no shoes, while subject sits in an chair. Foreground focus on the soles, background focus on the subject, keep original body proportion and reasonable posture.";

export const aiFeetCmd = new Command("ai-feet")
  .summary("AI feet generator — generate a realistic low-angle bare feet photo from a portrait")
  .description(
    "Generate a realistic low-angle bare feet photo from a portrait or full-body image.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop ai-feet --image ./person.png\n" +
    "  weshop ai-feet --image ./person.png --prompt 'Close-up of bare feet on a sandy beach'\n" +
    "  weshop ai-feet --image ./person.png --batch 2"
  )
  .requiredOption("--image <path|url>", "Input portrait or full-body image — local file path or URL")
  .option("--prompt <text>", "Custom feet scene instruction")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const { url: imageUrl } = await resolveImage(opts.image);
      const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT, images: [imageUrl] };
      if (opts.batch != null) params.batchCount = opts.batch;
      const input: Record<string, unknown> = { originalImage: imageUrl };
      if (opts.taskName) input.taskName = opts.taskName;
      const body: RunRequest = { agent: { name: "ai-feet", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
