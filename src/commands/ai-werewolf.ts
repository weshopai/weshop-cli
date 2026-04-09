import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

const DEFAULT_PROMPT =
  "The character in the image suddenly begins a violent werewolf transformation. Muscles rapidly expand, veins bulge under the skin. The character roars in pain as their clothes tear apart from the expanding body. Dark fur quickly grows across the arms, chest, and face, covering the body as the transformation continues. Hands stretch and twist into sharp claws, fingers elongating. The jaw extends into a wolf-like muzzle, teeth sharpening into fangs. Eyes glow with a wild golden light. The camera slowly circles the character as the transformation intensifies, pieces of torn clothing flying through the air. By the end, a full ferocious werewolf stands where the human once was, breathing heavily, surrounded by drifting fabric fragments. cinematic lighting, dramatic shadows, dark fantasy atmosphere, high detail, dynamic motion, 4K.";

export const aiWerewolfCmd = new Command("ai-werewolf")
  .summary("AI werewolf generator — create a dramatic werewolf transformation video from a person photo")
  .description(
    "Generate a cinematic werewolf transformation video from a person photo.\n" +
    "Results come back in video[N].url.\n\n" +
    "Model (--model):\n" +
    "  Kling_3_0   Kling 3.0 — supports 3s-15s duration (default)\n" +
    "  Kling_2_6   Kling 2.6 — supports 5s, 10s duration\n\n" +
    "Duration (--duration):\n" +
    "  Kling_3_0:  3s-15s  (default: 5s)\n" +
    "  Kling_2_6:  5s, 10s  (default: 5s)\n\n" +
    "Default prompt (used when --prompt is omitted):\n" +
    "  Dramatic werewolf transformation with muscle expansion, fur growth, claw formation,\n" +
    "  cinematic lighting, dark fantasy atmosphere.\n\n" +
    "Examples:\n" +
    "  weshop ai-werewolf --image ./person.png --prompt 'Werewolf transformation under full moon'\n" +
    "  weshop ai-werewolf --image ./person.png --model Kling_3_0 --duration 10s\n" +
    "  weshop ai-werewolf --image ./person.png --no-wait"
  )
  .requiredOption("--image <path|url>", "Input person photo — local file path or URL")
  .requiredOption("--prompt <text>", "Describe the werewolf transformation scene")
  .option("--model <name>", "Kling model: Kling_3_0 (default) or Kling_2_6")
  .option("--duration <time>", "Video duration, e.g. 5s, 10s (default: 5s)")
  .option("--generate-audio <bool>", "Generate audio: true (default) or false")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const { url: imageUrl } = await resolveImage(opts.image);
      const params: Record<string, unknown> = {
        textDescription: opts.prompt,
        images: [imageUrl],
        modelName: opts.model ?? "Kling_3_0",
        duration: opts.duration ?? "5s",
        generateAudio: opts.generateAudio ?? "true",
      };
      if (opts.batch != null) params.batchCount = opts.batch;
      const input: Record<string, unknown> = { originalImage: imageUrl };
      if (opts.taskName) input.taskName = opts.taskName;
      const body: RunRequest = { agent: { name: "ai-werewolf", version: "v1.0" }, input, params };
      const { executionId } = await submitRun(body);
      printSubmitted(executionId);
      if (opts.wait !== false) { printPollResult(await waitForCompletion(executionId)); }
      else { console.log("[info]"); console.log(`  message: Use 'weshop status ${executionId}' to check progress`); }
    } catch (err) { printError(err); process.exit(1); }
  });
