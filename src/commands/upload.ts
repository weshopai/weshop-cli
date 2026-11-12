import { Command } from "commander";
import { uploadImage } from "../client.js";
import { printUpload, printError } from "../printer.js";

export const uploadCmd = new Command("upload")
  .description("Upload a local image and get a reusable URL. Generic limits: each side >= 512px, width/height ratio 0.5-2, <= 20 MiB; GIF/BMP are not supported. Use --agent and --model for model-specific input limits. Uploaded/cached URLs are validated again when submitting a run.")
  .argument("<file>", "Path to the image file")
  .option("--agent <name>", "Validate for this agent (otherwise use generic upload limits)")
  .option("--agent-version <version>", "Agent version", "v1.0")
  .option("--model <name>", "Selected model; requires --agent")
  .action(async (file: string, opts) => {
    try {
      if (opts.model && !opts.agent) throw new Error("--model requires --agent");
      const { image } = await uploadImage(file, opts.agent ? { agentName: opts.agent, agentVersion: opts.agentVersion, modelName: opts.model } : undefined);
      printUpload(image);
    } catch (err) {
      printError(err);
      process.exit(1);
    }
  });
