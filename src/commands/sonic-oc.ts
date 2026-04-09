import { Command } from "commander";
import { executeRun } from "../run-helper.js";

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
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("sonic-oc", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
