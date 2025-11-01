import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Book, Briefcase, Dumbbell, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProgressRing from '@/components/ProgressRing';
import FocusCard from '@/components/FocusCard';
import { useNavigate } from 'react-router-dom';

interface FocusTask {
  icon: any;
  title: string;
  duration: string;
  completed: boolean;
  color: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [focusTime, setFocusTime] = useState<string>('25');
  const [todaysFocus, setTodaysFocus] = useState<FocusTask[]>([
    { icon: Book, title: 'Study Session', duration: '2 hours', completed: false, color: 'hsl(var(--primary))' },
    { icon: Briefcase, title: 'Project Work', duration: '1.5 hours', completed: false, color: 'hsl(var(--secondary))' },
    { icon: Dumbbell, title: 'Football Practice', duration: '1 hour', completed: false, color: 'hsl(var(--accent))' },
    { icon: Heart, title: 'Personal Time', duration: '30 mins', completed: false, color: 'hsl(180 60% 55%)' },
  ]);

  useEffect(() => {
    const savedTasks = localStorage.getItem('todaysFocus');
    const savedFocusTime = localStorage.getItem('focusTime');
    
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks);
      const tasksWithIcons = parsed.map((task: any) => ({
        ...task,
        icon: task.title.includes('Study') ? Book
          : task.title.includes('Project') ? Briefcase
          : task.title.includes('Football') ? Dumbbell
          : Heart
      }));
      setTodaysFocus(tasksWithIcons);
    }
    
    if (savedFocusTime) {
      setFocusTime(savedFocusTime);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todaysFocus', JSON.stringify(todaysFocus));
  }, [todaysFocus]);

  useEffect(() => {
    localStorage.setItem('focusTime', focusTime);
  }, [focusTime]);

  const toggleTask = (index: number) => {
    setTodaysFocus(prev => 
      prev.map((task, i) => 
        i === index ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const quotes = [
    "Focus is the gateway to thinking clearly.",
    "Small daily improvements lead to stunning results.",
    "Balance is not something you find, it's something you create.",
    "The secret of change is to focus all of your energy on building the new.",
  ];

  const todayQuote = quotes[new Date().getDate() % quotes.length];
  const completedTasks = todaysFocus.filter(task => task.completed).length;
  const progress = (completedTasks / todaysFocus.length) * 100;

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-6xl mx-auto bg-background transition-colors duration-300">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </motion.div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className={`glass-card rounded-3xl p-6 md:p-8 transition-colors duration-300`}
        >
          <h2 className="text-xl font-semibold mb-6 text-foreground">Today's Progress</h2>
          <div className="flex flex-col items-center">
            <ProgressRing progress={progress} size={160} strokeWidth={12} />
            <p className="mt-4 text-muted-foreground text-center">
              {completedTasks} of {todaysFocus.length} tasks completed
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Focus Time Duration</label>
                <Select value={focusTime} onValueChange={setFocusTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => navigate('/timer', { state: { duration: parseInt(focusTime) } })}
                className="w-full gradient-primary text-white hover:opacity-90 transition-smooth rounded-xl py-6 text-lg font-medium"
              >
                <Play className="w-5 h-5 mr-2" />
                Focus Now ({focusTime} min)
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quote Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass-card rounded-3xl p-6 md:p-8 gradient-primary relative overflow-hidden transition-colors duration-300"
        >
          <div className="relative z-10">
            <div className="text-6xl mb-4 opacity-20">"</div>
            <p className="text-lg md:text-xl text-white font-medium leading-relaxed mb-4">
              {todayQuote}
            </p>
            <p className="text-white/80 text-sm">— Daily Motivation</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
        </motion.div>
      </div>

      {/* Today's Focus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Today's Focus</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {todaysFocus.map((task, index) => {
            const Icon = task.icon;
            return (
              <motion.div
                key={task.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                className={`glass-card rounded-2xl p-6 hover-scale cursor-pointer transition-all duration-300 ${
                  task.completed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(index)}
                    className="mt-1"
                  />
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${task.color}20`, color: task.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-foreground mb-1 ${
                      task.completed ? 'line-through' : ''
                    }`}>
                      {task.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{task.duration}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Button
          variant="outline"
          onClick={() => navigate('/planner')}
          className="glass-card border-border hover:bg-accent/10 transition-all duration-300 rounded-xl py-8 flex flex-col gap-2"
        >
          <span className="text-2xl">📅</span>
          <span className="text-sm font-medium">Plan Day</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/progress')}
          className="glass-card border-border hover:bg-accent/10 transition-all duration-300 rounded-xl py-8 flex flex-col gap-2"
        >
          <span className="text-2xl">📊</span>
          <span className="text-sm font-medium">View Stats</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/dsa')}
          className="glass-card border-border hover:bg-accent/10 transition-all duration-300 rounded-xl py-8 flex flex-col gap-2"
        >
          <span className="text-2xl">💻</span>
          <span className="text-sm font-medium">DSA Tracker</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/wellness')}
          className="glass-card border-border hover:bg-accent/10 transition-all duration-300 rounded-xl py-8 flex flex-col gap-2"
        >
          <span className="text-2xl">👁️</span>
          <span className="text-sm font-medium">Wellness</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/timer')}
          className="glass-card border-border hover:bg-accent/10 transition-all duration-300 rounded-xl py-8 flex flex-col gap-2"
        >
          <span className="text-2xl">🎯</span>
          <span className="text-sm font-medium">Zen Mode</span>
        </Button>
      </motion.div>
    </div>
  );
};

export default Dashboard;
