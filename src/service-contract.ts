import type { RunRequest } from './client.js';
export function serviceRunRequest(value: unknown): RunRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid run request');
  const v = value as Record<string, unknown>;
  const agent = v.agent as Record<string, unknown> | undefined;
  if (!agent || typeof agent.name !== 'string' || typeof agent.version !== 'string' || !agent.name || !agent.version) throw new Error('Invalid agent identity');
  for (const key of ['input', 'params']) if (!v[key] || typeof v[key] !== 'object' || Array.isArray(v[key])) throw new Error('Invalid run parameters');
  if (v.safeGenerate !== 'on' && v.safeGenerate !== 'off') throw new Error('Invalid safety mode');
  return {agent:{name:agent.name,version:agent.version}, input:v.input as Record<string,unknown>, params:v.params as Record<string,unknown>,safeGenerate:v.safeGenerate};
}
export function serviceIdempotencyKey(value: string): string {
  if (!/^[a-zA-Z0-9_-]{16,128}$/.test(value)) throw new Error('Invalid idempotency key');
  return value;
}
export function serviceEnvelope(type: string, data: unknown) { return {schemaVersion:1,type,data}; }

export function serviceExecutionId(value: string): string {
  if (!/^[a-fA-F0-9]{24}$/.test(value)) throw new Error('Invalid execution identity');
  return encodeURIComponent(value);
}
