import { Command } from "commander";
import { executeRun } from "../run-helper.js";

const DEFAULT_PROMPT =
  "A hyper-realistic, award-winning wildlife photograph of [ANY RANDOM ANIMAL] in its natural habitat. Captured in a National Geographic style to emphasize natural lighting and fur/scale texture. Shot on a Sony A1 with a 600mm f/4 lens for a shallow depth of field and a creamy bokeh background. The composition follows the rule of thirds, showing the animal in a candid, unposed moment—such as hunting, resting, or observing its surroundings. Incredible detail on the eyes, whiskers, and environment, 8k resolution, cinematic atmosphere, sharp focus, natural color grading.";

export const randomAnimalGeneratorCmd = new Command("random-animal-generator")
  .summary("AI random animal generator — generate a hyper-realistic wildlife photo of any animal")
  .description(
    "Generate a hyper-realistic National Geographic-style wildlife photograph.\n" +
    "Image is optional — text-only generation is supported.\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    "  Random animal in its natural habitat, National Geographic style, 8K resolution.\n\n" +
    "Examples:\n" +
    "  weshop random-animal-generator\n" +
    "  weshop random-animal-generator --prompt 'A snow leopard stalking prey in the Himalayas'\n" +
    "  weshop random-animal-generator --batch 4"
  )
  .option("--image <path|url>", "Reference image — local file path or URL (optional)")
  .option("--prompt <text>", "Describe the desired animal and scene")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const params: Record<string, unknown> = { textDescription: opts.prompt ?? DEFAULT_PROMPT };
    if (opts.batch != null) params.batchCount = opts.batch;
    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;
    await executeRun("random-animal-generator", "v1.0", { image: opts.image, wait: opts.wait }, params, extraInput);
  });
