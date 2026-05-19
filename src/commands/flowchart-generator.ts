import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "Generate a flowchart of: [Evolution of AI]";

export const flowchartGeneratorCmd = new Command("flowchart-generator")
  .summary("AI flowchart generator — create clear flowcharts from structured text descriptions")
  .description(
    "Generate structured flowcharts from a text description of steps and relationships.\n\n" +
      "This is a text-only agent. It does not accept images; the flowchart is derived entirely from the prompt.\n\n" +
      "Default prompt (used when --prompt is omitted):\n" +
      `  "${DEFAULT_PROMPT}"\n\n` +
      "Examples:\n" +
      "  weshop flowchart-generator --prompt 'Order processing flow: receive order, payment, packaging, shipping, delivery'\n" +
      "  weshop flowchart-generator --prompt 'User signup journey: visit landing page, click sign up, fill form, email verification, first login'"
  )
  .option("--prompt <text>", "Describe the process, steps, and relationships to visualize in the flowchart")
  .option("--batch <count>", "Number of flowchart images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      textDescription: opts.prompt ?? DEFAULT_PROMPT,
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("flowchart-generator", "v1.0", { wait: opts.wait }, params, extraInput);
  });

