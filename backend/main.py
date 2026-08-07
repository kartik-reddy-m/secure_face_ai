"""HTTP entry point for the Face Verification service."""

from fastapi import FastAPI, File, HTTPException, UploadFile

from face_detection.detector import FaceDetector

app = FastAPI(
    title="Secure Face AI",
    version="0.1.0",
    description="Face verification with liveness detection.",
)
face_detector = FaceDetector()


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
