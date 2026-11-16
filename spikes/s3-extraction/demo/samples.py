"""Generate non-personal synthetic receipts in memory, never corpus fixtures."""
import io
from PIL import Image, ImageDraw, ImageFilter, ImageFont

CASES = ("legible", "degraded", "incomplete")


def sample_png(case):
    if case not in CASES:
        raise ValueError("unknown_sample")
    image = Image.new("RGB", (920, 900), "white")
    draw = ImageDraw.Draw(image)
    try:
        font = ImageFont.truetype("consola.ttf", 29)
        title = ImageFont.truetype("consolab.ttf", 44)
    except OSError:
        font = ImageFont.load_default(size=28)
        title = ImageFont.load_default(size=42)
    draw.text((70, 55), "TUKI / PRUEBA", fill="black", font=title)
    draw.text((70, 125), "EJEMPLO SINTETICO - SIN VALOR FISCAL", fill="black", font=font)
    draw.line((70, 190, 850, 190), fill="black", width=2)
    lines = {
        "legible": ["2 x 1.250,00 LECHE 2.500,00", "1 x 850,00 PAN 850,00", "TOTAL 3.350,00"],
        "degraded": ["2 x 1.250,00 LECHE 2.500,00", "? x 850,00 PAN 850,00", "TOTAL 3.350,00"],
        "incomplete": ["LECHE", "PAN", "IMPORTE ILEGIBLE", "TOTAL ???"],
    }[case]
    for index, line in enumerate(lines):
        draw.text((70, 250 + index * 90), line, fill="black", font=font)
    draw.text((70, 760), "SIN DATOS PERSONALES / DEMO LOCAL", fill="black", font=font)
    if case == "degraded":
        image = image.filter(ImageFilter.GaussianBlur(0.7))
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()
