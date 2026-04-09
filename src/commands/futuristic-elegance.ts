import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "Put this person in a dramatic cinematic scene with harajuku fashion with futuristic color PVC clothing, semi-transparent color vinyl, metalic prismatic, holographic, chromatic aberration, fashion illustration, masterpiece. slightly wide-angle lens, natural soft key lighting, realistic style. Make it look like an actual movie scene, but keep original aspect ratio.";

export const futuristicEleganceCmd = new Command("futuristic-elegance")
  .summary("Dress a person in futuristic harajuku fashion — cinematic sci-fi outfit transformation")
  .description(
    "Transform a portrait photo into a dramatic cinematic scene with futuristic harajuku fashion.\n\n" +
    "Applies holographic PVC clothing, prismatic materials, and cinematic lighting while\n" +
    "preserving the person's face and body proportions.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop futuristic-elegance --image ./person.png\n" +
    "  weshop futuristic-elegance --image ./person.png --prompt 'Cyberpunk neon outfit, rain-soaked street'\n" +
    "  weshop futuristic-elegance --image ./person.png --batch 4"
  )
  .requiredOption("--image <path|url>", "Input portrait image — local file path or URL")
  .option("--prompt <text>", "Custom style instruction (default: futuristic harajuku cinematic scene)")
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
        agent: { name: "futuristic-elegance", version: "v1.0" },
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
