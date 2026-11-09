export function requireOption(condition: boolean, message: string): asserts condition {
  if (!condition) {
    console.error(`[error]\n  message: ${message}`);
    process.exit(1);
  }
}
export function hostedUrls(values: string[] | undefined, name: string) {
  for (const value of values ?? []) {
    let valid = false;
    try { const url = new URL(value); valid = ["http:", "https:"].includes(url.protocol) && !!url.hostname; } catch {}
    requireOption(valid, `${name} requires hosted http(s) URLs`);
  }
}
export function durationInRange(value: string, min: number, max: number) {
  requireOption(/^\d+s$/.test(value) && Number(value.slice(0, -1)) >= min && Number(value.slice(0, -1)) <= max,
    `Duration must be ${min}s-${max}s`);
}
