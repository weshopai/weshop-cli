import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT = "Make a sonic oc based on this person's appearance";

export const sonicOcCmd = new Command("sonic-oc")
  .summary("AI Sonic OC maker — create a Sonic the Hedgehog original character based on a person's appearance")
  .description(
    "Generate a Sonic the Hedgehog-style original character (OC) based on a person's appearance.\n" +
    "Image is optional — you can generate a Sonic OC from a text description alone.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    `  "${DEFAULT_PROMPT}"\n\n` +
    "Examples:\n" +
    "  weshop sonic-oc --image ./person.png\n" +
    "  weshop sonic-oc --prompt 'A fast blue hedgehog OC with red sneakers and a confident pose'\n" +
    "  weshop sonic-oc --image ./person.png --prompt 'Sonic OC with purple fur and gold rings' --batch 2"
  )
  .option("--image <path|url>", "Reference person image — local file path or URL (optional)")
  .option("--prompt <text>", "Custom Sonic OC description (default: based on person's appearance)")
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
      const body: RunRequest = { agent: { name: "sonic-oc", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
