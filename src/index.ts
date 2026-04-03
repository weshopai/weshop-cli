#!/usr/bin/env node
import { Command } from "commander";
import { uploadCmd } from "./commands/upload.js";
import { statusCmd } from "./commands/status.js";
import { infoCmd } from "./commands/info.js";
import { aimodelCmd } from "./commands/aimodel.js";
import { aiproductCmd } from "./commands/aiproduct.js";
import { aiposeCmd } from "./commands/aipose.js";
import { expandimageCmd } from "./commands/expandimage.js";
import { removebgCmd } from "./commands/removebg.js";
import { virtualtryonCmd } from "./commands/virtualtryon.js";

const program = new Command()
  .name("weshop")
  .version("0.1.0")
  .addHelpCommand(false)
  .description(
    "WeShop AI — generate, edit, and transform images from the command line.\n\n" +
    "Set your API key:  export WESHOP_API_KEY=<key>\n" +
    "Get one at:        https://open.weshop.ai/authorization/apikey\n\n" +
    "Run 'weshop <command> --help' to see each agent's specific parameters and usage.\n\n" +
    "Examples:\n" +
    "  weshop upload ./photo.png\n" +
    "  weshop aimodel --image ./model.png --mask-type autoApparelSegment --generation-mode freeCreation --prompt 'street style'\n" +
    "  weshop removebg --image ./product.png --mask-type autoSubjectSegment --bg-hex '#ffffff'\n" +
    "  weshop status <executionId>"
  );

program.addCommand(uploadCmd);
program.addCommand(statusCmd);
program.addCommand(infoCmd);
program.addCommand(virtualtryonCmd);
program.addCommand(aimodelCmd);
program.addCommand(aiproductCmd);
program.addCommand(aiposeCmd);
program.addCommand(expandimageCmd);
program.addCommand(removebgCmd);

program.parse();
