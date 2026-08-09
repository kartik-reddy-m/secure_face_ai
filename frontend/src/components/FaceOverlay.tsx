import { useEffect, useRef } from "react";
import type { FaceBox } from "../types/api";

interface FaceOverlayProps {
  faces: FaceBox[];
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function FaceOverlay({ faces, videoRef }: FaceOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      return;
    }

    const draw = () => {
      const displayWidth = video.clientWidth;
      const displayHeight = video.clientHeight;
      if (displayWidth === 0 || displayHeight === 0) {
        return;
      }

      canvas.width = displayWidth;
      canvas.height = displayHeight;

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      context.clearRect(0, 0, displayWidth, displayHeight);

      const scaleX = displayWidth / video.videoWidth;
      const scaleY = displayHeight / video.videoHeight;

      context.strokeStyle = "#34d399";
      context.lineWidth = 2;
      context.fillStyle = "rgba(52, 211, 153, 0.15)";

      for (const face of faces) {
        const x = face.x * scaleX;
        const y = face.y * scaleY;
        const width = face.width * scaleX;
        const height = face.height * scaleY;
        context.fillRect(x, y, width, height);
        context.strokeRect(x, y, width, height);
      }
    };

    draw();
    const intervalId = window.setInterval(draw, 200);
    return () => window.clearInterval(intervalId);
  }, [faces, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
