import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DataPoint {
    date: string;
    value: number;
}

interface LineGraphProps {
    data: DataPoint[];
    color?: 'green' | 'purple' | 'blue' | 'orange';
    height?: number;
    showDots?: boolean;
    showGrid?: boolean;
}

const colorConfig = {
    green: { stroke: '#22C55E', fill: 'rgba(34, 197, 94, 0.1)', dot: '#16A34A' },
    purple: { stroke: '#A855F7', fill: 'rgba(168, 85, 247, 0.1)', dot: '#9333EA' },
    blue: { stroke: '#3B82F6', fill: 'rgba(59, 130, 246, 0.1)', dot: '#2563EB' },
    orange: { stroke: '#F97316', fill: 'rgba(249, 115, 22, 0.1)', dot: '#EA580C' },
};

export const LineGraph = ({
    data,
    color = 'green',
    height = 80,
    showDots = true,
    showGrid = false
}: LineGraphProps) => {
    const colors = colorConfig[color];

    if (data.length === 0) {
        return (
            <div
                className="flex items-center justify-center text-muted-foreground text-sm"
                style={{ height }}
            >
                No data yet
            </div>
        );
    }

    // Calculate graph dimensions
    const padding = { top: 10, right: 10, bottom: 20, left: 10 };
    const graphWidth = 280;
    const graphHeight = height - padding.top - padding.bottom;
    const innerWidth = graphWidth - padding.left - padding.right;

    // Normalize data
    const values = data.map(d => d.value);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const valueRange = maxValue - minValue || 1;

    // Generate path points
    const points = data.map((d, i) => ({
        x: padding.left + (i / (data.length - 1 || 1)) * innerWidth,
        y: padding.top + graphHeight - ((d.value - minValue) / valueRange) * graphHeight,
        date: d.date,
        value: d.value,
    }));

    // Create smooth curve path
    const linePath = points.length > 1
        ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
        : points.length === 1
            ? `M ${points[0].x},${points[0].y} L ${points[0].x + 0.1},${points[0].y}`
            : '';

    // Create area path for gradient fill
    const areaPath = points.length > 1
        ? `${linePath} L ${points[points.length - 1].x},${height - padding.bottom} L ${points[0].x},${height - padding.bottom} Z`
        : '';

    // Format date label
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="relative w-full overflow-hidden" style={{ height }}>
            <svg width="100%" height="100%" viewBox={`0 0 ${graphWidth} ${height}`} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={colors.fill.replace('0.1', '0.3')} />
                        <stop offset="100%" stopColor={colors.fill} />
                    </linearGradient>
                </defs>

                {/* Optional grid lines */}
                {showGrid && (
                    <g className="text-muted-foreground/20">
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                            <line
                                key={ratio}
                                x1={padding.left}
                                y1={padding.top + graphHeight * ratio}
                                x2={graphWidth - padding.right}
                                y2={padding.top + graphHeight * ratio}
                                stroke="currentColor"
                                strokeDasharray="2,2"
                            />
                        ))}
                    </g>
                )}

                {/* Area fill */}
                {areaPath && (
                    <motion.path
                        d={areaPath}
                        fill={`url(#gradient-${color})`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    />
                )}

                {/* Line */}
                <motion.path
                    d={linePath}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />

                {/* Data points */}
                {showDots && points.map((point, i) => (
                    <motion.g key={i}>
                        {/* Outer glow */}
                        <motion.circle
                            cx={point.x}
                            cy={point.y}
                            r="6"
                            fill={colors.stroke}
                            opacity="0.2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                        />
                        {/* Inner dot */}
                        <motion.circle
                            cx={point.x}
                            cy={point.y}
                            r="3"
                            fill={colors.dot}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                        />
                    </motion.g>
                ))}

                {/* X-axis labels (first and last) */}
                {data.length > 1 && (
                    <>
                        <text
                            x={points[0].x}
                            y={height - 4}
                            textAnchor="start"
                            className="fill-muted-foreground text-[8px]"
                        >
                            {formatDate(data[0].date)}
                        </text>
                        <text
                            x={points[points.length - 1].x}
                            y={height - 4}
                            textAnchor="end"
                            className="fill-muted-foreground text-[8px]"
                        >
                            {formatDate(data[data.length - 1].date)}
                        </text>
                    </>
                )}
            </svg>
        </div>
    );
};
