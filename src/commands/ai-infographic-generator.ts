import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT = "Generate a infographic of: [Evolution of AI]";

export const aiInfographicGeneratorCmd = new Command("ai-infographic-generator")
  .summary("AI infographic generator — turn a text description into a professional infographic layout")
  .description(
    "Generate a clean, professional infographic from a text description.\n\n" +
      "This is a text-only agent. No image input is accepted; all layout and visuals are derived from the prompt.\n\n" +
      "Default prompt (used when --prompt is omitted):\n" +
      `  "${DEFAULT_PROMPT}"\n\n` +
      "Examples:\n" +
      "  weshop ai-infographic-generator --prompt 'Customer journey from awareness to retention, 5-step flow, clean minimal design'\n" +
      "  weshop ai-infographic-generator --prompt 'Startup funding stages: seed, Series A, Series B, Series C, structured as a vertical timeline'"
  )
  .option("--prompt <text>", "Describe the topic, structure, and key points of the infographic")
  .option("--batch <count>", "Number of infographic images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      textDescription: opts.prompt ?? DEFAULT_PROMPT,
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("ai-infographic-generator", "v1.0", { wait: opts.wait }, params, extraInput);
  });

