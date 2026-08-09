import { FaceOverlay } from "./FaceOverlay";
import type { FaceBox } from "../types/api";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  faces?: FaceBox[];
  isReady: boolean;
  error: string | null;
}

export function CameraView({
  videoRef,
  canvasRef,
  faces = [],
  isReady,
  error,
}: CameraViewProps) {
  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
        <video
          ref={videoRef}
          className="h-full w-full scale-x-[-1] object-cover"
          playsInline
          muted
        />
        {isReady && <FaceOverlay faces={faces} videoRef={videoRef} />}
        {!isReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            Starting camera...
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      {error && (
        <p className="text-sm text-rose-300">{error}</p>
      )}
    </div>
  );
}
