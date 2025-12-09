# Telegram Sticker Maker

A Python tool with both **Web UI** and **CLI** that automatically crops transparent borders and resizes PNG images to 512px for optimal Telegram sticker quality.

## Features

- **Web Interface** - Modern drag-and-drop UI with post-editing capabilities
- **Post-Processing** - Adjust sharpness, brightness, contrast, color, and apply filters
- **Auto-crops transparent borders** - Removes excess padding by detecting content bounding box
- **High-quality resizing** - Uses Lanczos resampling for best image quality
- **Preserves transparency** - Maintains PNG alpha channel throughout processing
- **Batch processing** - CLI supports processing single files or entire folders
- **Smart scaling** - Resizes longest side to 512px while preserving aspect ratio

## Installation

This project uses [uv](https://github.com/astral-sh/uv) for dependency management.

```bash
# Dependencies are automatically managed by uv
uv run resize_sticker.py --help
```

## Usage

### Web Interface (Recommended)

Start the web server:

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then open your browser to http://localhost:8000

**Features:**
- Drag-and-drop file upload
- Real-time image preview
- Post-processing adjustments:
  - Sharpness slider (0.0 - 2.0)
  - Brightness slider (0.0 - 2.0)
  - Contrast slider (0.0 - 2.0)
  - Color saturation slider (0.0 - 2.0)
- Filters: Sharpen, Blur, Edge Enhance, Emboss, Contour, Detail, Find Edges, and more
- Gaussian blur with radius control (0-10)
- Download final image
- Mobile-responsive design

### Command Line Interface

#### Process a single image

```bash
uv run resize_sticker.py input.png
```

#### Process all images in a folder

```bash
uv run resize_sticker.py --folder ./my-stickers
```

#### Custom output directory

```bash
uv run resize_sticker.py input.png --output ./processed
uv run resize_sticker.py --folder ./stickers --output ./ready
```

## How it works

1. Loads PNG image and converts to RGBA (if needed)
2. Detects bounding box of non-transparent pixels
3. Crops image to remove transparent borders
4. Calculates scale to make longest side 512px
5. Resizes using Lanczos resampling (best quality)
6. Saves to `output/` folder preserving transparency

## Output

- Processed images are saved to `output/` directory by default
- Original filenames are preserved
- Images maintain transparency and optimal quality for Telegram

## Why 512px?

Telegram automatically resizes stickers larger than 512px, which can cause quality loss. By pre-processing images to exactly 512px, you maintain maximum control over quality and avoid Telegram's compression.
# telegram-sticker-editor
