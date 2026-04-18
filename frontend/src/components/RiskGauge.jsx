import { useEffect, useState, useRef } from "react";

export default function RiskGauge({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    // Animate from 0 to score
    const duration = 1500;
    const startTime = performance.now();
    const startScore = 0;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(startScore + (score - startScore) * eased));

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [score]);

  // SVG semicircle parameters
  const size = 240;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // semicircle
  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = (val) => {
    if (val < 40) return "#22C55E";
    if (val < 70) return "#F59E0B";
    return "#EF4444";
  };

  const color = getColor(animatedScore);

  return (
    <div className="relative flex items-center justify-center" data-testid="risk-gauge">
      <svg
        width={size}
        height={size / 2 + 20}
        viewBox={`0 0 ${size} ${size / 2 + 20}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke 0.5s ease" }}
        />
        {/* Score text */}
        <text
          x={size / 2}
          y={size / 2 - 10}
          textAnchor="middle"
          className="font-['Cabinet_Grotesk',sans-serif]"
          fill={color}
          fontSize="56"
          fontWeight="800"
        >
          {animatedScore}
        </text>
        {/* Scale labels */}
        <text x={strokeWidth / 2 + 4} y={size / 2 + 18} fontSize="11" fill="#9CA3AF" textAnchor="start">
          0
        </text>
        <text x={size - strokeWidth / 2 - 4} y={size / 2 + 18} fontSize="11" fill="#9CA3AF" textAnchor="end">
          100
        </text>
      </svg>
    </div>
  );
}
