import { useEffect, useRef, useState } from "react";

interface SignaturePadProps {
  value: string;
  onChange: (dataUrl: string) => void;
  disabled?: boolean;
}

export function SignaturePad({ value, onChange, disabled }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasInkRef = useRef(false);
  const [loaded, setLoaded] = useState(false);

  // Load an existing signature image onto the canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loaded) return;
    const ctx = canvas.getContext("2d")!;
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        hasInkRef.current = true;
      };
      img.src = value;
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvasRef.current!.width,
      y: ((e.clientY - rect.top) / rect.height) * canvasRef.current!.height,
    };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    canvas.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastPosRef.current = getPos(e);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || disabled) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getPos(e);
    const last = lastPosRef.current ?? pos;
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPosRef.current = pos;
    hasInkRef.current = true;
  }

  function stop() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPosRef.current = null;
    onChange(canvasRef.current!.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    hasInkRef.current = false;
    onChange("");
  }

  return (
    <div className="relative overflow-hidden rounded-md border border-paper-line bg-white">
      {!disabled && (
        <button
          type="button"
          onClick={clear}
          className="absolute top-1.5 right-1.5 z-10 rounded border border-paper-line bg-white px-2 py-0.5 text-[11px] text-paper-foreground hover:bg-paper-muted/10"
        >
          Limpar
        </button>
      )}
      <canvas
        ref={canvasRef}
        width={560}
        height={180}
        className="block h-28 w-full touch-none sm:h-32"
        style={{ cursor: disabled ? "default" : "crosshair" }}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerLeave={stop}
      />
    </div>
  );
}
