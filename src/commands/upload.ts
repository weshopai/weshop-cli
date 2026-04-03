import { Command } from "commander";
import { uploadImage } from "../client.js";
import { printUpload, printError } from "../printer.js";

export const uploadCmd = new Command("upload")
  .description("Upload a local image and get a reusable URL")
  .argument("<file>", "Path to the image file")
  .action(async (file: string) => {
    try {
      const { image } = await uploadImage(file);
      printUpload(image);
    } catch (err) {
      printError(err);
      process.exit(1);
    }
  });
