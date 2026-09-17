import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';

function command(args: string[], env: Record<string,string>, input = '') {
 return new Promise<{code:number|null;stdout:string;stderr:string}>((resolve,reject)=>{
  const child=spawn(process.execPath,['--import','tsx','src/index.ts','service',...args],{env:{...process.env,WESHOP_API_KEY:'',...env},stdio:['pipe','pipe','pipe']});
  let stdout='',stderr='';
  const timer=setTimeout(()=>child.kill('SIGKILL'),10000);
  child.stdout.on('data',chunk=>stdout+=chunk);child.stderr.on('data',chunk=>stderr+=chunk);
  child.on('error',err=>{clearTimeout(timer);reject(err)});
  child.on('close',code=>{clearTimeout(timer);resolve({code,stdout,stderr})});
  child.stdin.end(input);
 });
}
test('service missing credential returns one JSON error without the legacy exit message',async()=>{
 const result=await command(['status','0123456789abcdef01234567'],{});
 assert.equal(result.code,1);assert.equal(result.stderr,'');
 assert.equal(JSON.parse(result.stdout).error.code,'CLI_CREDENTIAL_MISSING');
});
test('service status rejects path injection and queries valid execution exactly once',async()=>{
 const paths:string[]=[];
 const server=createServer((req,res)=>{paths.push(req.url!);res.setHeader('Content-Type','application/json');res.end(JSON.stringify({success:true,data:{executions:[]}}))});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const addr=server.address() as {port:number};
 const env={WESHOP_API_KEY:'fixture-only',WESHOP_BASE_URL:`http://127.0.0.1:${addr.port}/openapi`};
 try {
  for(const id of ['../models','abc?x=1','abc/def','%2e%2e']){
   const result=await command(['status',id],env);assert.equal(result.code,1);assert.equal(JSON.parse(result.stdout).type,'error');
  }
  assert.deepEqual(paths,[]);
  const result=await command(['status','0123456789abcdef01234567'],env);
  assert.equal(result.code,0);assert.equal(JSON.parse(result.stdout).type,'status');
  assert.deepEqual(paths,['/openapi/agent/runs/0123456789abcdef01234567']);
 } finally {server.closeAllConnections();await new Promise<void>((resolve,reject)=>server.close(err=>err?reject(err):resolve()))}
});
