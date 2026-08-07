"""HTTP entry point for the Face Verification service."""

import sqlite3

from fastapi import FastAPI, File, Form, HTTPException, UploadFile

from database.repository import initialize_database, save_registration
from face_detection.detector import FaceDetector
from face_verification.embedder import FaceEmbedder

app = FastAPI(
    title="Secure Face AI",
    version="0.1.0",
    description="Face verification with liveness detection.",
)
face_detector = FaceDetector()
face_embedder = FaceEmbedder()
initialize_database()


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    """Report that the API process is available."""
    return {"status": "ok"}


@app.post("/detect-face", tags=["face detection"])
async def detect_face(image: UploadFile = File(...)) -> dict[str, object]:
    """Detect faces in an uploaded JPEG, PNG, or other OpenCV-supported image."""
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Upload an image file.")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")

    try:
        faces = face_detector.detect(image_bytes)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return {"face_detected": bool(faces), "face_count": len(faces), "faces": faces}


@app.post("/register", status_code=201, tags=["registration"])
async def register_user(
    name: str = Form(..., min_length=1, max_length=100),
    consent: bool = Form(...),
    image: UploadFile = File(...),
) -> dict[str, object]:
    """Register a consenting person from an image containing exactly one face."""
    if not consent:
        raise HTTPException(
            status_code=400,
            detail="Registration requires the subject's explicit consent.",
        )
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Upload an image file.")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")

    try:
        faces = face_detector.detect(image_bytes)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    if len(faces) != 1:
        raise HTTPException(
            status_code=400,
            detail="Registration requires an image with exactly one detectable face.",
        )

    try:
        embedding = face_embedder.create_embedding(image_bytes, faces[0])
        registration_id = save_registration(name.strip(), embedding)
    except sqlite3.IntegrityError as error:
        raise HTTPException(status_code=409, detail="That name is already registered.") from error
    except Exception as error:
        raise HTTPException(status_code=400, detail="Unable to create a face embedding.") from error

    return {"id": registration_id, "name": name.strip(), "registered": True}
