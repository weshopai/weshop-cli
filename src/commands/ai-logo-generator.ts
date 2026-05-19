import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "Create a clean, professional logo for [BRAND NAME], a [BRAND TYPE/INDUSTRY].\nStyle: [modern/minimal/luxury/tech/playful].\nInclude a simple icon or symbol that reflects [CORE IDEA].\nUse a strong, memorable, scalable logo design with clean shapes and minimal details.\nBackground should be simple and uncluttered.\nPrefer a vector-style look, balanced composition, and high brand recognizability.";

export const aiLogoGeneratorCmd = new Command("ai-logo-generator")
  .summary("AI logo generator — design brand logos from text descriptions, no reference image required")
  .description(
    "Generate brand logos from a structured text description of your business and style.\n\n" +
      "This is a text-only agent. It does not accept reference images; all design choices are driven by the prompt.\n\n" +
      "Default prompt (used when --prompt is omitted):\n" +
      `  "${DEFAULT_PROMPT.replace(/\n/g, "\\n")}"\n\n` +
      "Examples:\n" +
      "  weshop ai-logo-generator --prompt 'Logo for a fintech startup called FlowPay, modern blue and green palette, abstract wave icon'\n" +
      "  weshop ai-logo-generator --prompt 'Luxury fashion brand logo, black and gold, elegant serif lettering, minimal monogram icon'"
  )
  .option("--prompt <text>", "Describe the brand name, industry, style, and visual preferences for the logo")
  .option("--batch <count>", "Number of logo variations to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = {
      textDescription: opts.prompt ?? DEFAULT_PROMPT,
    };
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun("ai-logo-generator", "v1.0", { wait: opts.wait }, params, extraInput);
  });

