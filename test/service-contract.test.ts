import {test} from 'node:test';
import assert from 'node:assert/strict';
import {serviceRunRequest,serviceIdempotencyKey,serviceEnvelope} from '../src/service-contract.js';
test('service preserves a durable key and ordered references without accepting malformed requests',()=>{
 const key='run_1234567890123456';assert.equal(serviceIdempotencyKey(key),key);assert.throws(()=>serviceIdempotencyKey('bad'));
 const request={agent:{name:'test',version:'v10'},input:{images:['second','first']},params:{},safeGenerate:'on'};
 assert.deepEqual(serviceRunRequest(request),request);assert.throws(()=>serviceRunRequest({...request,safeGenerate:'invalid'}));
 assert.deepEqual(serviceEnvelope('submitted',{executionId:'id'}),{schemaVersion:1,type:'submitted',data:{executionId:'id'}});
});
