/**
 * MOVIESTORY AI — MIQG: QualityTimeline Component
 * Visualizes the Emotional Curve and Attention Flow across scenes.
 */

import React from 'react';
import { EmotionalCurvePoint, CausalChainReport } from '../../types';
import { Activity, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface QualityTimelineProps {
  curve: EmotionalCurvePoint[];
  causalChain?: CausalChainReport;
}

export const QualityTimeline: React.FC<QualityTimelineProps> = ({
  curve,
  causalChain,
}) => {
  if (!curve || curve.length === 0) {
    return (
      <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
        감정 곡선 데이터가 아직 준비되지 않았습니다.
      </div>
    );
  }

  // SVG Coordinates calculation
  const width = 640;
  const height = 180;
  const paddingX = 40;
  const paddingY = 30;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  const points = curve.map((pt, idx) => {
    const x = paddingX + (idx / Math.max(1, curve.length - 1)) * usableWidth;
    const y = height - paddingY - ((pt.intensity - 1) / 9) * usableHeight;
    return { ...pt, x, y };
  });

  // Construct SVG Bezier path
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  // Area path for gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="space-y-4">
      {/* 1. Emotional Curve SVG Chart */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">시청자 감정 곡선 (Emotional Curve)</span>
            <span className="text-[10px] text-slate-400 font-mono">1~10 강도 지수</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>긴장/몰입도</span>
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" />
              <span>절정 (Climax 10/10)</span>
            </span>
          </div>
        </div>

        {/* SVG Drawing */}
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
            <defs>
              <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="80%" stopColor="#f59e0b" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[2, 5, 8, 10].map((level) => {
              const y = height - paddingY - ((level - 1) / 9) * usableHeight;
              return (
                <g key={level}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 3}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {level}
                  </text>
                </g>
              );
            })}

            {/* Gradient Fill under Curve */}
            <path d={areaD} fill="url(#curveGradient)" />

            {/* Main Bezier Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Points & Labels */}
            {points.map((pt, idx) => {
              const isClimax = pt.intensity >= 9;
              return (
                <g key={idx} className="group cursor-pointer">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isClimax ? 6 : 4}
                    fill={isClimax ? '#ef4444' : '#f59e0b'}
                    stroke="#020617"
                    strokeWidth="2"
                    className="transition-all hover:r-7"
                  />
                  <text
                    x={pt.x}
                    y={height - 8}
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {pt.timeOrPhase}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Narrative Flow Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono">
          {curve.map((pt, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg border text-center ${
                pt.intensity >= 9
                  ? 'bg-rose-950/40 border-rose-800 text-rose-300 font-bold'
                  : pt.intensity >= 7
                  ? 'bg-amber-950/30 border-amber-800 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] text-slate-500">{pt.timeOrPhase}</div>
              <div className="font-bold text-white text-xs mt-0.5">{pt.intensity}/10</div>
              <div className="text-[10px] truncate mt-0.5">{pt.label.split('(')[0]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Causal Logic Chain (BECAUSE -> BUT -> THEREFORE -> SO) */}
      {causalChain && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>🔗 인과 논리 사슬 (Because → But → Therefore → So)</span>
              <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded text-amber-400 font-mono">
                {causalChain.score}점
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {causalChain.isLinearAndThen ? '⚠️ And-Then 구조 보강 권고' : '✓ 인과 연결 건전'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-sans mt-3">
            {causalChain.chain.map((c, i) => (
              <div
                key={i}
                className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] rounded">
                    {c.step}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-white font-medium text-xs line-clamp-2 mt-1">{c.event}</p>
                <p className="text-[10px] text-slate-500">{c.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
