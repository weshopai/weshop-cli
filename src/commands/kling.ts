import { Command } from "commander";
import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "../client.js";
import { printSubmitted, printPollResult, printError } from "../printer.js";

export const klingCmd = new Command("kling")
  .summary("AI video generation — create cinematic videos from images and text using Kling")
  .description(
    "AI video generation — create cinematic videos from images and text using Kling.\n\n" +
    "Provide a reference image and a text prompt describing the desired motion or scene.\n" +
    "Results are returned as video URLs in the result section.\n\n" +
    "Model (--model):\n" +
    "  Kling_3_0         Kling 3.0 — latest, supports 3s-15s duration and audio (default)\n" +
    "  Kling_2_6         Kling 2.6 — supports audio\n" +
    "  Kling_2_5_Turbo   Kling 2.5 Turbo — fast generation\n" +
    "  Kling_2_1_Master  Kling 2.1 Master — high quality\n" +
    "  Kling_2_1         Kling 2.1\n\n" +
    "Duration (--duration):\n" +
    "  Kling_3_0:  3s, 4s, 5s, 6s, 7s, 8s, 9s, 10s, 11s, 12s, 13s, 14s, 15s  (default: 5s)\n" +
    "  Others:     5s, 10s  (default: 5s)\n\n" +
    "Audio generation (--generate-audio):\n" +
    "  Only supported for Kling_3_0 and Kling_2_6. Ignored for other models.\n\n" +
    "Examples:\n" +
    "  weshop kling --image ./scene.png --prompt 'Camera slowly pans across a misty forest'\n" +
    "  weshop kling --image ./portrait.png --prompt 'Person turns and smiles' --model Kling_3_0 --duration 5s\n" +
    "  weshop kling --image ./product.png --prompt 'Product rotates on a pedestal' --model Kling_3_0 --duration 8s --generate-audio true"
  )
  .requiredOption("--image <path|url>", "Reference image — local file path or public URL")
  .requiredOption("--prompt <text>", "Describe the desired motion or scene")
  .option("--model <name>", "Kling model version (default: Kling_3_0)")
  .option("--duration <time>", "Video duration, e.g. 5s, 10s (default: 5s)")
  .option("--generate-audio <bool>", "Generate audio: true or false (Kling_3_0 and Kling_2_6 only)")
  .option("--batch <count>", "Number of videos to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    try {
      const { url: imageUrl } = await resolveImage(opts.image);
      console.log("[image]");
      console.log(`  imageUrl: ${imageUrl}`);

      const params: Record<string, unknown> = {
        textDescription: opts.prompt,
        images: [imageUrl],
      };
      if (opts.model) params.modelName = opts.model;
      if (opts.duration) params.duration = opts.duration;
      if (opts.generateAudio !== undefined) params.generateAudio = opts.generateAudio;
      if (opts.batch != null) params.batchCount = opts.batch;

      const input: Record<string, unknown> = {
        originalImage: imageUrl,
      };
      if (opts.taskName) input.taskName = opts.taskName;

      const body: RunRequest = {
        agent: { name: "kling", version: "v1.0" },
        input,
        params,
      };

      const { executionId } = await submitRun(body);
      printSubmitted(executionId);

      if (opts.wait !== false) {
        const data = await waitForCompletion(executionId);
        printPollResult(data);
      } else {
        console.log("[info]");
        console.log(`  message: Use 'weshop status ${executionId}' to check progress`);
      }
    } catch (err) {
      printError(err);
      process.exit(1);
    }
  });
