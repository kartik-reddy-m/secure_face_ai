"""Prototype face descriptor generation."""

from __future__ import annotations

import cv2
import numpy as np


class FaceEmbedder:
    """Generate a normalized 512-value grayscale descriptor for this prototype."""

    def create_embedding(self, image_bytes: bytes, face: dict[str, int]) -> np.ndarray:
        """Crop a detected face and return a normalized 32 × 16 descriptor.

        This is suitable for the learning prototype only. It is not a
        production-grade biometric embedding model.
        """
        raw_image = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv2.imdecode(raw_image, cv2.IMREAD_GRAYSCALE)
        if image is None:
            raise ValueError("The uploaded file is not a supported image.")

        x, y = face["x"], face["y"]
        crop = image[y : y + face["height"], x : x + face["width"]]
        if crop.size == 0:
            raise ValueError("The detected face could not be cropped.")

        descriptor = cv2.resize(crop, (16, 32), interpolation=cv2.INTER_AREA)
        embedding = descriptor.astype(np.float32).reshape(-1)
        embedding -= embedding.mean()
        norm = np.linalg.norm(embedding)
        if norm == 0:
            raise ValueError("The face image has insufficient detail.")
        return embedding / norm
