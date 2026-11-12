import assert from 'node:assert/strict';
import test from 'node:test';
import { printPollResult } from '../src/printer.js';

function output(status: string, results: {status: string; error?: string; video?: string}[]) {
  const lines: string[] = [];
  const original = console.log;
  console.log = (...args) => { lines.push(args.join(' ')); };
  try { printPollResult({agentName:'kling',agentVersion:'v1.0',executions:[{executionId:'fixture',status,result:results}]}); }
  finally { console.log = original; }
  return lines.join('\n');
}
test('failed media shows the server reason and the failing item', () => {
  const text = output('Failed', [{status:'Failed',error:'Video 2: received 12fps; required 24-60fps'}]);
  assert.match(text, /message: Video 2: received 12fps; required 24-60fps/);
  assert.match(text, /error: Video 2:/);
  assert.doesNotMatch(text, /url: \s*$/);
});
test('partial success keeps the successful URL and the failed item reason', () => {
  const text = output('Success', [{status:'Success',video:'https://example.com/out.mp4'}, {status:'Failed',error:'Image dimensions too small'}]);
  assert.match(text, /https:\/\/example.com\/out.mp4/);
  assert.match(text, /video\[1\]:\n    status: Failed\n    error: Image dimensions too small/);
});
test('old servers without failure detail retain the fallback', () => {
  assert.match(output('Failed', [{status:'Failed'}]), /message: Generation failed/);
});

test('MiniMax total-reference limit is reported before uploading or submitting', async () => {
  const { spawnSync } = await import('node:child_process');
  const args = ['--import','tsx','src/index.ts','minimax-h3','--prompt','fixture','--image',
    ...Array.from({length:9},(_,i)=>`https://example.com/image-${i}.png`),
    '--video','https://example.com/a.mp4','https://example.com/b.mp4','https://example.com/c.mp4',
    '--audio','https://example.com/a.mp3'];
  const result = spawnSync(process.execPath,args,{encoding:'utf8',env:{...process.env,WESHOP_API_KEY:''},timeout:10000});
  assert.equal(result.status,1);
  assert.match(result.stderr,/at most 12 media files total/);
  assert.doesNotMatch(result.stderr,/API key not found/);
});
