import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Timer = () => {
  const location = useLocation();
  const initialDuration = location.state?.duration || 25;
  
  const [minutes, setMinutes] = useState(initialDuration);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const totalSeconds = isBreak ? 10 * 60 : initialDuration * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = () => {
    if (isBreak) {
      toast.success('Break time is over! Ready to focus again? 🎯');
      setIsBreak(false);
      setMinutes(initialDuration);
      setSeconds(0);
    } else {
      toast.success('Great work! Time for a break! 🎉');
      setIsBreak(true);
      setMinutes(10);
      setSeconds(0);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    if (!isActive) {
      toast.info(isBreak ? 'Break started 😌' : 'Focus session started 🎯');
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    if (isBreak) {
      setMinutes(10);
    } else {
      setMinutes(initialDuration);
    }
    setSeconds(0);
    toast.info('Timer reset');
  };

  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background transition-colors duration-300">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            {isBreak ? 'Break Time 😌' : 'Focus Time 🎯'}
          </h1>
          <p className="text-muted-foreground">
            {isBreak 
              ? 'Take a moment to rest and recharge' 
              : 'Stay focused and make it count'}
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={`glass-card rounded-3xl p-12 mb-8 transition-all duration-1000 ${
            isBreak ? 'gradient-soft' : ''
          }`}
        >
          <div className="flex flex-col items-center">
            {/* Circular Progress */}
            <div className="relative">
              <svg className="transform -rotate-90" width="300" height="300">
                <circle
                  cx="150"
                  cy="150"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-muted/20"
                />
                <motion.circle
                  cx="150"
                  cy="150"
                  r={radius}
                  stroke="url(#timerGradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={isBreak ? "hsl(var(--secondary))" : "hsl(var(--primary))"} />
                    <stop offset="100%" stopColor={isBreak ? "hsl(var(--accent))" : "hsl(var(--secondary))"} />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Timer Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    key={`${minutes}-${seconds}`}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl md:text-7xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent"
                  >
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </motion.div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {Math.round(progress)}% complete
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 mt-8">
              <Button
                onClick={toggleTimer}
                size="lg"
                className={`rounded-full w-16 h-16 p-0 transition-smooth ${
                  isActive
                    ? 'bg-secondary hover:bg-secondary/90'
                    : 'gradient-primary'
                } text-white`}
              >
                {isActive ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>
              
              <Button
                onClick={resetTimer}
                size="lg"
                variant="outline"
                className="rounded-full w-16 h-16 p-0 glass-card border-border transition-smooth hover:bg-accent/10"
              >
                <RotateCcw className="w-6 h-6" />
              </Button>

              <Button
                onClick={() => setSoundEnabled(!soundEnabled)}
                size="lg"
                variant="outline"
                className="rounded-full w-16 h-16 p-0 glass-card border-border transition-smooth hover:bg-accent/10"
              >
                {soundEnabled ? (
                  <Volume2 className="w-6 h-6" />
                ) : (
                  <VolumeX className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Sound Options */}
        <AnimatePresence>
          {soundEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-2xl p-6 overflow-hidden transition-colors duration-300"
            >
              <h3 className="font-semibold mb-4 text-foreground">Background Sounds</h3>
              <div className="grid grid-cols-3 gap-4">
                {['Rain 🌧️', 'Coffee Shop ☕', 'Forest 🌲'].map((sound) => (
                  <Button
                    key={sound}
                  variant="outline"
                  className="glass-card border-border hover:bg-accent/10 transition-all duration-300 rounded-xl py-6"
                >
                    {sound}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Timer;
