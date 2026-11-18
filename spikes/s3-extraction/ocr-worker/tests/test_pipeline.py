"""Synthetic pipeline tests: no model imports, images or data from real people."""
import base64
import io
import unittest
from PIL import Image, ImageDraw
import pipeline_worker


def image_bytes(size=(700, 1000), orientation=None):
    image = Image.new("RGB", size, "white")
    draw = ImageDraw.Draw(image)
    for y in range(25, size[1] - 25, 35):
        draw.text((30, y), "SYNTHETIC TEST 123", fill="black")
    output = io.BytesIO()
    exif = Image.Exif()
    if orientation: exif[274] = orientation
    image.save(output, "PNG", exif=exif)
    return output.getvalue()


class PipelineTests(unittest.TestCase):
    def test_quality_failures_do_not_initialize_ocr(self):
        pipeline = pipeline_worker.Pipeline(engine_factory=lambda: self.fail("model loaded"))
        for data, reason in [(b"invalid", "archivo_invalido"), (image_bytes((100, 100)), "imagen_ilegible")]:
            with self.assertRaisesRegex(pipeline_worker.ContentFailure, reason):
                pipeline.prepare(data)

    def test_fallback_preserves_exif_transform_and_strips_metadata(self):
        pipeline = pipeline_worker.Pipeline(min_sharpness=0)
        value = pipeline.prepare(image_bytes(orientation=6))
        self.assertEqual(value["geometry"]["width"], 700)
        self.assertEqual(value["geometry"]["height"], 1000)
        image = Image.open(io.BytesIO(base64.b64decode(value["image"])))
        self.assertFalse(image.getexif())
        self.assertEqual(value["width"], 1000)
        self.assertEqual(value["height"], 700)
        self.assertEqual(len(value["geometry"]["toOriginal"]), 9)
        self.assertEqual(len(value["perceptualHash"]), 16)
        self.assertEqual(set(value["durations"]), {"E1", "E2", "E3"})

    def test_persistent_engine_returns_literal_lines_and_boxes(self):
        loads = []
        def factory():
            loads.append(1)
            return lambda image: iter([{"rec_texts": ["SYNTHETIC"], "rec_scores": [0.9], "rec_polys": [[[0, 0], [60, 0], [60, 20], [0, 20]]]}])
        pipeline = pipeline_worker.Pipeline(engine_factory=factory)
        for _ in range(2):
            value = pipeline.extract(image_bytes())
            self.assertEqual(value["lines"], [{"line_id": "L1", "text": "SYNTHETIC", "score": 0.9, "box": [[0.0, 0.0], [60.0, 0.0], [60.0, 20.0], [0.0, 20.0]]}])
        self.assertEqual(loads, [1])

    def test_blank_photo_fails_sharpness(self):
        output = io.BytesIO(); Image.new("RGB", (600, 600), "white").save(output, "PNG")
        with self.assertRaisesRegex(pipeline_worker.ContentFailure, "imagen_ilegible"):
            pipeline_worker.Pipeline().prepare(output.getvalue())

    def test_original_bytes_are_never_modified(self):
        source = image_bytes(); before = bytes(source)
        pipeline_worker.Pipeline(min_sharpness=0).prepare(source)
        self.assertEqual(source, before)

    def test_all_exif_orientations_map_back_inside_original_raster(self):
        import numpy as np
        for orientation in range(1, 9):
            value = pipeline_worker.Pipeline(min_sharpness=0).prepare(image_bytes(orientation=orientation))
            matrix = np.array(value["geometry"]["toOriginal"]).reshape(3, 3)
            for x, y in [(0, 0), (value["width"]-1, value["height"]-1)]:
                point = matrix @ np.array([x, y, 1]); point = point / point[2]
                self.assertTrue(-.01 <= point[0] <= 699.01)
                self.assertTrue(-.01 <= point[1] <= 999.01)

    def test_quadrilateral_is_rectified_with_an_invertible_transform(self):
        import cv2
        import numpy as np
        image = np.full((1200, 800, 3), 40, dtype=np.uint8)
        cv2.fillConvexPoly(image, np.array([[100, 80], [690, 120], [650, 1110], [70, 1090]]), (255, 255, 255))
        _, encoded = cv2.imencode(".png", image)
        value = pipeline_worker.Pipeline(min_sharpness=0).prepare(encoded.tobytes())
        self.assertEqual(value["flags"], ["perspective_corrected"])
        self.assertNotEqual(value["geometry"]["toOriginal"], [1, 0, 0, 0, 1, 0, 0, 0, 1])
        self.assertNotEqual(np.linalg.det(np.array(value["geometry"]["toOriginal"]).reshape(3, 3)), 0)

if __name__ == "__main__": unittest.main()
