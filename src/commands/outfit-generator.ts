import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "Design an complete new and recommended outfit based on the uploaded photo. Keep original face and body proportion, keep original pose and background; Keep original image composition; select the proper texture used for outfit. No annotations required.\n1. Analyze the core characteristics of the model, dressing style and potential personality of the subject.\n2. Extract the disassemblable first-level elements (coat, shoes, big expression)\n3. Generate a composite diagram containing all these elements, ensuring accurate perspective, unified lighting and shadow, keep everything else same.";

export const outfitGeneratorCmd = new Command("outfit-generator")
  .summary("AI outfit generator — redesign a complete outfit on a person photo based on style prompt")
  .description(
    "Analyze a person's photo and generate a new recommended outfit while preserving\n" +
    "the original face, body proportions, pose, and background.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    "  Analyzes the model's style and personality, then generates a complete new outfit\n" +
    "  with accurate perspective and unified lighting.\n\n" +
    "Examples:\n" +
    "  weshop outfit-generator --image ./person.png\n" +
    "  weshop outfit-generator --image ./person.png --prompt 'Streetwear style, oversized hoodie and cargo pants'\n" +
    "  weshop outfit-generator --image ./person.png --batch 4"
  )
  .requiredOption("--image <path|url>", "Input person photo — local file path or URL")
  .option("--prompt <text>", "Describe the desired outfit style (default: AI-recommended outfit)")
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

      const body: RunRequest = {
        agent: { name: "outfit-generator", version: "v1.0" },
        input,
        params,
      };

      const { executionId } = await submitRun(body);
      printSubmitted(executionId);

      if (opts.wait !== false) {
        const data = await waitForCompletion(executionId);
        printPollResult(data);
      } else {
        console.log("[info]");
        console.log(`  message: Use 'weshop status ${executionId}' to check progress`);
      }
    } catch (err) {
      printError(err);
      process.exit(1);
    }
  });
