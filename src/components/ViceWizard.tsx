import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import {
    Plus, X, Smartphone, Shield, Wind, Skull,
    AlertTriangle, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const VICE_TEMPLATES = [
    {
        key: 'dopamine' as const,
        title: 'Dopamine Detox',
        subtitle: 'Doomscrolling / Social Media',
        icon: Smartphone,
        color: 'from-blue-500 to-purple-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
    },
    {
        key: 'vitality' as const,
        title: 'Vitality Retention',
        subtitle: 'PMO / Masturbation',
        icon: Shield,
        color: 'from-amber-500 to-orange-500',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
    },
    {
        key: 'substance' as const,
        title: 'Smoke/Substance',
        subtitle: 'Smoking / Vaping / Drinking',
        icon: Wind,
        color: 'from-gray-500 to-slate-600',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/30',
    },
    {
        key: 'custom' as const,
        title: 'Custom Bane',
        subtitle: 'Define your own enemy',
        icon: Skull,
        color: 'from-red-500 to-rose-600',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
    },
];

export const ViceWizard = () => {
    const { activeView, vices, addVice } = useGameStore();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<typeof VICE_TEMPLATES[0] | null>(null);
    const [customTitle, setCustomTitle] = useState('');
    const [showWarning, setShowWarning] = useState(false);

    // Only show in vices view
    if (activeView !== 'vices') return null;

    const handleFABClick = () => {
        // One-Vice Rule: Warn if already has a vice
        if (vices.length > 0) {
            setShowWarning(true);
        } else {
            setIsOpen(true);
        }
    };

    const handleTemplateSelect = (template: typeof VICE_TEMPLATES[0]) => {
        setSelectedTemplate(template);
        if (template.key !== 'custom') {
            // Auto-submit for preset templates
            addVice({
                title: template.title,
                template: template.key,
            });
            setIsOpen(false);
            setSelectedTemplate(null);
        }
    };

    const handleCustomSubmit = () => {
        if (!customTitle.trim()) return;
        addVice({
            title: customTitle.trim(),
            template: 'custom',
        });
        setIsOpen(false);
        setSelectedTemplate(null);
        setCustomTitle('');
    };

    const handleOverride = () => {
        setShowWarning(false);
        setIsOpen(true);
    };

    return (
        <>
            {/* FAB Button - Centered like other wizards, Red for vices */}
            <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 flex justify-center items-center z-40 pointer-events-none">
                {/* Backdrop Glow */}
                <div className="absolute w-20 h-20 bg-black/40 blur-xl rounded-full" />
                <motion.button
                    onClick={handleFABClick}
                    className={cn(
                        "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg pointer-events-auto transition-all duration-300 relative",
                        "bg-red-500 text-white glow-success shadow-red-500/30 hover:bg-red-400"
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
            </div>

            {/* One-Vice Warning Modal */}
            <AnimatePresence>
                {showWarning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowWarning(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm p-6 rounded-2xl bg-card border-2 border-red-500/50"
                        >
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-heading font-bold text-center text-red-500 mb-2">
                                ⚠️ Overload Warning ⚠️
                            </h3>
                            <p className="text-sm text-muted-foreground text-center mb-6">
                                Fighting multiple Vices simultaneously reduces success probability by 60%.
                                We highly recommend finishing your current protocol first.
                            </p>
                            <div className="flex flex-col gap-2">
                                <Button
                                    onClick={() => setShowWarning(false)}
                                    className="w-full bg-gradient-to-r from-green-600 to-green-500"
                                >
                                    Abort
                                </Button>
                                <Button
                                    onClick={handleOverride}
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-muted-foreground"
                                >
                                    Override & Add Anyway
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Template Selection Modal - Bottom Sheet like GoalWizard */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                        />

                        {/* Bottom Sheet */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-50 glass-strong rounded-t-3xl p-4 sm:p-6 pb-6 sm:pb-8 max-h-[90vh] overflow-y-auto"
                        >
                            {/* Handle */}
                            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4 sm:mb-6" />

                            {/* Close button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 rounded-full hover:bg-muted/50 text-muted-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Custom Title Input (if custom selected) */}
                            {selectedTemplate?.key === 'custom' ? (
                                <div className="space-y-4">
                                    <Input
                                        value={customTitle}
                                        onChange={(e) => setCustomTitle(e.target.value)}
                                        placeholder="Name your enemy..."
                                        className="text-lg"
                                        autoFocus
                                    />
                                    <Button
                                        onClick={handleCustomSubmit}
                                        disabled={!customTitle.trim()}
                                        className="w-full bg-gradient-to-r from-red-600 to-red-500"
                                    >
                                        Begin Protocol
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                    <Button
                                        onClick={() => setSelectedTemplate(null)}
                                        variant="ghost"
                                        className="w-full"
                                    >
                                        Back
                                    </Button>
                                </div>
                            ) : (
                                /* Template Grid */
                                <div className="grid grid-cols-2 gap-3">
                                    {VICE_TEMPLATES.map((template) => {
                                        const Icon = template.icon;
                                        return (
                                            <motion.button
                                                key={template.key}
                                                onClick={() => handleTemplateSelect(template)}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 text-left transition-all",
                                                    template.bgColor,
                                                    template.borderColor,
                                                    "hover:scale-[1.02] active:scale-[0.98]"
                                                )}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg mb-3 flex items-center justify-center",
                                                    `bg-gradient-to-br ${template.color}`
                                                )}>
                                                    <Icon className="w-5 h-5 text-white" />
                                                </div>
                                                <h4 className="font-semibold text-sm mb-1">
                                                    {template.title}
                                                </h4>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {template.subtitle}
                                                </p>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
