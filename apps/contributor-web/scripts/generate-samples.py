"""Generate public synthetic-only examples, reusing the working demo's fixture."""
import io
from pathlib import Path
import sys
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT.parents[1] / "spikes" / "s3-extraction" / "demo"))
from samples import sample_png

target = ROOT / "public" / "samples"
target.mkdir(exist_ok=True)
(target / "legible.png").write_bytes(sample_png("legible"))
image = Image.open(io.BytesIO(sample_png("legible"))).convert("RGB")
draw = ImageDraw.Draw(image)
draw.rectangle((60, 210, 890, 700), fill="white")
try:
    font = ImageFont.truetype("consola.ttf", 29)
except OSError:
    font = ImageFont.load_default(size=28)
for index, text in enumerate([
    "2 x 1.250,00 L3CHE 2.500,00",
    "? x 850,00 PAN 850,00",
    "GALLETAS IMPORTE ?8O,OO",
    "LINEA SIN CLASIFICAR ???",
    "TOTAL 9.999,00",
]):
    draw.text((70, 230 + index * 80), text, fill="black", font=font)
image.save(target / "errors.png", format="PNG")
