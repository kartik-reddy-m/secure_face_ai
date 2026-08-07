"""HTTP entry point for the Face Verification service."""

from fastapi import FastAPI

app = FastAPI(
    title="Secure Face AI",
    version="0.1.0",
    description="Face verification with liveness detection.",
)


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    """Report that the API process is available."""
    return {"status": "ok"}
