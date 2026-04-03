import { Command } from "commander";
import { fetchAgentInfo } from "../client.js";
import { printError } from "../printer.js";

const AGENTS = ["aimodel", "aiproduct", "aipose", "expandimage", "removeBG", "virtualtryon"];

interface PresetItem {
  id: number;
  name: string;
  image?: string;
  categories?: string[] | null;
  type?: string;
}

interface AgentInfoData {
  locations?: PresetItem[];
  fashionModels?: PresetItem[];
  backgrounds?: PresetItem[];
  [key: string]: unknown;
}

function printPresetList(label: string, items: PresetItem[]) {
  console.log(`  ${label}: (${items.length} items)`);
  for (const item of items) {
    const cats = item.categories?.length ? ` [${item.categories.join(", ")}]` : "";
    const type = item.type ? ` (${item.type})` : "";
    console.log(`    id: ${item.id}  name: ${item.name}${cats}${type}`);
  }
}

export const infoCmd = new Command("info")
  .summary("List available preset IDs for an agent")
  .description(
    "List available preset IDs for an agent (locationId, fashionModelId, backgroundId, etc.).\n\n" +
    "Use these IDs with --location-id, --model-id, or --bg-id in agent commands.\n\n" +
    "Agents: " + AGENTS.join(", ") + "\n\n" +
    "Examples:\n" +
    "  weshop info aimodel\n" +
    "  weshop info removeBG\n" +
    "  weshop info aimodel --version v1.0\n" +
    "  weshop info aimodel --json"
  )
  .argument("<agent>", `Agent name: ${AGENTS.join(", ")}`)
  .option("--version <ver>", "Agent version (default: v1.0)", "v1.0")
  .option("--json", "Output raw JSON instead of formatted list")
  .action(async (agent: string, opts: { version: string; json?: boolean }) => {
    try {
      const data = (await fetchAgentInfo(agent, opts.version)) as AgentInfoData;

      if (opts.json) {
        console.log(JSON.stringify(data, null, 2));
        return;
      }

      console.log("[info]");
      console.log(`  agent: ${agent} ${opts.version}`);

      let hasPresets = false;

      if (data.locations?.length) {
        hasPresets = true;
        printPresetList("locations (use with --location-id)", data.locations);
      }
      if (data.fashionModels?.length) {
        hasPresets = true;
        printPresetList("fashionModels (use with --model-id)", data.fashionModels);
      }
      if (data.backgrounds?.length) {
        hasPresets = true;
        printPresetList("backgrounds (use with --bg-id)", data.backgrounds);
      }

      // print any other array fields we didn't expect
      for (const [key, val] of Object.entries(data)) {
        if (["locations", "fashionModels", "backgrounds"].includes(key)) continue;
        if (Array.isArray(val) && val.length) {
          hasPresets = true;
          printPresetList(key, val as PresetItem[]);
        }
      }

      if (!hasPresets) {
        console.log("  message: No preset IDs available for this agent");
      }
    } catch (err) {
      printError(err);
      process.exit(1);
    }
  });
