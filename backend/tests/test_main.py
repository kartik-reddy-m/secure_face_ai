"""Automated unit tests for the Secure Face AI FastAPI backend."""

import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient

from anti_spoof.liveness import LivenessTokenStore
from main import app

client = TestClient(app)


def create_dummy_jpeg() -> bytes:
    """Create a minimal valid JPEG image in memory for testing."""
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    _, encoded = cv2.imencode(".jpg", img)
    return encoded.tobytes()


def test_health_endpoint() -> None:
    """Verify health endpoint returns status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_users_endpoint() -> None:
    """Verify list users endpoint returns count and users array."""
    response = client.get("/users")
    assert response.status_code == 200
    data = response.json()
    assert "count" in data
    assert "users" in data
    assert isinstance(data["users"], list)


def test_delete_non_existent_user() -> None:
    """Verify deleting non-existent user ID returns 404."""
    response = client.delete("/users/9999999")
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found."


def test_detect_face_invalid_file() -> None:
    """Verify uploading non-image file returns 415."""
    response = client.post(
        "/detect-face",
        files={"image": ("test.txt", b"not an image", "text/plain")},
    )
    assert response.status_code == 415


def test_detect_face_empty_file() -> None:
    """Verify uploading an empty file returns 400."""
    response = client.post(
        "/detect-face",
        files={"image": ("test.jpg", b"", "image/jpeg")},
    )
    assert response.status_code == 400


def test_register_without_consent() -> None:
    """Verify registration without explicit consent returns 400."""
    jpeg_bytes = create_dummy_jpeg()
    response = client.post(
        "/register",
        data={"name": "Test User", "consent": "false"},
        files={"image": ("test.jpg", jpeg_bytes, "image/jpeg")},
    )
    assert response.status_code == 400
    assert "consent" in response.json()["detail"].lower()


def test_liveness_token_store() -> None:
    """Test issuing and consuming single-use liveness tokens."""
    store = LivenessTokenStore(lifetime_seconds=5)
    token = store.issue()
    assert isinstance(token, str)
    assert len(token) > 0

    # Token can be consumed once
    assert store.consume(token) is True
    # Second consumption fails
    assert store.consume(token) is False
