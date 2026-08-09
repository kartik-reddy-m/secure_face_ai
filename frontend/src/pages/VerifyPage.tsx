import { useState } from "react";
import { ApiClientError, verifyUser } from "../api/client";
import { BlinkChallenge } from "../components/BlinkChallenge";
import { CameraView } from "../components/CameraView";
import { StatusBanner } from "../components/StatusBanner";
import { useFaceDetection } from "../hooks/useFaceDetection";
import { useWebcam } from "../hooks/useWebcam";
import type { VerifyResponse } from "../types/api";

type VerifyPhase = "liveness" | "verify" | "result";

export function VerifyPage() {
  const [phase, setPhase] = useState<VerifyPhase>("liveness");
  const [livenessToken, setLivenessToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResponse | null>(null);

  const { videoRef, canvasRef, isReady, error: cameraError, captureFrame } =
    useWebcam({ enabled: phase === "verify" });
  const { faces, faceCount, detectionError } = useFaceDetection({
    enabled: phase === "verify" && !isSubmitting,
    isReady,
    captureFrame,
  });

  function handleLivenessComplete(token: string) {
    setLivenessToken(token);
    setPhase("verify");
    setError(null);
  }

  async function handleVerify() {
    if (!livenessToken) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const frame = await captureFrame();
      const response = await verifyUser(livenessToken, frame);
      setResult(response);
      setPhase("result");
    } catch (verifyError) {
      if (verifyError instanceof ApiClientError) {
        setError(verifyError.message);
        if (verifyError.status === 403) {
          setPhase("liveness");
          setLivenessToken(null);
        }
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRestart() {
    setPhase("liveness");
    setLivenessToken(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Verify Identity</h1>
        <p className="mt-1 text-sm text-slate-400">
          Complete liveness detection, then capture a verification photo.
        </p>
      </div>

      {phase === "liveness" && (
        <BlinkChallenge onComplete={handleLivenessComplete} />
      )}

      {phase === "verify" && (
        <div className="space-y-4">
          <StatusBanner variant="success">
            Liveness check passed. Capture a verification photo within 2 minutes.
          </StatusBanner>

          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            faces={faces}
            isReady={isReady}
            error={cameraError}
          />

          {faceCount === 0 && isReady && (
            <StatusBanner variant="warning">
              No face detected. Center your face before capturing.
            </StatusBanner>
          )}
          {faceCount > 1 && (
            <StatusBanner variant="warning">
              Multiple faces detected. Only one person should be visible.
            </StatusBanner>
          )}
          {detectionError && (
            <StatusBanner variant="warning">{detectionError}</StatusBanner>
          )}
          {error && <StatusBanner variant="error">{error}</StatusBanner>}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleVerify()}
              disabled={!isReady || faceCount !== 1 || isSubmitting}
              className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {isSubmitting ? "Verifying..." : "Capture & Verify"}
            </button>
            <button
              type="button"
              onClick={handleRestart}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
            >
              Restart liveness
            </button>
          </div>
        </div>
      )}

      {phase === "result" && result && (
        <div className="space-y-4">
          <StatusBanner variant={result.verified ? "success" : "error"}>
            {result.verified ? (
              <>
                Verified as <strong>{result.match?.name}</strong>. Similarity:{" "}
                {result.similarity.toFixed(4)} (threshold: {result.threshold})
              </>
            ) : (
              <>
                Not verified. Best similarity: {result.similarity.toFixed(4)}{" "}
                (threshold: {result.threshold})
              </>
            )}
          </StatusBanner>
          <button
            type="button"
            onClick={handleRestart}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
          >
            Verify again
          </button>
        </div>
      )}
    </div>
  );
}
