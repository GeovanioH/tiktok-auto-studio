interface MatrixRainProps {
  className?: string;
  opacity?: number;
  columnsCount?: number;
  interactive?: boolean;
}

export function MatrixRain({
  className = "",
  opacity = 0.25,
  columnsCount = 40,
}: MatrixRainProps) {
  return (
    <div
      className={`matrix-container pointer-events-none select-none overflow-hidden ${className}`.trim()}
      style={{ opacity }}
      aria-hidden="true"
    >
      <div className="matrix-pattern">
        {Array.from({ length: columnsCount }).map((_, index) => (
          <div key={index} className="matrix-column" />
        ))}
      </div>
    </div>
  );
}
