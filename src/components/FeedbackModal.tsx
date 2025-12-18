import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clipboard, Zap, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1451192300456640612/Fai6t_R8Wh8-RMghZFRDHtkdjKtEVy-O4IL1WAZKU75oGXrqKdj-Qs7iWKixff5bpbSG';

export const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
  const [mode, setMode] = useState<'select' | 'input'>('select');
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleQuickMessage = () => {
    setMode('input');
  };

  const handleDetailedSurvey = () => {
    window.open('https://forms.gle/pnGsGjrtvE5YCRnX6', '_blank');
    onClose();
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: "Empty Transmission",
        description: "Please enter a message before sending.",
        variant: "destructive"
      });
      return;
    }
    setShowConfirm(true);
  };

  const confirmSend = async () => {
    setShowConfirm(false);
    setIsSending(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `**New Feedback Received!**\n> ${message.slice(0, 1900)}`
        })
      });

      if (response.ok) {
        // Play success sound
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19teleGFtcGxlAA==');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore if audio fails
        
        toast({
          title: "Transmission Received",
          description: "+50 XP (symbolic reward for helping us improve!)",
          className: "bg-success/20 border-success"
        });
        
        setMessage('');
        setMode('select');
        onClose();
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      toast({
        title: "Transmission Failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setMode('select');
    setMessage('');
    setShowConfirm(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-full max-w-md glass-strong rounded-2xl border border-border/50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h2 className="font-heading font-bold text-lg">
                {mode === 'select' ? 'Send Feedback' : 'Transmit Feedback'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4">
              <AnimatePresence mode="wait">
                {mode === 'select' ? (
                  <motion.div
                    key="select"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    <p className="text-sm text-muted-foreground mb-4">
                      How would you like to share your thoughts?
                    </p>
                    
                    {/* Detailed Survey Option */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDetailedSurvey}
                      className="w-full p-4 rounded-xl bg-primary/10 border border-primary/30 hover:border-primary/50 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Clipboard className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">Detailed Survey</h3>
                          <p className="text-sm text-muted-foreground">Answer questions to help shape QuestLine</p>
                        </div>
                      </div>
                    </motion.button>

                    {/* Quick Message Option */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleQuickMessage}
                      className="w-full p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Zap className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">Quick Message</h3>
                          <p className="text-sm text-muted-foreground">Send a quick bug report or idea</p>
                        </div>
                      </div>
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, 5000))}
                      placeholder="Found a bug? Have an idea? Let us know..."
                      className="min-h-[150px] resize-none bg-muted/30 border-border/50 focus:border-primary/50"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{message.length} / 5000</span>
                      <button 
                        onClick={() => setMode('select')}
                        className="hover:text-foreground transition-colors"
                      >
                        ← Back to options
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {mode === 'input' && (
              <div className="flex items-center gap-3 p-4 border-t border-border/50">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || isSending}
                  className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Transmission
                </Button>
              </div>
            )}
          </motion.div>

          {/* Confirmation Dialog */}
          <AnimatePresence>
            {showConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4"
                onClick={() => setShowConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-sm glass-strong rounded-xl border border-border/50 p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-heading font-bold text-lg mb-2">Confirm Transmission</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Send this feedback to the developer?
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setShowConfirm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmSend}
                      className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                    >
                      Confirm
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};