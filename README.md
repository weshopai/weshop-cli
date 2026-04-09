# weshop-cli

One command. Studio-quality images and videos.

`weshop-cli` turns [WeShop AI](https://www.weshop.ai) into a command-line tool — virtual try-on, model swap, background replace, pose change, canvas expand, AI video generation, video enhancement, and much more. Built for developers and AI agents who want to generate production-ready fashion, product, and creative media without touching a browser.

```bash
# Virtual try-on: put a garment onto a model reference
weshop virtualtryon --image ./garment.png --model-image ./model-photo.png --gen-version weshopPro --prompt-mode auto --aspect-ratio 2:3

# Generate a cinematic video from an image using Kling
weshop kling --image ./scene.png --prompt 'Camera slowly pans across a misty forest' --model Kling_3_0 --duration 8s

# Remove background and replace with white
weshop removebg --image ./product.png --mask-type autoSubjectSegment --bg-hex '#ffffff'
```

## Why

- **One command = one task.** No curl, no JSON, no polling loops.
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

### Image editing (fashion & product)

| Command | What it does |
|---|---|
| `virtualtryon` | Put a garment onto a generated model with optional model/background references |
| `aimodel` | Replace the model, swap the scene or background while keeping the garment |
| `aiproduct` | Replace or enhance the background around a product |
| `aipose` | Change the human pose while keeping the garment unchanged |
| `expandimage` | Expand the canvas — AI fills the new area to blend naturally |
| `removebg` | Remove the background or replace it with a solid color |
| `flat-lay` | Generate flat-lay product shots |
| `ai-ghost-mannequin-generator` | Ghost mannequin effect for apparel photography |
| `outfit-generator` | Generate outfit combinations |
| `ai-clothes-changer` | Change clothing on a model |

### AI image generation

| Command | What it does |
|---|---|
| `seedream` | Generate or edit images with Seedream 5.0 by ByteDance (text + up to 14 reference images) |
| `midjourney` | Generate images with Midjourney v6.1, v7, or Niji 6 |
| `grok-imagine` | Generate high-resolution images with xAI Aurora (Grok Imagine) |
| `z-image` | Text-to-image generation with Z-Image by Alibaba |
| `qwen-image-edit` | Edit or generate images with natural language using Qwen (up to 5 reference images) |
| `firered-image-edit` | Edit or generate images with FireRed open-source model (up to 3 reference images) |

### AI video generation

| Command | What it does |
|---|---|
| `kling` | Generate cinematic videos from images using Kling (v2.1–v3.0, 3s–15s, optional audio) |
| `seedance` | Generate AI videos with Seedance 2.0 by ByteDance (up to 15s, optional audio) |
| `sora-2` | Generate cinematic videos with realistic physics using OpenAI Sora 2 |
| `wan-ai` | Generate AI videos from images and text using Wan AI |
| `grok-imagine-video` | Generate cinematic AI videos with native audio using xAI |
| `ai-bikini-video` | AI video generation for swimwear/fashion scenes |
| `ai-image-animation` | Animate a still image into a short video |

### Video editing & enhancement

| Command | What it does |
|---|---|
| `ai-video-enhancer` | Upscale and enhance video quality (up to 4K) |
| `video-watermark-remover` | Remove watermarks from videos |
| `replace-face-in-video-online-free` | Replace a face in a video |
| `remove-subtitles-from-video-online-free` | Remove subtitles from a video |
| `ai-text-remover-from-video` | Remove text overlays from a video |
| `logo-remover-from-video` | Remove logos from a video |
| `gemini-watermark-remover` | Remove watermarks using Gemini |
| `remove-text-from-video-online-free` | Remove text from a video |
| `video-upscaler-online-free` | Upscale video resolution |
| `video-resolution-enhancer-online-free` | Enhance video resolution |
| `improve-video-quality-online-free` | General video quality improvement |
| `free-online-video-quality-enhancer` | Free video quality enhancement |
| `free-4k-video-upscaler` | Upscale video to 4K |

### Creative & fun image tools

| Command | What it does |
|---|---|
| `face-forge` | Face swap / face replacement |
| `ai-face-merge` | Merge two faces together |
| `gender-swap` | Swap gender in a photo |
| `ai-aging` | Age a person in a photo |
| `ai-hairstyle-changer` | Change hairstyle |
| `ai-hair-color-changer` | Change hair color |
| `hair-color-try-on` | Try on a hair color |
| `buzz-cut-ai` | Apply a buzz cut |
| `bald-filter` | Apply a bald filter |
| `bangs-filter` | Add bangs |
| `braces-filter` | Add braces |
| `skin-color-changer` | Change skin tone |
| `ai-selfie` | Generate an AI selfie |
| `ai-photoshoot` | Generate a professional AI photoshoot |
| `ai-poster` | Generate an AI poster |
| `ai-poster-from-images` | Create a poster from reference images |
| `image-to-sketch` | Convert a photo to a sketch |
| `anime-image-converter` | Convert a photo to anime style |
| `ghibli-art-create` | Convert a photo to Ghibli art style |
| `chibi-maker` | Turn a photo into a chibi character |
| `2d-to-3d-image-converter` | Convert a 2D image to 3D |
| `ai-3d-rendering` | Generate a 3D rendering |
| `ps2-filter` | Apply a PS2-era filter |
| `wild-graffiti` | Apply a graffiti art style |
| `ai-spray-paint` | Apply a spray paint effect |
| `image-mixer` | Mix two images together |
| `ai-image-combiner` | Combine multiple images |
| `ai-collage-maker` | Create a collage from images |
| `remove-filter-from-photo` | Remove a filter from a photo |
| `square-face-icon-generator` | Generate a square face icon |
| `mugshot-creator` | Create a mugshot-style photo |

### Character & avatar generators

| Command | What it does |
|---|---|
| `celeb-ai` | Generate a celebrity-style photo |
| `ai-babe` | Generate a fashion model photo |
| `free-ai-girlfriend-generator` | Generate an AI companion photo |
| `baby-face-generator` | Generate a baby face from two parents |
| `ai-dog` | Generate an AI dog photo |
| `ai-group-photo-generator` | Generate a group photo |
| `ai-action-figure-generators` | Turn a photo into an action figure |
| `sonic-oc` | Generate a Sonic OC |
| `demon-slayer-oc-maker` | Generate a Demon Slayer OC |
| `sprunki-oc-maker` | Generate a Sprunki OC |
| `murder-drones-oc` | Generate a Murder Drones OC |
| `stardew-valley-portrait-maker` | Generate a Stardew Valley portrait |
| `random-animal-generator` | Generate a random animal image |
| `ai-elf` | Generate an elf character |
| `ai-werewolf` | Generate a werewolf character |
| `ai-zombie` | Generate a zombie character |
| `ai-christmas-photo` | Generate a Christmas-themed photo |
| `brat-generator` | Generate a brat-style photo |
| `futuristic-elegance` | Generate a futuristic elegance portrait |
| `pregnant-ai` | Generate a pregnancy photo |
| `fat-ai` | Apply a weight-change filter |

### Swimwear & fashion try-on

| Command | What it does |
|---|---|
| `bikini-try-on` | Virtual bikini try-on |
| `swimsuit-try-on-haul` | Swimsuit try-on haul |
| `personalized-swimsuit` | Generate a personalized swimsuit photo |
| `custom-bikini` | Generate a custom bikini photo |
| `ai-swimsuit-model` | Generate a swimsuit model photo |
| `ai-bikini-model` | Generate a bikini model photo |
| `ai-bikini-photo-editor` | Edit a bikini photo |
| `photo-to-bikini-ai` | Convert a photo to a bikini photo |

### Other tools

| Command | What it does |
|---|---|
| `ai-translate` | Translate text in an image |
| `ai-tattoo-generator` | Generate a tattoo design |
| `ai-flag-generator` | Generate a custom flag |
| `ai-landscape-design-free` | Generate a landscape design |
| `ai-room-planner` | Generate a room layout |
| `see-through-clothes-fitler` | See-through clothing filter |
| `clothing-magic-remover` | Remove clothing in a photo |
| `dress-remover-magic-eraser` | Remove a dress in a photo |
| `ai-xray-clothes` | X-ray clothing filter |
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

## Example: AI video generation

```bash
# Kling — cinematic video with audio
weshop kling \
  --image ./scene.png \
  --prompt 'Camera slowly pans across a misty forest' \
  --model Kling_3_0 \
  --duration 8s \
  --generate-audio true

# Seedance — ByteDance video model
weshop seedance \
  --image ./photo.png \
  --prompt 'Person walks in slow motion' \
  --model Seedance_15_Pro \
  --duration 8s \
  --aspect-ratio 16:9

# Sora 2 — OpenAI video model
weshop sora-2 \
  --image ./landscape.png \
  --prompt 'Time-lapse of clouds moving' \
  --duration 8s
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
weshop kling --image ./scene.png --prompt 'Ocean waves' --no-wait
# [submitted]
#   executionId: abc123
# [info]
#   message: Use 'weshop status abc123' to check progress

weshop status abc123
# [result]
#   agent: kling v1.0
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
