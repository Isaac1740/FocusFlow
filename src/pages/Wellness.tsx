import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Activity, Bell, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const Wellness = () => {
  const [eyeReminders, setEyeReminders] = useState(true);
  const [stretchReminders, setStretchReminders] = useState(true);
  const [reminderInterval, setReminderInterval] = useState(30);

  const exercises = [
    {
      icon: Eye,
      title: '20-20-20 Rule',
      description: 'Every 20 minutes, look at something 20 feet away for 20 seconds',
      duration: '20 sec',
    },
    {
      icon: Activity,
      title: 'Desk Stretches',
      description: 'Stand up and stretch your arms, neck, and back',
      duration: '2 min',
    },
    {
      icon: Clock,
      title: 'Walk Break',
      description: 'Take a short walk to refresh your mind and body',
      duration: '5 min',
    },
  ];

  const intervals = [20, 30, 45, 60];

  const handleExercise = (title: string) => {
    toast.success(`Starting ${title}! Take your time 🧘‍♂️`);
  };

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-4xl mx-auto bg-background transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Eye & Wellness 👁️
        </h1>
        <p className="text-muted-foreground">
          Take care of your eyes and body while you work
        </p>
      </motion.div>

      {/* Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="glass-card rounded-3xl p-6 mb-6"
      >
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Reminder Settings
        </h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">Eye Rest Reminders</div>
              <div className="text-sm text-muted-foreground">
                Get notified to rest your eyes
              </div>
            </div>
            <Switch
              checked={eyeReminders}
              onCheckedChange={setEyeReminders}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">Stretch Reminders</div>
              <div className="text-sm text-muted-foreground">
                Stay active with stretch breaks
              </div>
            </div>
            <Switch
              checked={stretchReminders}
              onCheckedChange={setStretchReminders}
            />
          </div>

          <div>
            <div className="font-medium text-foreground mb-3">Reminder Interval</div>
            <div className="grid grid-cols-4 gap-3">
              {intervals.map((interval) => (
                <Button
                  key={interval}
                  variant={reminderInterval === interval ? 'default' : 'outline'}
                  className={`rounded-xl ${
                    reminderInterval === interval
                      ? 'gradient-primary text-white'
                      : 'glass-card border-border hover:bg-accent/10'
                  }`}
                  onClick={() => {
                    setReminderInterval(interval);
                    toast.success(`Reminders set to every ${interval} minutes`);
                  }}
                >
                  {interval}m
                </Button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Exercises */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-foreground mb-4">Quick Exercises</h2>
        <div className="space-y-4">
          {exercises.map((exercise, index) => {
            const Icon = exercise.icon;
            return (
              <motion.div
                key={exercise.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-smooth"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{exercise.title}</h3>
                    <p className="text-sm text-muted-foreground">{exercise.description}</p>
                  </div>
                  <div className="text-sm font-medium text-secondary">
                    {exercise.duration}
                  </div>
                </div>
                <Button
                  onClick={() => handleExercise(exercise.title)}
                  className="w-full gradient-primary text-white hover:opacity-90 transition-smooth rounded-xl"
                >
                  Start Exercise
                </Button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="glass-card rounded-3xl p-6 mt-6 gradient-soft transition-colors duration-300"
      >
        <h3 className="text-lg font-semibold text-foreground mb-3">💡 Wellness Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Blink frequently to keep your eyes moist</li>
          <li>• Adjust screen brightness to match your environment</li>
          <li>• Maintain good posture while working</li>
          <li>• Stay hydrated throughout the day</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default Wellness;
