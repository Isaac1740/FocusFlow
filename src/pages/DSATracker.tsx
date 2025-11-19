import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Target, Flame, Plus, Minus, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Topic {
  id: string;
  name: string;
  solved: number;
  total: number;
  lastPracticed: string | null;
  notes: string;
}

interface DailyProgress {
  date: string;
  problemsSolved: number;
}

const DSATracker = () => {
  const [topics, setTopics] = useState<Topic[]>([
    { id: '1', name: 'Arrays', solved: 0, total: 50, lastPracticed: null, notes: '' },
    { id: '2', name: 'Strings', solved: 0, total: 40, lastPracticed: null, notes: '' },
    { id: '3', name: 'Linked Lists', solved: 0, total: 30, lastPracticed: null, notes: '' },
    { id: '4', name: 'Stacks & Queues', solved: 0, total: 25, lastPracticed: null, notes: '' },
    { id: '5', name: 'Trees', solved: 0, total: 45, lastPracticed: null, notes: '' },
    { id: '6', name: 'Graphs', solved: 0, total: 35, lastPracticed: null, notes: '' },
    { id: '7', name: 'Dynamic Programming', solved: 0, total: 40, lastPracticed: null, notes: '' },
    { id: '8', name: 'Sorting & Searching', solved: 0, total: 30, lastPracticed: null, notes: '' },
  ]);
  
  const [dailyGoal, setDailyGoal] = useState(3);
  const [todayProgress, setTodayProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<DailyProgress[]>([]);
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('dsaTracker');
    if (saved) {
      const data = JSON.parse(saved);
      setTopics(data.topics || topics);
      setDailyGoal(data.dailyGoal || 3);
      setStreak(data.streak || 0);
      setHistory(data.history || []);
      
      const today = new Date().toDateString();
      const todayData = data.history?.find((h: DailyProgress) => h.date === today);
      setTodayProgress(todayData?.problemsSolved || 0);
    }
  }, []);

  useEffect(() => {
    const data = {
      topics,
      dailyGoal,
      streak,
      history,
    };
    localStorage.setItem('dsaTracker', JSON.stringify(data));
  }, [topics, dailyGoal, streak, history]);

  const updateTopicProgress = (topicId: string, delta: number) => {
    setTopics(topics.map(topic => {
      if (topic.id === topicId) {
        const newSolved = Math.max(0, Math.min(topic.total, topic.solved + delta));
        if (newSolved > topic.solved) {
          updateDailyProgress(newSolved - topic.solved);
        }
        return {
          ...topic,
          solved: newSolved,
          lastPracticed: delta > 0 ? new Date().toDateString() : topic.lastPracticed,
        };
      }
      return topic;
    }));
    
    if (delta > 0) {
      toast.success('Progress updated! 🎯');
    }
  };

  const updateDailyProgress = (count: number) => {
    const today = new Date().toDateString();
    const newProgress = todayProgress + count;
    setTodayProgress(newProgress);
    
    setHistory(prev => {
      const existing = prev.findIndex(h => h.date === today);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing].problemsSolved = newProgress;
        return updated;
      }
      return [...prev, { date: today, problemsSolved: newProgress }];
    });

    if (newProgress >= dailyGoal && todayProgress < dailyGoal) {
      setStreak(prev => prev + 1);
      toast.success('Daily goal achieved! 🔥');
    }
  };

  const getStatus = (solved: number, total: number) => {
    if (solved === 0) return { label: 'Not Started', color: 'bg-muted text-muted-foreground' };
    if (solved === total) return { label: 'Completed', color: 'bg-primary text-primary-foreground' };
    return { label: 'In Progress', color: 'bg-secondary text-secondary-foreground' };
  };

  const saveNote = (topicId: string) => {
    setTopics(topics.map(topic => 
      topic.id === topicId ? { ...topic, notes: editNote } : topic
    ));
    setEditingTopic(null);
    setEditNote('');
    toast.success('Note saved!');
  };

  const chartData = topics.map(topic => ({
    name: topic.name.length > 12 ? topic.name.substring(0, 10) + '...' : topic.name,
    progress: Math.round((topic.solved / topic.total) * 100),
  }));

  const recentHistory = history.slice(-7).map(h => ({
    date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    problems: h.problemsSolved,
  }));

  const totalSolved = topics.reduce((sum, topic) => sum + topic.solved, 0);
  const totalProblems = topics.reduce((sum, topic) => sum + topic.total, 0);

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6 bg-background transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold gradient-text">DSA Tracker</h1>
            <p className="text-muted-foreground">Master Data Structures & Algorithms consistently</p>
            {streak > 0 && (
              <motion.p
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-lg font-medium text-primary flex items-center justify-center gap-2"
              >
                <Flame className="w-5 h-5" />
                {streak} day streak! Keep going! 🔥
              </motion.p>
            )}
          </div>

          {/* Daily Goal Section */}
          <Card className="glass-card border-primary/20 transition-colors duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Daily Goal
              </CardTitle>
              <CardDescription>
                Solve {dailyGoal} problems every day to maintain your streak
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Problems per day:</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setDailyGoal(Math.max(1, dailyGoal - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-bold text-xl">{dailyGoal}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setDailyGoal(dailyGoal + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Today's Progress</span>
                  <span className="font-bold">{todayProgress} / {dailyGoal}</span>
                </div>
                <Progress value={(todayProgress / dailyGoal) * 100} className="h-3" />
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2">
                  <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-500' : 'text-muted'}`} />
                  <span className="text-sm">{streak} day streak</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold gradient-text">{totalSolved}</p>
                  <p className="text-xs text-muted-foreground">total solved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card transition-colors duration-300">
              <CardHeader>
                <CardTitle>Topic Progress</CardTitle>
                <CardDescription>Completion percentage by topic</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card transition-colors duration-300">
              <CardHeader>
                <CardTitle>Daily Performance</CardTitle>
                <CardDescription>Last 7 days activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={recentHistory}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="problems" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Topics Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Topics</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic, index) => {
                const status = getStatus(topic.solved, topic.total);
                const progress = (topic.solved / topic.total) * 100;
                
                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass-card hover:shadow-glow transition-all duration-300">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{topic.name}</CardTitle>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                        <CardDescription>
                          {topic.lastPracticed 
                            ? `Last: ${new Date(topic.lastPracticed).toLocaleDateString()}`
                            : 'Not started yet'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span className="font-bold">{topic.solved} / {topic.total}</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateTopicProgress(topic.id, -1)}
                            disabled={topic.solved === 0}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => updateTopicProgress(topic.id, 1)}
                            disabled={topic.solved >= topic.total}
                          >
                            <Plus className="w-4 h-4" />
                            Solve Problem
                          </Button>
                        </div>

                        {editingTopic === topic.id ? (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Add notes or reminders..."
                              value={editNote}
                              onChange={(e) => setEditNote(e.target.value)}
                              className="min-h-[80px]"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => saveNote(topic.id)}>
                                <Check className="w-4 h-4" />
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setEditingTopic(null);
                                  setEditNote('');
                                }}
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {topic.notes ? (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                  {topic.notes}
                                </p>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingTopic(topic.id);
                                    setEditNote(topic.notes);
                                  }}
                                >
                                  <Edit2 className="w-3 h-3 mr-1" />
                                  Edit Note
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingTopic(topic.id);
                                  setEditNote('');
                                }}
                              >
                                <Edit2 className="w-3 h-3 mr-1" />
                                Add Note
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DSATracker;
