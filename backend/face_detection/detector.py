"""OpenCV-based face detection service."""

from __future__ import annotations

import cv2
import numpy as np


class FaceDetector:
    """Detect frontal faces and return their pixel bounding boxes."""

    def __init__(self) -> None:
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self._cascade = cv2.CascadeClassifier(cascade_path)
        if self._cascade.empty():
            raise RuntimeError("Unable to load the OpenCV face detection model.")

    def detect(self, image_bytes: bytes) -> list[dict[str, int]]:
        """Return each detected face as ``x``, ``y``, ``width``, and ``height``."""
        raw_image = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv2.imdecode(raw_image, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("The uploaded file is not a supported image.")

        grayscale = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self._cascade.detectMultiScale(
            grayscale,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(40, 40),
        )
        return [
            {"x": int(x), "y": int(y), "width": int(width), "height": int(height)}
            for x, y, width, height in faces
        ]
