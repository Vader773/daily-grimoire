import { useState } from 'react';
import { motion } from 'framer-motion';
import { Vice, useGameStore } from '@/stores/gameStore';
import { ShieldCheck, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ViceCheckInProps {
    vice: Vice;
    onFailure: () => void;
}

export const ViceCheckIn = ({ vice, onFailure }: ViceCheckInProps) => {
    const { checkInVice } = useGameStore();
    const [isShaking, setIsShaking] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSuccess = () => {
        checkInVice(vice.id, 'clean');
        setShowSuccess(true);
        // Trigger particle/confetti effect here if needed
    };

    const handleFailure = () => {
        setIsShaking(true);
        setTimeout(() => {
            setIsShaking(false);
            checkInVice(vice.id, 'relapsed');
            onFailure();
        }, 500);
    };

    if (showSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-green-500/10 border border-green-500/30 text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                >
                    <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-3" />
                </motion.div>
                <h3 className="font-heading font-bold text-green-500 text-lg">
                    SHIELD HELD!
                </h3>
                <p className="text-green-400 text-sm mt-1">+50 XP</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
                opacity: 1,
                y: 0,
                x: isShaking ? [0, -10, 10, -10, 10, 0] : 0
            }}
            transition={{
                duration: isShaking ? 0.4 : 0.3,
                ease: 'easeInOut'
            }}
            className={cn(
                "p-6 rounded-2xl border-2 transition-colors duration-300",
                "bg-gradient-to-b from-red-500/5 to-transparent border-red-500/30"
            )}
        >
            <h3 className="font-heading font-bold text-center text-lg mb-2">
                Daily Report
            </h3>
            <p className="text-muted-foreground text-center text-sm mb-6">
                Did you succumb to the urge today?
            </p>

            <div className="grid grid-cols-2 gap-3">
                {/* Success Button */}
                <Button
                    onClick={handleSuccess}
                    size="lg"
                    className={cn(
                        "h-14 font-bold text-sm transition-all duration-300",
                        "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400",
                        "text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
                    )}
                >
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    I HELD THE LINE
                </Button>

                {/* Failure Button */}
                <Button
                    onClick={handleFailure}
                    size="lg"
                    variant="outline"
                    className={cn(
                        "h-14 font-medium text-sm transition-all duration-300",
                        "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    )}
                >
                    <Skull className="w-5 h-5 mr-2" />
                    I Succumbed
                </Button>
            </div>
        </motion.div>
    );
};
