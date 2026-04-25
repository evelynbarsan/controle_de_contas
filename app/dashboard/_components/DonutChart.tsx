"use client";

import { useState } from "react";

const PALETTE = [
  "#3B82F6","#10B981","#F59E0B","#EF4444",
  "#8B5CF6","#EC4899","#06B6D4","#84CC16","#F97316",
];

export interface ChartSlice { label: string; value: number; }

function arc(
  cx: number, cy: number, r: number, inner: number,
  startDeg: number, sweepDeg: number,
) {
  const clamp  = Math.min(sweepDeg, 359.9999);
  const endDeg = startDeg + clamp;
  const rad    = (d: number) => ((d - 90) * Math.PI) / 180;
  const px     = (r0: number, d: number) => cx + r0 * Math.cos(rad(d));
  const py     = (r0: number, d: number) => cy + r0 * Math.sin(rad(d));
  const large  = clamp > 180 ? 1 : 0;

  return [
    `M ${px(r, startDeg)} ${py(r, startDeg)}`,
    `A ${r} ${r} 0 ${large} 1 ${px(r, endDeg)} ${py(r, endDeg)}`,
    `L ${px(inner, endDeg)} ${py(inner, endDeg)}`,
    `A ${inner} ${inner} 0 ${large} 0 ${px(inner, startDeg)} ${py(inner, startDeg)}`,
    "Z",
  ].join(" ");
}

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function DonutChart({
  slices,
  title,
}: {
  slices: ChartSlice[];
  title : string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (slices.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col items-center justify-center min-h-[140px]">
        <p className="text-xs font-semibold text-gray-400">{title}</p>
        <p className="text-xs text-gray-300 mt-1">Sem dados</p>
      </div>
    );
  }

  const total  = slices.reduce((s, c) => s + c.value, 0);
  const CX = 70, CY = 70, R = 58, IR = 32;

  let angle = 0;
  const paths = slices.map((slice, i) => {
    const sweep = (slice.value / total) * 360;
    const start = angle;
    angle += sweep;
    return { d: arc(CX, CY, R, IR, start, sweep), color: PALETTE[i % PALETTE.length], i, slice, pct: (slice.value / total) * 100 };
  });

  const h = hovered !== null ? slices[hovered] : null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 h-full">
      <p className="text-xs font-semibold text-gray-500 mb-3">{title}</p>
      <div className="flex items-center gap-3">
        {/* Donut */}
        <div className="relative shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            {paths.map(({ d, color, i }) => (
              <path
                key={i}
                d={d}
                fill={color}
                opacity={hovered === null || hovered === i ? 1 : 0.3}
                className="cursor-pointer transition-opacity duration-150"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onTouchStart={e => { e.preventDefault(); setHovered(i); }}
                onTouchEnd={() => setTimeout(() => setHovered(null), 1200)}
              />
            ))}
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-3">
            {h ? (
              <>
                <span className="text-[10px] text-gray-500 leading-tight line-clamp-2">{h.label}</span>
                <span className="text-sm font-bold text-gray-800 mt-0.5">
                  {((h.value / total) * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-gray-500">{brl(h.value)}</span>
              </>
            ) : (
              <>
                <span className="text-[10px] text-gray-400">Total</span>
                <span className="text-xs font-semibold text-gray-600 mt-0.5">{brl(total)}</span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0 max-h-32 overflow-y-auto">
          {paths.map(({ color, pct, slice, i }) => (
            <div
              key={i}
              className="flex items-center gap-1.5"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onTouchStart={e => { e.preventDefault(); setHovered(i); }}
              onTouchEnd={() => setTimeout(() => setHovered(null), 1200)}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-[11px] text-gray-600 truncate">{slice.label}</span>
              <span className="text-[11px] text-gray-400 ml-auto shrink-0">{pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
