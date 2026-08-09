"""OpenCV-based face detection service."""

from __future__ import annotations

import cv2
import numpy as np


class FaceDetector:
    """Detect frontal faces and return their pixel bounding boxes."""

    def __init__(self) -> None:
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self._cascade = cv2.CascadeClassifier(cascade_path)
        eye_cascade_path = cv2.data.haarcascades + "haarcascade_eye.xml"
        self._eye_cascade = cv2.CascadeClassifier(eye_cascade_path)
        if self._cascade.empty():
            raise RuntimeError("Unable to load the OpenCV face detection model.")
        if self._eye_cascade.empty():
            raise RuntimeError("Unable to load the OpenCV eye detection model.")

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

    def eyes_are_visible(self, image_bytes: bytes, face: dict[str, int]) -> bool:
        """Return whether at least one eye is visible inside a detected face."""
        raw_image = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv2.imdecode(raw_image, cv2.IMREAD_GRAYSCALE)
        if image is None:
            raise ValueError("The uploaded file is not a supported image.")

        x, y = face["x"], face["y"]
        region = image[y : y + face["height"] // 2, x : x + face["width"]]
        if region.size == 0:
            return False
        eyes = self._eye_cascade.detectMultiScale(
            region, scaleFactor=1.1, minNeighbors=4, minSize=(15, 15)
        )
        return len(eyes) > 0
