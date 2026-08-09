import { useState } from "react";
import { ApiClientError, registerUser } from "../api/client";
import { CameraView } from "../components/CameraView";
import { StatusBanner } from "../components/StatusBanner";
import { useFaceDetection } from "../hooks/useFaceDetection";
import { useWebcam } from "../hooks/useWebcam";
import type { RegisterResponse } from "../types/api";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RegisterResponse | null>(null);

  const { videoRef, canvasRef, isReady, error: cameraError, captureFrame } =
    useWebcam();
  const { faces, faceCount, detectionError } = useFaceDetection({
    enabled: !isSubmitting && !result,
    isReady,
    captureFrame,
  });

  const canSubmit =
    name.trim().length > 0 &&
    consent &&
    faceCount === 1 &&
    isReady &&
    !isSubmitting;

  async function handleRegister() {
    setError(null);
    setIsSubmitting(true);

    try {
      const frame = await captureFrame();
      const response = await registerUser(name.trim(), true, frame);
      setResult(response);
    } catch (registerError) {
      if (registerError instanceof ApiClientError) {
        setError(registerError.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setName("");
    setConsent(false);
    setResult(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Register User</h1>
        <p className="mt-1 text-sm text-slate-400">
          Register a consenting person with exactly one detectable face.
        </p>
      </div>

      {result ? (
        <div className="space-y-4">
          <StatusBanner variant="success">
            Successfully registered <strong>{result.name}</strong> (ID:{" "}
            {result.id}).
          </StatusBanner>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
          >
            Register another user
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-200">Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={100}
                  placeholder="Enter full name"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-sky-500"
                />
              </label>

              <label className="flex items-start gap-3 rounded-lg border border-slate-700 bg-slate-900/60 p-4">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-slate-300">
                  I confirm this person has explicitly consented to biometric
                  processing and registration.
                </span>
              </label>
            </div>

            <CameraView
              videoRef={videoRef}
              canvasRef={canvasRef}
              faces={faces}
              isReady={isReady}
              error={cameraError}
            />
          </div>

          {faceCount === 0 && isReady && (
            <StatusBanner variant="warning">
              No face detected. Position one person in the frame.
            </StatusBanner>
          )}
          {faceCount > 1 && (
            <StatusBanner variant="warning">
              Multiple faces detected. Registration requires exactly one face.
            </StatusBanner>
          )}
          {faceCount === 1 && consent && (
            <StatusBanner variant="success">
              Ready to capture and register.
            </StatusBanner>
          )}
          {detectionError && (
            <StatusBanner variant="warning">{detectionError}</StatusBanner>
          )}
          {error && <StatusBanner variant="error">{error}</StatusBanner>}

          <button
            type="button"
            onClick={() => void handleRegister()}
            disabled={!canSubmit}
            className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {isSubmitting ? "Registering..." : "Capture & Register"}
          </button>
        </>
      )}
    </div>
  );
}
