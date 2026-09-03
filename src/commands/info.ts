import { Command, InvalidArgumentError } from "commander";
import { fetchAgentInfo, type AgentInfoResourceType } from "../client.js";
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
  pagination?: {
    page: number;
    pageSize: number;
    locations?: ResourcePagination;
    fashionModels?: ResourcePagination;
  };
  [key: string]: unknown;
}

interface ResourcePagination {
  total: number;
  isLastPage: boolean;
}

function parsePositiveInteger(value: string, max?: number): number {
  if (!/^\d+$/.test(value)) {
    throw new InvalidArgumentError("must be a positive integer");
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new InvalidArgumentError("must be a positive integer");
  }
  if (max !== undefined && parsed > max) {
    throw new InvalidArgumentError(`must not exceed ${max}`);
  }
  return parsed;
}

function parseResourceType(value: string): AgentInfoResourceType {
  if (value !== "locations" && value !== "fashionModels") {
    throw new InvalidArgumentError("must be locations or fashionModels");
  }
  return value;
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
    "  weshop info aimodel --page 2 --page-size 100\n" +
    "  weshop info aimodel --resource-type locations\n" +
    "  weshop info aimodel --json"
  )
  .argument("<agent>", `Agent name: ${AGENTS.join(", ")}`)
  .option("--version <ver>", "Agent version (default: v1.0)", "v1.0")
  .option("--page <number>", "Page number (default: 1)", (value) => parsePositiveInteger(value), 1)
  .option("--page-size <number>", "Items per resource (default: 50, max: 100)", (value) => parsePositiveInteger(value, 100), 50)
  .option("--resource-type <type>", "Only return aimodel locations or fashionModels", parseResourceType)
  .option("--json", "Output raw JSON instead of formatted list")
  .action(async (agent: string, opts: { version: string; page: number; pageSize: number; resourceType?: AgentInfoResourceType; json?: boolean }) => {
    try {
      if (opts.resourceType && agent !== "aimodel") {
        throw new Error("--resource-type is only supported for aimodel");
      }
      const data = (await fetchAgentInfo(agent, opts.version, opts.page, opts.pageSize, opts.resourceType)) as AgentInfoData;

      if (opts.json) {
        console.log(JSON.stringify(data, null, 2));
        return;
      }

      console.log("[info]");
      console.log(`  agent: ${agent} ${opts.version}`);
      if (data.pagination) {
        console.log(`  page: ${data.pagination.page}  pageSize: ${data.pagination.pageSize}`);
        if (data.pagination.locations) {
          console.log(`  locations: total=${data.pagination.locations.total}  isLastPage=${data.pagination.locations.isLastPage}`);
        }
        if (data.pagination.fashionModels) {
          console.log(`  fashionModels: total=${data.pagination.fashionModels.total}  isLastPage=${data.pagination.fashionModels.isLastPage}`);
        }
      }

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
        if (["locations", "fashionModels", "backgrounds", "pagination"].includes(key)) continue;
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
