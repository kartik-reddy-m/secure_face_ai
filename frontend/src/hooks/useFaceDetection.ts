import { useEffect, useRef, useState } from "react";
import { detectFace } from "../api/client";
import type { FaceBox } from "../types/api";

interface UseFaceDetectionOptions {
  enabled: boolean;
  isReady: boolean;
  captureFrame: () => Promise<Blob>;
  intervalMs?: number;
}

export function useFaceDetection({
  enabled,
  isReady,
  captureFrame,
  intervalMs = 800,
}: UseFaceDetectionOptions) {
  const [faces, setFaces] = useState<FaceBox[]>([]);
  const [faceCount, setFaceCount] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!enabled || !isReady) {
      setFaces([]);
      setFaceCount(0);
      return;
    }

    let cancelled = false;

    async function poll() {
      if (cancelled || inFlightRef.current) {
        return;
      }

      inFlightRef.current = true;
      setIsDetecting(true);

      try {
        const frame = await captureFrame();
        const result = await detectFace(frame);
        if (!cancelled) {
          setFaces(result.faces);
          setFaceCount(result.face_count);
          setDetectionError(null);
        }
      } catch {
        if (!cancelled) {
          setDetectionError("Face detection is temporarily unavailable.");
        }
      } finally {
        inFlightRef.current = false;
        if (!cancelled) {
          setIsDetecting(false);
        }
      }
    }

    void poll();
    const intervalId = window.setInterval(() => {
      void poll();
    }, intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [enabled, isReady, captureFrame, intervalMs]);

  return {
    faces,
    faceCount,
    isDetecting,
    detectionError,
  };
}
