'use client';

import { useEffect, useState } from 'react';
import type { HexagonStat } from '@/lib/types';

const AXES: { key: keyof HexagonStat; label: string }[] = [
  { key: 'logic', label: '추리력' },
  { key: 'observe', label: '직관력' },
  { key: 'speed', label: '활동성' },
  { key: 'story', label: '스토리이해' },
  { key: 'solving', label: '문제해결' },
  { key: 'tank', label: '탱킹력' },
];

const SIZE = 280;
const CENTER = SIZE / 2;
const MAX_RADIUS = SIZE * 0.36;

function pointFor(index: number, value: number): [number, number] {
  const angle = (Math.PI * 2 * index) / AXES.length - Math.PI / 2;
  const r = (value / 100) * MAX_RADIUS;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

function ringPoints(scale: number): string {
  return AXES.map((_, i) => pointFor(i, scale * 100).join(',')).join(' ');
}

/** [도메인 2] Live_Hexagon_Radar_Chart: 스탯 저장 즉시 부드럽게 스케일 애니메이션되는 육각 차트 */
export default function HexagonRadarChart({ stat }: { stat: HexagonStat }) {
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(t);
  }, [stat]);

  const userPoints = AXES.map((axis, i) => pointFor(i, stat[axis.key]).join(',')).join(' ');

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-xs mx-auto">
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon
          key={scale}
          points={ringPoints(scale)}
          fill="none"
          stroke="var(--chart-grid)"
          strokeWidth={1}
        />
      ))}

      {AXES.map((_, i) => {
        const [x, y] = pointFor(i, 100);
        return (
          <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="var(--chart-grid)" strokeWidth={1} />
        );
      })}

      <polygon
        points={userPoints}
        fill="var(--chart-fill)"
        stroke="var(--chart-stroke)"
        strokeWidth={2}
        style={{
          transformOrigin: `${CENTER}px ${CENTER}px`,
          transform: grown ? 'scale(1)' : 'scale(0.35)',
          opacity: grown ? 1 : 0,
          transition: 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms ease-out',
        }}
      />

      {AXES.map((axis, i) => {
        const [lx, ly] = pointFor(i, 122);
        return (
          <text
            key={axis.key}
            x={lx}
            y={ly}
            fontSize={11}
            fill="var(--chart-label)"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {axis.label} {Math.round(stat[axis.key])}
          </text>
        );
      })}
    </svg>
  );
}
