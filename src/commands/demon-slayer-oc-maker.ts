import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "Turn this person into Demon Slayer anime style, Kimetsu no Yaiba aesthetics, thick brush strokes, bold black outlines, expressive eyes with distinct pupils, wearing a custom slayer uniform and a patterned haori, Ufotable high-quality animation style, cinematic lighting, sharp focus, vibrant cel-shading, keep key facial and gender characteristics.";

export const demonSlayerOcMakerCmd = new Command("demon-slayer-oc-maker")
  .summary("AI Demon Slayer OC maker — transform a person into a Kimetsu no Yaiba anime character")
  .description(
    "Transform a person photo into a Demon Slayer (Kimetsu no Yaiba) anime-style character.\n" +
    "Image is optional.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    "  Demon Slayer anime style, Ufotable animation quality, custom slayer uniform and haori,\n" +
    "  preserving key facial and gender characteristics.\n\n" +
    "Examples:\n" +
    "  weshop demon-slayer-oc-maker --image ./person.png\n" +
    "  weshop demon-slayer-oc-maker --image ./person.png --prompt 'Water breathing style, blue haori'\n" +
    "  weshop demon-slayer-oc-maker --batch 2 --image ./person.png"
  )
  .option("--image <path|url>", "Reference person image — local file path or URL (optional)")
  .option("--prompt <text>", "Custom Demon Slayer OC description")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("demon-slayer-oc-maker", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
