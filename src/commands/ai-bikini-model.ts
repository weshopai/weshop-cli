import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "naturally undress and change the outfit into a thin bikini while keeping body proportions natural. Keep Model dancing tiktok dance.";

export const aiBikiniModelCmd = new Command("ai-bikini-model")
  .summary("AI bikini model — transform a person photo into a bikini model image or video")
  .description(
    "Transform a portrait or full-body photo into a bikini model image or video.\n\n" +
    "Generated type (--generated-type):\n" +
    "  video   Generate a short video (default)\n" +
    "  image   Generate a still image\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "When --generated-type is video, results come back in video[N].url.\n" +
    "When --generated-type is image, results come back in image[N].url.\n\n" +
    "Examples:\n" +
    "  weshop ai-bikini-model --image ./person.png --prompt 'Bikini model on a beach'\n" +
    "  weshop ai-bikini-model --image ./person.png --generated-type image --batch 2\n" +
    "  weshop ai-bikini-model --image ./person.png --generated-type video --no-wait"
  )
  .requiredOption("--image <path|url>", "Input portrait or full-body photo — local file path or URL")
  .requiredOption("--prompt <text>", "Describe the desired bikini model scene")
  .option("--generated-type <type>", "Output type: video (default) or image")
  .option("--batch <count>", "Number of outputs to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const { url: imageUrl } = await resolveImage(opts.image);

      const params: Record<string, unknown> = {
        textDescription: opts.prompt,
        images: [imageUrl],
        generatedType: opts.generatedType ?? "video",
      };
      if (opts.batch != null) params.batchCount = opts.batch;

      const input: Record<string, unknown> = { originalImage: imageUrl };
      if (opts.taskName) input.taskName = opts.taskName;

      const body: RunRequest = { agent: { name: "ai-bikini-model", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
