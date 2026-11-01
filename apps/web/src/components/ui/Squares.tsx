import { useRef, useEffect } from "react";

interface SquaresProps {
  direction?: "right" | "left" | "up" | "down" | "diagonal";
  speed?: number;
  borderColor?: string;
  squareSize?: number;
  hoverFillColor?: string;
  className?: string;
}

export function Squares({
  direction = "diagonal",
  speed = 0.5,
  borderColor = "#27272a",
  squareSize = 40,
  hoverFillColor = "rgba(37, 244, 238, 0.08)",
  className = "",
}: SquaresProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoveredSquareRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let gridOffset = { x: 0, y: 0 };

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const startX = Math.floor((mouseX - (gridOffset.x % squareSize)) / squareSize);
      const startY = Math.floor((mouseY - (gridOffset.y % squareSize)) / squareSize);

      hoveredSquareRef.current = { x: startX, y: startY };
    };

    const handleMouseLeave = () => {
      hoveredSquareRef.current = null;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Animation du défilement
      if (direction === "diagonal") {
        gridOffset.x = (gridOffset.x + speed) % squareSize;
        gridOffset.y = (gridOffset.y + speed) % squareSize;
      } else if (direction === "right") {
        gridOffset.x = (gridOffset.x + speed) % squareSize;
      } else if (direction === "left") {
        gridOffset.x = (gridOffset.x - speed) % squareSize;
      } else if (direction === "down") {
        gridOffset.y = (gridOffset.y + speed) % squareSize;
      } else if (direction === "up") {
        gridOffset.y = (gridOffset.y - speed) % squareSize;
      }

      const numCols = Math.ceil(canvas.width / squareSize) + 2;
      const numRows = Math.ceil(canvas.height / squareSize) + 2;

      for (let i = -1; i < numCols; i++) {
        for (let j = -1; j < numRows; j++) {
          const squareX = i * squareSize + (gridOffset.x % squareSize);
          const squareY = j * squareSize + (gridOffset.y % squareSize);

          if (
            hoveredSquareRef.current &&
            hoveredSquareRef.current.x === i &&
            hoveredSquareRef.current.y === j
          ) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(squareX, squareY, squareSize, squareSize);
          }

          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(squareX, squareY, squareSize, squareSize);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [direction, speed, borderColor, squareSize, hoverFillColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-auto absolute inset-0 h-full w-full ${className}`}
    />
  );
}
