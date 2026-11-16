"""Regression for test-owned temporary directories, not old retained artifacts."""

import tempfile
import unittest
from unittest.mock import patch

from fixtures import private_root


class FixtureLifecycleTests(unittest.TestCase):
    def test_case_cleans_its_own_directory_after_success_or_failure(self):
        with tempfile.TemporaryDirectory(prefix="tuki-ocr-lifecycle-") as sandbox:
            for fail in (False, True):
                paths = []

                class Probe(unittest.TestCase):
                    def runTest(case):
                        root = private_root(case)
                        paths.append(root)
                        (root / "invented.txt").write_text("synthetic fixture")
                        if fail:
                            case.fail("intentional nested failure")

                with self.subTest(failing_case=fail), patch.object(tempfile, "tempdir", sandbox):
                    result = Probe().run()
                    self.assertEqual(len(result.failures), int(fail))
                    self.assertFalse(paths[0].exists(), "test case leaked its temporary directory")


if __name__ == "__main__":
    unittest.main()
