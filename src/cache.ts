import fs from "node:fs";
import os from "node:os";
import path from "node:path";

interface CacheEntry {
  url: string;
  size: number;
  mtimeMs: number;
}

type CacheData = Record<string, CacheEntry>;

const CACHE_DIR = path.join(os.homedir(), ".weshop-cli");
const CACHE_FILE = path.join(CACHE_DIR, "upload-cache.json");

function loadCache(): CacheData {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8")) as CacheData;
    }
  } catch {
    // corrupted cache, start fresh
  }
  return {};
}

function saveCache(data: CacheData): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
}

/**
 * Build a cache key from absolute path.
 * Match by path + file size + mtime so edits invalidate the cache.
 */
function fileFingerprint(absPath: string): { size: number; mtimeMs: number } {
  const stat = fs.statSync(absPath);
  return { size: stat.size, mtimeMs: Math.floor(stat.mtimeMs) };
}

/** Look up a cached URL for a local file. Returns undefined on miss. */
export function getCachedUrl(absPath: string): string | undefined {
  const cache = loadCache();
  const entry = cache[absPath];
  if (!entry) return undefined;

  const fp = fileFingerprint(absPath);
  if (entry.size === fp.size && entry.mtimeMs === fp.mtimeMs) {
    return entry.url;
  }
  // file changed, invalidate
  delete cache[absPath];
  saveCache(cache);
  return undefined;
}

/** Store a URL for a local file. */
export function setCachedUrl(absPath: string, url: string): void {
  const cache = loadCache();
  const fp = fileFingerprint(absPath);
  cache[absPath] = { url, ...fp };
  saveCache(cache);
}
