import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "naturally undress and change the outfit into a thin bikini while keeping body proportions natural. Keep Model dancing tiktok dance.";

export const aiBikiniVideoCmd = new Command("ai-bikini-video")
  .summary("AI bikini video generator — generate a bikini dance video from a person photo")
  .description(
    "Generate a short video of a person in a bikini from a portrait or full-body photo.\n" +
    "Results come back as video URLs in video[N].url.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop ai-bikini-video --image ./person.png\n" +
    "  weshop ai-bikini-video --image ./person.png --prompt 'Bikini model dancing on a beach'\n" +
    "  weshop ai-bikini-video --image ./person.png --no-wait"
  )
  .requiredOption("--image <path|url>", "Input person photo — local file path or URL")
  .option("--prompt <text>", "Custom bikini video instruction")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
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
      const body: RunRequest = { agent: { name: "ai-bikini-video", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
