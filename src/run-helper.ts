import { resolveImage, submitRun, waitForCompletion, type RunRequest } from "./client.js";
import { printSubmitted, printPollResult, printError } from "./printer.js";

export interface RunOptions {
  /** Single primary image — local path or URL. Optional for agents that support text-only input. */
  image?: string;
  /** Multiple images — for agents that accept up to N reference images. */
  images?: string[];
  /** Video URL(s) — for video-processing agents. Not auto-uploaded; must be a hosted URL. */
  videos?: string[];
  /** If false (from --no-wait), return immediately after submission. */
  wait?: boolean;
}

export async function executeRun(
  agentName: string,
  agentVersion: string,
  opts: RunOptions,
  params: Record<string, unknown>,
  extraInput: Record<string, unknown> = {}
) {
  try {
    const input: Record<string, unknown> = { ...extraInput };

    // ── video input ──────────────────────────────────────────────────────────
    if (opts.videos && opts.videos.length > 0) {
      console.log("[video]");
      opts.videos.forEach((v) => console.log(`  videoUrl: ${v}`));
      input.videos = opts.videos;
      params.videos = params.videos ?? opts.videos;
    }

    // ── multi-image input ────────────────────────────────────────────────────
    if (opts.images && opts.images.length > 0) {
      const urls: string[] = [];
      for (const img of opts.images) {
        const { url } = await resolveImage(img);
        urls.push(url);
      }
      console.log("[images]");
      urls.forEach((u, i) => console.log(`  image[${i}]: ${u}`));
      params.images = urls;
      if (!input.originalImage) input.originalImage = urls[0];
    }

    // ── single primary image ─────────────────────────────────────────────────
    if (opts.image) {
      const { url: imageUrl } = await resolveImage(opts.image);
      console.log("[image]");
      console.log(`  imageUrl: ${imageUrl}`);
      if (!input.originalImage) input.originalImage = imageUrl;
      // If params.images not already set by multi-image path, set it
      if (!params.images) params.images = [imageUrl];
    }

    const body: RunRequest = {
      agent: { name: agentName, version: agentVersion },
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
}
