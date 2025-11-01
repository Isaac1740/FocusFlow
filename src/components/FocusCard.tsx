import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FocusCardProps {
  icon: LucideIcon;
  title: string;
  duration: string;
  completed: boolean;
  color: string;
  delay?: number;
}

const FocusCard = ({ icon: Icon, title, duration, completed, color, delay = 0 }: FocusCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            completed ? 'bg-secondary/20' : 'bg-primary/10'
          }`}
          style={{ color }}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{duration}</p>
        </div>
        {completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center"
          >
            <span className="text-white text-xs">✓</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default FocusCard;
