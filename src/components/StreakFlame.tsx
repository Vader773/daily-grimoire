import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StreakFlameProps {
    streak: number;
    size?: 'sm' | 'md' | 'lg';
    animated?: boolean;
}

// Get flame color based on streak level - aligned with League colors
const getFlameColor = (streak: number) => {
    if (streak >= 100) return { primary: '#FFFFFF', secondary: '#F3F4F6', tertiary: '#1F2937', isRainbow: false }; // Immortal/God (White/Black Flame)
    if (streak >= 90) return { primary: '#3B82F6', secondary: '#60A5FA', tertiary: '#93C5FD', isRainbow: false }; // Legend (Blue/Cosmic)
    if (streak >= 60) return { primary: '#10B981', secondary: '#34D399', tertiary: '#6EE7B7', isRainbow: false }; // Champion (Emerald)
    if (streak >= 30) return { primary: '#EF4444', secondary: '#F87171', tertiary: '#FCA5A5', isRainbow: false }; // Grandmaster (Red)
    if (streak >= 15) return { primary: '#A855F7', secondary: '#C084FC', tertiary: '#E9D5FF', isRainbow: false }; // Master (Purple)
    if (streak >= 8) return { primary: '#06B6D4', secondary: '#22D3EE', tertiary: '#67E8F9', isRainbow: false };  // Diamond (Cyan) -> Adjusted to match Diamond league color more closely
    if (streak >= 4) return { primary: '#F59E0B', secondary: '#FBBF24', tertiary: '#FCD34D', isRainbow: false }; // Gold
    return { primary: '#F97316', secondary: '#FB923C', tertiary: '#FDBA74', isRainbow: false }; // Bronze/Orange
};

const sizeConfig = {
    sm: { width: 24, height: 24, particleCount: 3 },
    md: { width: 48, height: 48, particleCount: 5 },
    lg: { width: 96, height: 96, particleCount: 8 },
};

export const StreakFlame = ({ streak, size = 'md', animated = true }: StreakFlameProps) => {
    const colors = getFlameColor(streak);
    const config = sizeConfig[size];

    if (streak === 0) {
        // Show dormant flame when no streak
        return (
            <div
                className="relative flex items-center justify-center opacity-30"
                style={{ width: config.width, height: config.height }}
            >
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                    <path
                        d="M12 2C12 2 4 10 4 15C4 19.4183 7.58172 23 12 23C16.4183 23 20 19.4183 20 15C20 10 12 2 12 2Z"
                        fill="#6B7280"
                        opacity="0.5"
                    />
                </svg>
            </div>
        );
    }

    return (
        <div
            className="relative flex items-center justify-center"
            style={{ width: config.width, height: config.height }}
        >
            {/* Glow effect - Subtler and follows color */}
            <motion.div
                className="absolute inset-0 rounded-full blur-xl"
                style={{ backgroundColor: colors.primary }}
                animate={animated ? {
                    scale: [0.8, 1.1, 0.8],
                    opacity: [0.2, 0.4, 0.2]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Main flame SVG */}
            <motion.svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-full h-full relative z-10"
                animate={animated ? {
                    scaleY: [1, 1.05, 0.98, 1.02, 1],
                    scaleX: [1, 0.98, 1.02, 0.99, 1]
                } : {}}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            >
                <defs>
                    <linearGradient id={`flame-gradient-${streak}`} x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor={colors.tertiary} />
                        <stop offset="50%" stopColor={colors.secondary} />
                        <stop offset="100%" stopColor={colors.primary} />
                    </linearGradient>
                    <filter id="flame-glow">
                        <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Main flame body */}
                <motion.path
                    d="M12 2C12 2 4 10 4 15C4 19.4183 7.58172 23 12 23C16.4183 23 20 19.4183 20 15C20 10 12 2 12 2Z"
                    fill={`url(#flame-gradient-${streak})`}
                    filter="url(#flame-glow)"
                    animate={animated ? {
                        d: [
                            "M12 2C12 2 4 10 4 15C4 19.4183 7.58172 23 12 23C16.4183 23 20 19.4183 20 15C20 10 12 2 12 2Z",
                            "M12 1C12 1 3 10 3 15C3 19.9706 7.02944 24 12 24C16.9706 24 21 19.9706 21 15C21 10 12 1 12 1Z",
                            "M12 2C12 2 4 10 4 15C4 19.4183 7.58172 23 12 23C16.4183 23 20 19.4183 20 15C20 10 12 2 12 2Z",
                        ]
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Inner flame (lighter) */}
                <motion.path
                    d="M12 8C12 8 8 13 8 16C8 18.2091 9.79086 20 12 20C14.2091 20 16 18.2091 16 16C16 13 12 8 12 8Z"
                    fill={colors.tertiary}
                    opacity="0.8"
                    animate={animated ? {
                        opacity: [0.6, 0.9, 0.6]
                    } : {}}
                    transition={{ duration: 0.6, repeat: Infinity }}
                />

                {/* Core (brightest) */}
                <ellipse
                    cx="12"
                    cy="17"
                    rx="2"
                    ry="3"
                    fill="white"
                    opacity="0.6"
                />
            </motion.svg>

            {/* Floating particles (only for md and lg) */}
            {animated && size !== 'sm' && (
                <>
                    {Array.from({ length: config.particleCount }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full"
                            style={{
                                width: size === 'lg' ? 4 : 2,
                                height: size === 'lg' ? 4 : 2,
                                backgroundColor: colors.secondary,
                                left: `${30 + Math.random() * 40}%`,
                                bottom: '20%',
                            }}
                            animate={{
                                y: [0, -config.height * 0.6],
                                x: [0, (Math.random() - 0.5) * 20],
                                opacity: [0.8, 0],
                                scale: [1, 0.5],
                            }}
                            transition={{
                                duration: 1 + Math.random() * 0.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeOut",
                            }}
                        />
                    ))}
                </>
            )}

            {/* REMOVED: Rainbow shimmer circle background */}
        </div>
    );
};
