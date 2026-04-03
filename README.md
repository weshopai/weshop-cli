# weshop-cli

One command. Studio-quality images.

`weshop-cli` turns [WeShop AI](https://www.weshop.ai) into a command-line tool — virtual try-on, model swap, background replace, pose change, canvas expand, and more. Built for developers and AI agents who want to generate production-ready fashion & product images without touching a browser.

```bash
# Virtual try-on: put a garment onto a model reference
weshop virtualtryon --image ./garment.png --model-image ./model-photo.png --gen-version weshopPro --prompt-mode auto --aspect-ratio 2:3

# Replace the background in a fashion photo, keep the clothing
weshop aimodel --image ./fashion.png --mask-type autoApparelSegment --generation-mode referToOrigin --location-id 6000372

# Remove background and replace with white
weshop removebg --image ./product.png --mask-type autoSubjectSegment --bg-hex '#ffffff'
```

## Why

- **One command = one image task.** No curl, no JSON, no polling loops.
- **Agent-friendly.** Structured `[key]: value` output that any LLM agent can parse. No colors, no spinners, no noise.
- **Local files just work.** Pass a local path to `--image` and it auto-uploads. Same file won't upload twice (cached by path + size + mtime).
- **Blocking or async.** Waits for results by default. Add `--no-wait` to get the execution ID and poll later with `weshop status`.

## Quick start

Get your API key at [open.weshop.ai/authorization/apikey](https://open.weshop.ai/authorization/apikey), then:

```bash
npm install -g weshop-cli
export WESHOP_API_KEY=<your-key>
weshop --help
```

### For developers

```bash
git clone https://github.com/weshopai/weshop-cli.git
cd weshop-cli
npm install
export WESHOP_API_KEY=<your-key>
npx tsx src/index.ts --help
```

## Commands

Run `weshop <command> --help` to see each command's full parameters, enum values, and examples.

| Command | What it does |
|---|---|
| `virtualtryon` | Put a garment onto a generated model with optional model/background references |
| `aimodel` | Replace the model, swap the scene or background while keeping the garment |
| `aiproduct` | Replace or enhance the background around a product |
| `aipose` | Change the human pose while keeping the garment unchanged |
| `expandimage` | Expand the canvas — AI fills the new area to blend naturally |
| `removebg` | Remove the background or replace it with a solid color |
| `upload` | Upload a local image and get a reusable URL |
| `status` | Check the status of a run by execution ID |
| `info` | List available preset IDs (scenes, models, background colors) |

## Example: virtual try-on

```bash
weshop virtualtryon \
  --image ./garment.png \
  --model-image ./model-photo.png \
  --gen-version weshopPro \
  --prompt-mode auto \
  --aspect-ratio 2:3 \
  --batch 2
```

Output:

```
[image]
  imageUrl: https://ai-global-image.weshop.com/...

[submitted]
  executionId: abc123

[result]
  agent: virtualtryon v1.0
  executionId: abc123
  status: Success
  imageCount: 2
  image[0]:
    status: Success
    url: https://ai-global-image.weshop.com/...
  image[1]:
    status: Success
    url: https://ai-global-image.weshop.com/...
```

## Example: use preset IDs for best results

For `aimodel` and `aiproduct`, using preset scene/model IDs gives the best quality. List them with `info`:

```bash
# See available scenes and models
weshop info aimodel

# Use a preset scene
weshop aimodel \
  --image ./model.png \
  --mask-type autoApparelSegment \
  --generation-mode referToOrigin \
  --location-id 6000372 \
  --batch 2
```

## Async mode

Don't want to wait? Add `--no-wait` and poll later:

```bash
weshop aipose --image ./model.png --prompt 'arms crossed' --batch 1 --no-wait
# [submitted]
#   executionId: abc123
# [info]
#   message: Use 'weshop status abc123' to check progress

weshop status abc123
# [result]
#   agent: aipose v1.0
#   status: Success
#   ...
```

## For AI agents

The output is designed to be easily parsed by automated tools and AI agents:

- Structured `[section]` + `key: value` format — no ANSI colors, no progress bars
- Every field is labeled and parseable
- `--no-wait` + `weshop status` enables non-blocking workflows
- `--help` on each command documents every parameter, enum value, and constraint
- Local images are auto-uploaded and cached — no separate upload step needed

## License

Apache-2.0
