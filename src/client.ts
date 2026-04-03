import fs from "node:fs";
import path from "node:path";
import { getCachedUrl, setCachedUrl } from "./cache.js";

const BASE_URL = "https://openapi.weshop.ai/openapi";

// ── helpers ──────────────────────────────────────────────────────────

function getApiKey(): string {
  const key = process.env.WESHOP_API_KEY;
  if (!key) {
    console.error(
      "Error: API key not found.\n" +
        "Set it via:  export WESHOP_API_KEY=<your-key>\n" +
        "Get one at:  https://open.weshop.ai/authorization/apikey"
    );
    process.exit(1);
  }
  return key;
}

async function request<T>(
  endpoint: string,
  init: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: getApiKey(),
      ...init.headers,
    },
  });
  const json = (await res.json()) as { success: boolean; data: T; error?: { code: string; message: string } };
  if (!json.success) {
    throw new Error(`API error: ${json.error?.code} — ${json.error?.message}`);
  }
  return json.data;
}

// ── public API ───────────────────────────────────────────────────────

export interface UploadResult {
  image: string;
}

export async function uploadImage(filePath: string): Promise<UploadResult> {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) throw new Error(`File not found: ${abs}`);

  const blob = new Blob([fs.readFileSync(abs)]);
  const form = new FormData();
  form.append("image", blob, path.basename(abs));

  return request<UploadResult>("/agent/assets/images", {
    method: "POST",
    body: form,
  });
}

export interface RunRequest {
  agent: { name: string; version: string };
  input: Record<string, unknown>;
  params: Record<string, unknown>;
}

export interface RunResponse {
  executionId: string;
  taskId: string;
}

export async function submitRun(body: RunRequest): Promise<RunResponse> {
  return request<RunResponse>("/agent/runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export interface ExecutionResult {
  status: string;
  image?: string;
}

export interface Execution {
  executionId: string;
  status: string;
  result: ExecutionResult[];
}

export interface PollResponse {
  agentName: string;
  agentVersion: string;
  executions: Execution[];
}

export async function pollRun(executionId: string): Promise<PollResponse> {
  return request<PollResponse>(`/agent/runs/${executionId}`);
}

export async function fetchAgentInfo(agentName: string, agentVersion: string): Promise<unknown> {
  return request<unknown>(`/v1/agent/info?agentName=${encodeURIComponent(agentName)}&agentVersion=${encodeURIComponent(agentVersion)}`);
}

/** Poll until terminal status, calling `onTick` each iteration. */
export async function waitForCompletion(
  executionId: string,
  intervalMs = 3000
): Promise<PollResponse> {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const data = await pollRun(executionId);
    const latest = data.executions.at(-1);
    if (latest && ["Success", "Failed"].includes(latest.status)) return data;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

/**
 * Resolve an image argument: if it looks like a URL pass through,
 * otherwise check upload cache, and upload only if not cached.
 */
export async function resolveImage(imageArg: string): Promise<{ url: string; cached: boolean }> {
  if (/^https?:\/\//.test(imageArg)) return { url: imageArg, cached: false };

  const abs = path.resolve(imageArg);
  const cached = getCachedUrl(abs);
  if (cached) return { url: cached, cached: true };

  const { image } = await uploadImage(abs);
  setCachedUrl(abs, image);
  return { url: image, cached: false };
}
