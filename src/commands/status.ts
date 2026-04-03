import { Command } from "commander";
import { pollRun } from "../client.js";
import { printPollResult, printError } from "../printer.js";

export const statusCmd = new Command("status")
  .description("Check the status of a run by execution ID")
  .argument("<executionId>", "The execution ID returned from a run")
  .action(async (executionId: string) => {
    try {
      const data = await pollRun(executionId);
      printPollResult(data);
    } catch (err) {
      printError(err);
      process.exit(1);
    }
  });
