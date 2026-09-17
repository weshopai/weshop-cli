import { Command } from 'commander';
import { submitRun, pollRun, estimatePower, APIRequestError } from '../client.js';
import { serviceRunRequest, serviceIdempotencyKey, serviceEnvelope, serviceExecutionId } from '../service-contract.js';
async function input() {
  const chunks: Buffer[]=[];let size=0;
  for await(const chunk of process.stdin) {size+=chunk.length;if(size>1024*1024) throw new Error('Request too large');chunks.push(Buffer.from(chunk));}
  return serviceRunRequest(JSON.parse(Buffer.concat(chunks).toString('utf8')));
}
async function output(type:string, action:()=>Promise<unknown>) {
  try { if (!process.env.WESHOP_API_KEY?.trim()) throw new APIRequestError('CLI_CREDENTIAL_MISSING', 'Service credential is required'); process.stdout.write(JSON.stringify(serviceEnvelope(type,await action()))+'\n'); }
  catch(error) { process.stdout.write(JSON.stringify({schemaVersion:1,type:'error',error:{code:error instanceof APIRequestError?error.code:'CLI_EXECUTION_FAILED',retryable:false}})+'\n');process.exitCode=1; }
}
export const serviceCmd=new Command('service').description('Structured service protocol; JSON input/output, no implicit retries');
serviceCmd.command('run').requiredOption('--idempotency-key <key>').action(async options=>output('submitted',async()=>submitRun(await input(),serviceIdempotencyKey(options.idempotencyKey))));
serviceCmd.command('status').argument('<executionId>').action(async id=>output('status',()=>pollRun(serviceExecutionId(id))));
serviceCmd.command('estimate').action(async()=>output('estimate',async()=>estimatePower(await input())));
