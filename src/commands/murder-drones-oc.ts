import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "Convert the person from the reference image into a Murder Drones inspired OC. Strictly maintain facial identity, head shape, and signature traits, while transforming the body into an elegant yet dangerous robotic drone form. Smooth black metal armor, luminous LED accents, claw-like fingers, floating mechanical components, glowing visor or eyes, dark cyberpunk environment, cinematic lighting, high detail sci-fi illustration, clean composition, 4k, character concept art, masterpiece.";

export const murderDronesOcCmd = new Command("murder-drones-oc")
  .summary("AI Murder Drones OC maker — transform a person into a Murder Drones-inspired robotic drone character")
  .description(
    "Transform a person photo into a Murder Drones-inspired original character (OC)\n" +
    "with robotic drone aesthetics. Image is optional.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    "  Robotic drone OC with black metal armor, LED accents, claw fingers, glowing visor,\n" +
    "  dark cyberpunk environment, preserving facial identity.\n\n" +
    "Examples:\n" +
    "  weshop murder-drones-oc --image ./person.png\n" +
    "  weshop murder-drones-oc --prompt 'Murder Drones OC with white armor and blue LED eyes'\n" +
    "  weshop murder-drones-oc --image ./person.png --batch 2"
  )
  .option("--image <path|url>", "Reference person image — local file path or URL (optional)")
  .option("--prompt <text>", "Custom Murder Drones OC description")
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
      const body: RunRequest = { agent: { name: "murder-drones-oc", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
