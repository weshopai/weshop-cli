import assert from "node:assert/strict";
import test from "node:test";
import { setCalculatePowerRequested } from "../src/execution-mode.js";

test("Kling and Wan model requests and validation preserve legacy behavior", async () => {
  const fetch = globalThis.fetch, log = console.log, error = console.error, exit = process.exit;
  const apiKey = process.env.WESHOP_API_KEY;
  process.env.WESHOP_API_KEY = "test-only";
  let counter = 0;
  let calls: {url:string;body:any}[] = [];
  globalThis.fetch = async (url, init) => {
    calls.push({url:String(url),body:JSON.parse(String(init?.body))});
    return new Response(JSON.stringify({success:true,data:{taskId:"t",executionId:"e",totalPower:20,type:"video"}}));
  };
  console.log = console.error = () => {};
  process.exit = ((code: number) => { throw new Error(`exit ${code}`); }) as typeof process.exit;
  const command = async (name:string) => {
    const module = await import(`../src/commands/${name}.js?sync=${counter++}`);
    return name === "kling" ? module.klingCmd : module.wanAiCmd;
  };
  const run = async (name:string,args:string[],estimate=false) => {
    calls=[]; setCalculatePowerRequested(estimate);
    await (await command(name)).parseAsync(["--prompt","fixture","--no-wait",...args],{from:"user"});
    assert.equal(calls.length,1);
    assert.match(calls[0].url,estimate ? /\/power-estimates$/ : /\/runs$/);
    assert.deepEqual(calls[0].body.agent,{name,version:"v1.0"});
    return calls[0].body;
  };
  const image="https://example.com/first.png", last="https://example.com/last.png";
  try {
    for (const estimate of [false,true]) {
      let body=await run("kling",["--image",image,last],estimate);
      assert.equal(body.params.modelName,"Kling_3_0"); assert.equal(body.params.duration,"5s");
      assert.deepEqual(body.params.images,[image,last]); assert.equal(body.input.originalImage,image);
      for (const model of ["Kling_2_6","Kling_2_5_Turbo","Kling_2_1_Master","Kling_2_1"]) {
        body=await run("kling",["--model",model,"--image",image],estimate);
        assert.equal(body.params.modelName,model); assert.equal(body.params.duration,"5s");
      }
      body=await run("kling",["--model","Kling_4_0_Reference"],estimate);
      assert.equal(body.params.duration,"10s"); assert.equal(body.params.resolution,"1080p"); assert.equal(body.params.images,undefined);
      body=await run("kling",["--model","Kling_4_0_Reference","--image",image,"--video","https://example.com/ref.mp4","--aspect-ratio","adaptive","--duration","30s","--resolution","720p"],estimate);
      assert.deepEqual(body.params.videos,["https://example.com/ref.mp4"]); assert.equal(body.params.duration,"30s");
      body=await run("kling",["--model","Kling_4_0_I2V","--first-frame",image,"--last-frame",last,"--middle-frames",JSON.stringify([{url:last,id:"middle"}])],estimate);
      assert.equal(body.params.firstFrame,image); assert.equal(body.params.lastFrame,last);
      assert.deepEqual(body.params.middleFrames,[{url:last,id:"middle"}]); assert.equal(body.params.images,undefined);
      await run("kling",["--model","Kling_4_0_I2V"],estimate);
      body=await run("wan-ai",["--image",image],estimate);
      assert.deepEqual(body.params,{textDescription:"fixture",duration:"5s",batchCount:1,images:[image]});
      assert.deepEqual(body.input,{originalImage:image});
      body=await run("wan-ai",["--model","Wan_3_0_Reference"],estimate);
      assert.equal(body.params.resolution,"720P"); assert.equal(body.params.aspectRatio,"adaptive"); assert.equal(body.params.generateAudio,"true");
      body=await run("wan-ai",["--model","Wan_3_0_Reference","--audio","https://example.com/ref.mp3","--generate-audio","false","--duration","30s"],estimate);
      assert.deepEqual(body.params.audios,["https://example.com/ref.mp3"]); assert.equal(body.params.generateAudio,"false");
      body=await run("wan-ai",["--model","Wan_3_0_I2V","--image",image,last,"--resolution","1080p","--duration","2s"],estimate);
      assert.deepEqual(body.params.images,[image,last]); assert.equal(body.params.resolution,"1080P");
      for (const [name,args] of [
        ["kling",[]], ["kling",["--image",image,last,"--model","Kling_2_1_Master"]],
        ["kling",["--model","Kling_4_0_Reference","--first-frame",image]],
        ["kling",["--model","Kling_4_0_Reference","--video","./local.mp4"]],
        ["kling",["--model","Kling_4_0_Reference","--generate-audio","false"]],
        ["kling",["--model","Kling_4_0_Reference","--duration","31s"]],
        ["kling",["--model","Kling_4_0_I2V","--image",image,"--first-frame",image]],
        ["kling",["--model","Kling_4_0_I2V","--middle-frames","{}"]],
        ["kling",["--model","Kling_4_0_I2V","--middle-frames",'[{}]']],
        ["kling",["--model","Kling_4_0_I2V","--middle-frames",'[{"url":"x","id":"m"},{"url":"y","id":"m"}]']],
        ["kling",["--model","Kling_4_0_I2V","--image",image,"--aspect-ratio","16:9"]],
        ["wan-ai",[]], ["wan-ai",["--image",image,last]],
        ["wan-ai",["--image",image,"--resolution","1080P"]],
        ["wan-ai",["--model","Wan_3_0_I2V"]],
        ["wan-ai",["--model","Wan_3_0_I2V","--image",image,"--audio","https://example.com/ref.mp3"]],
        ["wan-ai",["--model","Wan_3_0_I2V","--image",image,"--aspect-ratio","16:9"]],
        ["wan-ai",["--model","Wan_3_0_Reference","--audio","./ref.mp3"]],
        ["wan-ai",["--model","Wan_3_0_Reference","--duration","31s"]],
        ["wan-ai",["--model","Wan_3_0_Reference","--generate-audio","yes"]],
      ] as [string,string[]][]) {
        calls=[]; setCalculatePowerRequested(estimate);
        await assert.rejects((await command(name)).parseAsync(["--prompt","fixture",...args],{from:"user"}));
        assert.equal(calls.length,0,`invalid ${name} request performed network IO: ${args}`);
      }
    }
  } finally {
    globalThis.fetch=fetch; console.log=log; console.error=error; process.exit=exit; setCalculatePowerRequested(false);
    if (apiKey === undefined) delete process.env.WESHOP_API_KEY; else process.env.WESHOP_API_KEY=apiKey;
  }
});
