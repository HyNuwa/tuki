"""Rebuild the authored geometric PWA icons with the existing Pillow runtime."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1] / "public"
for size in (192, 512):
    image = Image.new("RGB", (size, size), "#163d31")
    draw = ImageDraw.Draw(image)
    scale = size / 64
    points = [(20, 16), (44, 16), (44, 50), (38, 46), (32, 50), (26, 46), (20, 50)]
    draw.polygon([(int(x * scale), int(y * scale)) for x, y in points], fill="#dbeaac")
    for y, end in ((25, 38), (32, 38), (39, 33)):
        draw.line((int(26 * scale), int(y * scale), int(end * scale), int(y * scale)),
                  fill="#163d31", width=int(3 * scale))
    image.save(root / f"icon-{size}.png")
