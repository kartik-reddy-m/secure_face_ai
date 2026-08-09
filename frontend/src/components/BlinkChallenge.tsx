import { useState } from "react";
import { checkLiveness } from "../api/client";
import { useFaceDetection } from "../hooks/useFaceDetection";
import { useWebcam } from "../hooks/useWebcam";
import { CameraView } from "./CameraView";
import { StatusBanner } from "./StatusBanner";

const STEPS = [
  {
    key: "openEyesBefore" as const,
    title: "Step 1 of 3",
    instruction: "Look at the camera with your eyes open.",
  },
  {
    key: "closedEyes" as const,
    title: "Step 2 of 3",
    instruction: "Blink and hold your eyes closed briefly.",
  },
  {
    key: "openEyesAfter" as const,
    title: "Step 3 of 3",
    instruction: "Open your eyes again and hold still.",
  },
];

type FrameKey = (typeof STEPS)[number]["key"];

interface BlinkChallengeProps {
  onComplete: (token: string) => void;
}

export function BlinkChallenge({ onComplete }: BlinkChallengeProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [frames, setFrames] = useState<Partial<Record<FrameKey, Blob>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eyeStates, setEyeStates] = useState<boolean[] | null>(null);

  const { videoRef, canvasRef, isReady, error: cameraError, captureFrame } =
    useWebcam();
  const { faces, faceCount, detectionError } = useFaceDetection({
    enabled: !isSubmitting,
    isReady,
    captureFrame,
  });

  const currentStep = STEPS[stepIndex];
  const capturedCount = Object.keys(frames).length;
  const canCapture = isReady && faceCount === 1 && !isSubmitting;

  async function handleCapture() {
    setError(null);
    try {
      const frame = await captureFrame();
      const nextFrames = { ...frames, [currentStep.key]: frame };
      setFrames(nextFrames);

      if (stepIndex < STEPS.length - 1) {
        setStepIndex(stepIndex + 1);
        return;
      }

      setIsSubmitting(true);
      const result = await checkLiveness({
        openEyesBefore: nextFrames.openEyesBefore!,
        closedEyes: nextFrames.closedEyes!,
        openEyesAfter: nextFrames.openEyesAfter!,
      });

      if (!result.live || !result.liveness_token) {
        setEyeStates(result.eye_states);
        setError(
          "Blink challenge failed. Follow the sequence: open → closed → open.",
        );
        setFrames({});
        setStepIndex(0);
        return;
      }

      onComplete(result.liveness_token);
    } catch (captureError) {
      setError(
        captureError instanceof Error
          ? captureError.message
          : "Unable to complete liveness check.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRetry() {
    setFrames({});
    setStepIndex(0);
    setError(null);
    setEyeStates(null);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-sky-300">{currentStep.title}</p>
        <h3 className="text-lg font-semibold text-white">
          {currentStep.instruction}
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          Captured frames: {capturedCount} / {STEPS.length}
        </p>
      </div>

      <CameraView
        videoRef={videoRef}
        canvasRef={canvasRef}
        faces={faces}
        isReady={isReady}
        error={cameraError}
      />

      {faceCount === 0 && isReady && (
        <StatusBanner variant="warning">
          No face detected. Center your face in the frame.
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
      {eyeStates && (
        <StatusBanner variant="info">
          Detected eye states:{" "}
          {eyeStates.map((open) => (open ? "open" : "closed")).join(" → ")}
        </StatusBanner>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void handleCapture()}
          disabled={!canCapture}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {stepIndex < STEPS.length - 1 ? "Capture frame" : "Submit liveness check"}
        </button>
        {(capturedCount > 0 || error) && (
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
          >
            Restart challenge
          </button>
        )}
      </div>
    </div>
  );
}
