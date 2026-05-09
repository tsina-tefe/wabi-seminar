import { useEffect, useRef } from "react";

export default function VideoTile({ title, stream, muted = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream || null;
    }
  }, [stream]);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-2">
      <p className="text-xs text-slate-300 mb-2">{title}</p>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full aspect-video rounded bg-black object-cover"
      />
    </div>
  );
}
