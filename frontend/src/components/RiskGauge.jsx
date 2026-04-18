import { useEffect, useState, useRef, useCallback } from "react";

const ANIMATION_DURATION_MS = 1500;
const GAUGE_SIZE = 240;
const GAUGE_STROKE_WIDTH = 14;
const RISK_AMBER_THRESHOLD = 40;
const RISK_RED_THRESHOLD = 70;

const GAUGE_RADIUS = (GAUGE_SIZE - GAUGE_STROKE_WIDTH) / 2;
const GAUGE_CIRCUMFERENCE = Math.PI * GAUGE_RADIUS;
const GAUGE_HALF_STROKE = GAUGE_STROKE_WIDTH / 2;
const ARC_PATH = `M ${GAUGE_HALF_STROKE} ${GAUGE_SIZE / 2} A ${GAUGE_RADIUS} ${GAUGE_RADIUS} 0 0 1 ${GAUGE_SIZE - GAUGE_HALF_STROKE} ${GAUGE_SIZE / 2}`;
const GAUGE_VIEWBOX_HEIGHT = GAUGE_SIZE / 2 + 20;

function getRiskColor(val) {
  if (val < RISK_AMBER_THRESHOLD) return "#22C55E";
  if (val < RISK_RED_THRESHOLD) return "#F59E0B";
  return "#EF4444";
}

/** Animates from 0 to `target` over ANIMATION_DURATION_MS with ease-out cubic. */
function useAnimatedValue(target) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  // frameRef is a ref (stable identity), cancelAnimationFrame is a global.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cancel = useCallback(() => {
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  // ANIMATION_DURATION_MS is a module-level constant; frameRef is a stable ref.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / ANIMATION_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return cancel;
  }, [target, cancel]);

  return value;
}

function GaugeArc({ color, offset }) {
  return (
    <path
      d={ARC_PATH}
      fill="none"
      stroke={color}
      strokeWidth={GAUGE_STROKE_WIDTH}
      strokeLinecap="round"
      strokeDasharray={GAUGE_CIRCUMFERENCE}
      strokeDashoffset={offset}
      style={{ transition: "stroke 0.5s ease" }}
    />
  );
}

export default function RiskGauge({ score }) {
  const animatedScore = useAnimatedValue(score);
  const offset = GAUGE_CIRCUMFERENCE - (animatedScore / 100) * GAUGE_CIRCUMFERENCE;
  const color = getRiskColor(animatedScore);

  return (
    <div className="relative flex items-center justify-center" data-testid="risk-gauge">
      <svg
        width={GAUGE_SIZE}
        height={GAUGE_VIEWBOX_HEIGHT}
        viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_VIEWBOX_HEIGHT}`}
        className="overflow-visible"
      >
        <path d={ARC_PATH} fill="none" stroke="#E5E7EB" strokeWidth={GAUGE_STROKE_WIDTH} strokeLinecap="round" />
        <GaugeArc color={color} offset={offset} />
        <text
          x={GAUGE_SIZE / 2}
          y={GAUGE_SIZE / 2 - 10}
          textAnchor="middle"
          className="font-['Cabinet_Grotesk',sans-serif]"
          fill={color}
          fontSize="56"
          fontWeight="800"
        >
          {animatedScore}
        </text>
        <text x={GAUGE_HALF_STROKE + 4} y={GAUGE_SIZE / 2 + 18} fontSize="11" fill="#9CA3AF" textAnchor="start">
          0
        </text>
        <text x={GAUGE_SIZE - GAUGE_HALF_STROKE - 4} y={GAUGE_SIZE / 2 + 18} fontSize="11" fill="#9CA3AF" textAnchor="end">
          100
        </text>
      </svg>
    </div>
  );
}
