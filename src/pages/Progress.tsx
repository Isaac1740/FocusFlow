import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Calendar, Target, Plus, Edit2, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';

interface CustomTracker {
  id: string;
  title: string;
  emoji: string;
  progress: number;
}

interface DailyStat {
  day: string;
  focus: number;
  dsa: number;
  custom: number;
}

const Progress = () => {
  const [customTrackers, setCustomTrackers] = useState<CustomTracker[]>([]);
  const [editingTracker, setEditingTracker] = useState<CustomTracker | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTracker, setNewTracker] = useState({ title: '', emoji: '⚡', progress: 0 });

  // Load custom trackers from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customTrackers');
    if (saved) {
      setCustomTrackers(JSON.parse(saved));
    }
  }, []);

  // Save custom trackers to localStorage
  useEffect(() => {
    localStorage.setItem('customTrackers', JSON.stringify(customTrackers));
  }, [customTrackers]);

  // Get DSA data from localStorage
  const getDSAProgress = () => {
    const dsaData = localStorage.getItem('dsaTrackerData');
    if (dsaData) {
      const data = JSON.parse(dsaData);
      const totalSolved = data.topics?.reduce((acc: number, topic: any) => acc + topic.solved, 0) || 0;
      const totalProblems = data.topics?.reduce((acc: number, topic: any) => acc + topic.total, 0) || 0;
      return totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;
    }
    return 0;
  };

  // Get focus data from Dashboard
  const getFocusProgress = () => {
    const focusData = localStorage.getItem('todaysFocus');
    if (focusData) {
      const tasks = JSON.parse(focusData);
      const completed = tasks.filter((t: any) => t.completed).length;
      return tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    }
    return 0;
  };

  const weekData: DailyStat[] = [
    { day: 'Mon', focus: 85, dsa: 60, custom: 70 },
    { day: 'Tue', focus: 90, dsa: 75, custom: 80 },
    { day: 'Wed', focus: 70, dsa: 50, custom: 65 },
    { day: 'Thu', focus: 95, dsa: 80, custom: 85 },
    { day: 'Fri', focus: 80, dsa: 70, custom: 75 },
    { day: 'Sat', focus: 60, dsa: 40, custom: 55 },
    { day: 'Sun', focus: 50, dsa: 30, custom: 45 },
  ];

  const radarData = [
    { category: 'Focus', value: getFocusProgress() },
    { category: 'DSA', value: getDSAProgress() },
    { category: 'Planning', value: 75 },
    { category: 'Consistency', value: 82 },
    { category: 'Wellness', value: 68 },
  ];

  const badges = [
    { icon: '🔥', title: '7-Day Streak', description: 'Consistent focus this week' },
    { icon: '⭐', title: 'Balanced Week', description: 'Great work-life balance' },
    { icon: '🎯', title: 'Goal Crusher', description: 'Hit all daily targets' },
    { icon: '💪', title: 'Early Bird', description: 'Started before 9 AM' },
  ];

  const stats = [
    { icon: Target, label: 'Focus Hours', value: '39h', change: '+12%' },
    { icon: Calendar, label: 'Current Streak', value: '7 days', change: '+2' },
    { icon: TrendingUp, label: 'Productivity', value: '89%', change: '+5%' },
    { icon: Award, label: 'Badges Earned', value: '12', change: '+4' },
  ];

  const addTracker = () => {
    if (newTracker.title.trim()) {
      const tracker: CustomTracker = {
        id: Date.now().toString(),
        title: newTracker.title,
        emoji: newTracker.emoji,
        progress: newTracker.progress,
      };
      setCustomTrackers([...customTrackers, tracker]);
      setNewTracker({ title: '', emoji: '⚡', progress: 0 });
      setIsDialogOpen(false);
    }
  };

  const updateTracker = () => {
    if (editingTracker) {
      setCustomTrackers(customTrackers.map(t => t.id === editingTracker.id ? editingTracker : t));
      setEditingTracker(null);
      setIsDialogOpen(false);
    }
  };

  const deleteTracker = (id: string) => {
    setCustomTrackers(customTrackers.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-6xl mx-auto bg-background transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Progress Tracker 📊
        </h1>
        <p className="text-muted-foreground">
          Track your focus time and celebrate your achievements
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass-card rounded-2xl p-6 transition-colors duration-300"
            >
              <Icon className="w-8 h-8 text-primary mb-3" />
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
              <div className="text-xs text-secondary font-medium">{stat.change}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
            className="glass-card rounded-3xl p-6 transition-colors duration-300"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">Weekly Activity</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="focus" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="dsa" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="custom" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Performance Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
            className="glass-card rounded-3xl p-6 transition-colors duration-300"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">Performance Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Custom Progress Trackers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-foreground">Custom Trackers</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingTracker(null);
                  setNewTracker({ title: '', emoji: '⚡', progress: 0 });
                }}
                className="gradient-primary text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Tracker
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border">
              <DialogHeader>
                <DialogTitle>{editingTracker ? 'Edit Tracker' : 'Add New Tracker'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editingTracker ? editingTracker.title : newTracker.title}
                    onChange={(e) => editingTracker
                      ? setEditingTracker({ ...editingTracker, title: e.target.value })
                      : setNewTracker({ ...newTracker, title: e.target.value })
                    }
                    placeholder="e.g., Football, Gym, Reading"
                  />
                </div>
                <div>
                  <Label htmlFor="emoji">Emoji</Label>
                  <Input
                    id="emoji"
                    value={editingTracker ? editingTracker.emoji : newTracker.emoji}
                    onChange={(e) => editingTracker
                      ? setEditingTracker({ ...editingTracker, emoji: e.target.value })
                      : setNewTracker({ ...newTracker, emoji: e.target.value })
                    }
                    placeholder="⚡"
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label htmlFor="progress">Progress: {editingTracker ? editingTracker.progress : newTracker.progress}%</Label>
                  <Slider
                    id="progress"
                    value={[editingTracker ? editingTracker.progress : newTracker.progress]}
                    onValueChange={(value) => editingTracker
                      ? setEditingTracker({ ...editingTracker, progress: value[0] })
                      : setNewTracker({ ...newTracker, progress: value[0] })
                    }
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={editingTracker ? updateTracker : addTracker}
                  className="gradient-primary text-white"
                >
                  {editingTracker ? 'Update' : 'Add'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {customTrackers.map((tracker, index) => (
            <motion.div
              key={tracker.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass-card rounded-2xl p-6 transition-colors duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{tracker.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{tracker.title}</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingTracker(tracker);
                          setIsDialogOpen(true);
                        }}
                        className="h-8 w-8"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteTracker(tracker.id)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${tracker.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full gradient-primary"
                      />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground min-w-[3rem] text-right">
                      {tracker.progress}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {customTrackers.length === 0 && (
            <div className="glass-card rounded-2xl p-8 text-center transition-colors duration-300">
              <p className="text-muted-foreground">No custom trackers yet. Create one to track your goals!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-foreground mb-4">Recent Achievements 🏆</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              className="glass-card rounded-2xl p-6 hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{badge.icon}</div>
                <div>
                  <h3 className="font-semibold text-foreground">{badge.title}</h3>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Progress;
