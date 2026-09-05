import React, { useState } from 'react';

export interface SkillDataPoint {
  skill: string;
  value: number; // 0 - 100
  fullMark: number;
}

export interface SkillsRadarChartProps {
  data?: SkillDataPoint[];
  size?: number;
}

export const DEFAULT_SKILLS: SkillDataPoint[] = [
  { skill: 'Python', value: 80, fullMark: 100 },
  { skill: 'Machine Learning', value: 70, fullMark: 100 },
  { skill: 'Deep Learning', value: 70, fullMark: 100 },
  { skill: 'Data Engineering', value: 55, fullMark: 100 },
  { skill: 'Mathematics', value: 50, fullMark: 100 },
];

export const SkillsRadarChart: React.FC<SkillsRadarChartProps> = ({
  data = DEFAULT_SKILLS,
  size = 190
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Chart Dimensions
  const svgWidth = 280;
  const svgHeight = 175;
  const paddingLeft = 32;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 34;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const numPoints = data.length;
  const stepX = chartWidth / numPoints;
  const barWidth = 22;

  // Coordinate calculations
  const points = data.map((d, i) => {
    const xCenter = paddingLeft + (i + 0.5) * stepX;
    const ratio = Math.min(Math.max(d.value / d.fullMark, 0), 1);
    const barHeight = ratio * chartHeight;
    const yTop = paddingTop + (chartHeight - barHeight);
    return {
      ...d,
      index: i,
      xCenter,
      barX: xCenter - barWidth / 2,
      barY: yTop,
      barHeight,
      ratio,
    };
  });

  // Grid levels (0%, 25%, 50%, 75%, 100%)
  const gridLevels = [0, 25, 50, 75, 100];

  // SVG Line path generation (smooth cubic bezier through all points)
  const linePath = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.xCenter} ${pt.barY}`;
    const prev = arr[i - 1];
    const cpX1 = prev.xCenter + (pt.xCenter - prev.xCenter) / 2;
    const cpY1 = prev.barY;
    const cpX2 = prev.xCenter + (pt.xCenter - prev.xCenter) / 2;
    const cpY2 = pt.barY;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.xCenter} ${pt.barY}`;
  }, '');

  // Shorter skill labels for tight display
  const getShortLabel = (skill: string) => {
    switch (skill) {
      case 'Machine Learning': return 'ML';
      case 'Deep Learning': return 'DL';
      case 'Data Engineering': return 'Data Eng';
      case 'Mathematics': return 'Math';
      default: return skill;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full select-none">
      <svg 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto max-h-[195px] overflow-visible"
        aria-label="Skills Proficiency Bar and Line Combo Chart"
      >
        <defs>
          {/* Bar Gradient using #3B82F6 */}
          <linearGradient id="barGradientPrimary" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.5" />
          </linearGradient>

          {/* Bar Hover Gradient */}
          <linearGradient id="barGradientHover" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#93C5FD" stopOpacity="1" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.9" />
          </linearGradient>

          {/* Line Glow Filter */}
          <filter id="lineGlowCyan" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#22D3EE" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Horizontal Gridlines & Y-Axis Scale */}
        {gridLevels.map((lvl) => {
          const y = paddingTop + chartHeight - (lvl / 100) * chartHeight;
          return (
            <g key={lvl}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={svgWidth - paddingRight}
                y2={y}
                stroke="#1E293B"
                strokeWidth={lvl === 0 ? '1.5' : '1'}
                strokeDasharray={lvl === 0 ? undefined : '2,3'}
              />
              <text
                x={paddingLeft - 6}
                y={y + 3.5}
                textAnchor="end"
                fill="#94A3B8"
                fontSize="9"
                fontFamily="var(--font-mono)"
                fontWeight="500"
              >
                {lvl}%
              </text>
            </g>
          );
        })}

        {/* Vertical Bars (#3B82F6) */}
        {points.map((pt) => {
          const isHovered = hoveredIdx === pt.index;
          return (
            <g 
              key={pt.skill}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredIdx(pt.index)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Bar Rect */}
              <rect
                x={pt.barX}
                y={pt.barY}
                width={barWidth}
                height={pt.barHeight}
                rx="4"
                ry="4"
                fill={isHovered ? 'url(#barGradientHover)' : 'url(#barGradientPrimary)'}
                stroke={isHovered ? '#93C5FD' : '#3B82F6'}
                strokeWidth={isHovered ? '1.5' : '1'}
                className="transition-all duration-200"
              />

              {/* Value Label above Bar */}
              <text
                x={pt.xCenter}
                y={pt.barY - 7}
                textAnchor="middle"
                fill={isHovered ? '#FFFFFF' : '#93C5FD'}
                fontSize="9"
                fontFamily="var(--font-mono)"
                fontWeight="700"
              >
                {pt.value}%
              </text>
            </g>
          );
        })}

        {/* Trendline (#22D3EE) */}
        <path
          d={linePath}
          fill="none"
          stroke="#22D3EE"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#lineGlowCyan)"
        />

        {/* Trendline Markers & Pulse Vertices (#22D3EE) */}
        {points.map((pt) => {
          const isHovered = hoveredIdx === pt.index;
          return (
            <g
              key={`dot-${pt.skill}`}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(pt.index)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Outer halo on hover */}
              {isHovered && (
                <circle
                  cx={pt.xCenter}
                  cy={pt.barY}
                  r="7"
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth="1.5"
                  className="animate-ping"
                />
              )}

              {/* Vertex Circle */}
              <circle
                cx={pt.xCenter}
                cy={pt.barY}
                r={isHovered ? '5' : '4'}
                fill="#22D3EE"
                stroke="#0B0F19"
                strokeWidth="2"
                className="transition-all duration-150"
              />
            </g>
          );
        })}

        {/* X-Axis Category Labels */}
        {points.map((pt) => {
          const isHovered = hoveredIdx === pt.index;
          return (
            <text
              key={`lbl-${pt.skill}`}
              x={pt.xCenter}
              y={svgHeight - 12}
              textAnchor="middle"
              fill={isHovered ? '#00F0FF' : '#CBD5E1'}
              fontSize="9.5"
              fontFamily="var(--font-mono)"
              fontWeight={isHovered ? '700' : '600'}
              className="transition-colors duration-150 cursor-pointer"
              onMouseEnter={() => setHoveredIdx(pt.index)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {getShortLabel(pt.skill)}
            </text>
          );
        })}
      </svg>

      {/* Legend: Bar (#3B82F6) & Line (#22D3EE) */}
      <div className="flex items-center justify-center gap-4 mt-1 pt-1.5 border-t border-[#1E293B]/70 w-full text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6] border border-[#60A5FA] shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
          <span>Score (Bar)</span>
        </div>
        <div className="flex items-center gap-1.5 text-cyan-300">
          <span className="w-3.5 h-0.5 rounded-full bg-[#22D3EE] shadow-[0_0_6px_#22d3ee]" />
          <span>Proficiency Trend (Line)</span>
        </div>
      </div>
    </div>
  );
};

// Also export alias for compatibility
export const SkillsBarLineChart = SkillsRadarChart;
