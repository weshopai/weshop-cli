import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "Transform the person in the uploaded photo into a Sprunki-style original character (OC). Keep the same facial identity, hairstyle, and key proportions, while redesigning the character in a colorful, playful Sprunki cartoon aesthetic. Big expressive eyes, simplified geometric shapes, smooth outlines, vibrant pastel color palette, soft shading, clean vector-like rendering, cute and energetic mood, stylized costume details, character sheet illustration quality, centered composition, high detail, 4k, masterpiece.";

export const sprunkiOcMakerCmd = new Command("sprunki-oc-maker")
  .summary("AI Sprunki OC maker — create a Sprunki-style original character from a person photo")
  .description(
    "Transform a person photo into a Sprunki-style original character (OC) with colorful\n" +
    "cartoon aesthetics. Image is optional.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    "  Sprunki-style OC with big expressive eyes, vibrant pastel colors, smooth outlines,\n" +
    "  preserving facial identity and key proportions.\n\n" +
    "Examples:\n" +
    "  weshop sprunki-oc-maker --image ./person.png\n" +
    "  weshop sprunki-oc-maker --prompt 'Sprunki OC with purple hair and star accessories'\n" +
    "  weshop sprunki-oc-maker --image ./person.png --batch 2"
  )
  .option("--image <path|url>", "Reference person image — local file path or URL (optional)")
  .option("--prompt <text>", "Custom Sprunki OC description")
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
      const body: RunRequest = { agent: { name: "sprunki-oc-maker", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
