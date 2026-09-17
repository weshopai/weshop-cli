import { Command } from "commander";
import { executeRun } from "../run-helper.js";

export const gptImageCmd = new Command("gpt-image")
  .summary("GPT Image 2 and 2.5 image generator \u2014 create high-quality images, text-rich visuals, and product photography from prompts")
  .description(
    "Generate or edit images with GPT Image 2 or GPT Image 2.5.\n" +
    "\n" +
    "Model (--model): gpt-image-2 (default), gpt-image-2.5-flare, gpt-image-2.5-sunburst\n" +
    "Supports text-only generation or reference images: up to 5 for GPT Image 2, up to 16 for GPT Image 2.5. Reference images in your prompt as image 1, image 2, etc.\n" +
    "\n" +
    "Aspect ratio (--aspect-ratio): auto, 1:1, 2:3, 3:2, 4:3, 3:4 (default), 16:9, 9:16, 21:9; GPT Image 2.5 also supports 4:5 and 5:4\n" +
    "Image size (--image-size): 1K (default), 2K, 4K\n" +
    "Quality (--quality): low (default), medium, high; GPT Image 2.5 also supports xhigh and max\n" +
    "\n" +
    "Examples:\n" +
    "  weshop gpt-image --prompt 'Studio product photo of wireless earbuds on white seamless background'\n" +
    "  weshop gpt-image --model gpt-image-2.5-flare --prompt 'Product launch poster' --quality max --aspect-ratio 4:5\n" +
    "  weshop gpt-image --model gpt-image-2.5-sunburst --image ./a.png --image ./b.png --prompt 'Combine the product from image 1 with the lighting from image 2' --quality xhigh\n" +
    "  weshop gpt-image --model gpt-image-2.5-flare --prompt 'Product photo' --calculate-power"
  )
  .option("--model <name>", "Model: gpt-image-2 (default), gpt-image-2.5-flare, gpt-image-2.5-sunburst")
  .requiredOption("--prompt <text>", "Describe the image to generate or how to edit references")
  .option("--image <path|url...>", "Reference images — local file paths or URLs (GPT Image 2: up to 5; GPT Image 2.5: up to 16, optional)")
  .option("--aspect-ratio <ratio>", "Output aspect ratio (default: 3:4)")
  .option("--image-size <size>", "Output resolution: 1K (default), 2K, or 4K")
  .option("--quality <tier>", "Output quality: low (default), medium, high; GPT Image 2.5 also supports xhigh, max")
  .option("--batch <count>", "Number of images to generate, 1-16 (default: 1)", (v) => parseInt(v, 10), 1)
  .option("--task-name <name>", "Human-readable label for this run")
  .option("--no-wait", "Return immediately after submission; use 'weshop status <id>' to check later")
  .action(async (opts) => {
    const imageList: string[] | undefined = opts.image;
    const model = opts.model ?? "gpt-image-2";
    const is25 = model === "gpt-image-2.5-flare" || model === "gpt-image-2.5-sunburst";
    const quality = opts.quality ?? "low";
    const aspect = opts.aspectRatio ?? "3:4";
    const qualities = is25 ? ["low", "medium", "high", "xhigh", "max"] : ["low", "medium", "high"];
    const aspects = ["auto", "1:1", "2:3", "3:2", "4:3", "3:4", "16:9", "9:16", "21:9", ...(is25 ? ["4:5", "5:4"] : [])];
    const maxImages = is25 ? 16 : 5;
    let error: string | undefined;
    if (model !== "gpt-image-2" && !is25) error = `Unsupported model: ${model}`;
    else if (!qualities.includes(quality)) error = `Quality ${quality} is not supported for ${model}`;
    else if (!aspects.includes(aspect)) error = `Aspect ratio ${aspect} is not supported for ${model}`;
    else if (is25 && !["1K", "2K", "4K"].includes(opts.imageSize ?? "1K")) error = "Image size must be 1K, 2K, or 4K";
    else if (imageList && imageList.length > maxImages) error = `Maximum ${maxImages} images allowed for ${model}`;
    if (error) {
      console.error(`[error]\n  message: ${error}`);
      process.exit(1);
    }

    const params: Record<string, unknown> = {
      textDescription: opts.prompt,
      aspectRatio: opts.aspectRatio ?? "3:4",
      imageSize: opts.imageSize ?? "1K",
      quality: opts.quality ?? "low",
    };
    if (opts.model != null) params.modelName = opts.model;
    if (opts.batch != null) params.batchCount = opts.batch;

    const extraInput: Record<string, unknown> = {};
    if (opts.taskName) extraInput.taskName = opts.taskName;

    await executeRun(
      "gpt-image",
      "v1.0",
      { images: imageList, wait: opts.wait },
      params,
      extraInput
    );
  });
