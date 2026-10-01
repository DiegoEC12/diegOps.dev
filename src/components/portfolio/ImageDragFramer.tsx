import { useCallback, useEffect, useRef, useState } from "react";
import { Crosshair, Maximize2, Move, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageDragFramerProps {
  imageUrl: string;
  imageFit?: "cover" | "contain";
  imagePosition?: string; // e.g. "50% 50%"
  aspectRatio?: "16/9" | "4/3" | "1/1" | "auto";
  label?: string;
  onChange: (fit: "cover" | "contain", position: string) => void;
}

export function ImageDragFramer({
  imageUrl,
  imageFit = "cover",
  imagePosition = "50% 50%",
  aspectRatio = "16/9",
  label = "Encuadre de imagen (Arrastra para posicionar)",
  onChange,
}: ImageDragFramerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initPosX: number; initPosY: number }>({
    startX: 0,
    startY: 0,
    initPosX: 50,
    initPosY: 50,
  });

  // Parse position "X% Y%"
  const parsePos = (posStr: string): [number, number] => {
    const parts = posStr.split(/\s+/).map((p) => parseFloat(p));
    const x = !isNaN(parts[0]) ? parts[0] : 50;
    const y = !isNaN(parts[1]) ? parts[1] : 50;
    return [Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y))];
  };

  const [currentX, currentY] = parsePos(imagePosition);

  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    const [posX, posY] = parsePos(imagePosition);
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initPosX: posX,
      initPosY: posY,
    };
  };

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = clientX - dragStartRef.current.startX;
      const deltaY = clientY - dragStartRef.current.startY;

      // Sensitivity: inverted pan so moving right reveals left (standard photo framing)
      const pctDeltaX = -(deltaX / rect.width) * 100;
      const pctDeltaY = -(deltaY / rect.height) * 100;

      const newX = Math.round(Math.max(0, Math.min(100, dragStartRef.current.initPosX + pctDeltaX)));
      const newY = Math.round(Math.max(0, Math.min(100, dragStartRef.current.initPosY + pctDeltaY)));

      onChange(imageFit, `${newX}% ${newY}%`);
    },
    [isDragging, imageFit, onChange]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = () => handlePointerUp();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handlePointerUp();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const toggleFit = () => {
    const nextFit = imageFit === "cover" ? "contain" : "cover";
    onChange(nextFit, imagePosition);
  };

  const resetCenter = () => {
    onChange(imageFit, "50% 50%");
  };

  const aspectClass =
    aspectRatio === "16/9"
      ? "aspect-video"
      : aspectRatio === "4/3"
      ? "aspect-[4/3]"
      : aspectRatio === "1/1"
      ? "aspect-square"
      : "aspect-auto";

  return (
    <div className="image-drag-framer-wrapper">
      <div className="framer-header">
        <span className="framer-label">
          <Move className="w-3.5 h-3.5 inline mr-1 text-copper" /> {label}
        </span>
        <div className="framer-coords">
          <span>X: {currentX}%</span>
          <span>Y: {currentY}%</span>
          <span className="framer-fit-tag">[{imageFit.toUpperCase()}]</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`image-drag-framer-container ${aspectClass} ${isDragging ? "is-grabbing" : "is-grab"}`}
        onMouseDown={(e) => {
          e.preventDefault();
          handlePointerDown(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
      >
        {/* Marcas de corte estilo imprenta manga en las 4 esquinas */}
        <div className="crop-mark top-left" />
        <div className="crop-mark top-right" />
        <div className="crop-mark bottom-left" />
        <div className="crop-mark bottom-right" />

        {/* Rejilla de tercios (rule of thirds) */}
        <div className="thirds-grid" aria-hidden="true">
          <div className="v-line l-1" />
          <div className="v-line l-2" />
          <div className="h-line l-1" />
          <div className="h-line l-2" />
          <div className="crosshair-center">
            <Crosshair className="w-4 h-4 opacity-40 text-ink" />
          </div>
        </div>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Vista previa de encuadre"
            draggable={false}
            className="framer-img"
            style={{
              objectFit: imageFit,
              objectPosition: `${currentX}% ${currentY}%`,
            }}
          />
        ) : (
          <div className="framer-placeholder">
            <p>Ingresa una URL de imagen para previsualizar y encuadrar</p>
          </div>
        )}

        <div className="framer-overlay-hint">
          {imageUrl ? (isDragging ? "Desplazando encuadre..." : "Arrastra con el ratón o dedo") : "Sin imagen"}
        </div>
      </div>

      {/* Controles de ajuste */}
      <div className="framer-controls">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={toggleFit}
          title="Alternar entre llenar marco o mostrar completa"
        >
          <Maximize2 className="w-3.5 h-3.5 mr-1" />
          Modo: {imageFit === "cover" ? "Cover (Llenar)" : "Contain (Completa)"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={resetCenter}
          title="Restablecer posición al centro"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Centrar (50% 50%)
        </Button>
      </div>
    </div>
  );
}
