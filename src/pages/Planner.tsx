import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Briefcase, Dumbbell, Heart, Coffee, Plus, ChevronLeft, ChevronRight, Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface TimeBlock {
  id: string;
  time: string;
  task: string;
  icon: string;
  color: string;
  duration: string;
}

const iconOptions = [
  { value: 'Coffee', label: '☕ Coffee', icon: Coffee },
  { value: 'Book', label: '📚 Study', icon: Book },
  { value: 'Briefcase', label: '💼 Work', icon: Briefcase },
  { value: 'Dumbbell', label: '⚽ Exercise', icon: Dumbbell },
  { value: 'Heart', label: '❤️ Personal', icon: Heart },
];

const colorOptions = [
  { value: 'hsl(var(--primary))', label: 'Primary' },
  { value: 'hsl(var(--secondary))', label: 'Secondary' },
  { value: 'hsl(var(--accent))', label: 'Accent' },
  { value: 'hsl(180 60% 55%)', label: 'Teal' },
  { value: 'hsl(340 75% 60%)', label: 'Pink' },
];

const Planner = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  
  const [formData, setFormData] = useState({
    time: '09:00',
    task: '',
    icon: 'Book',
    color: 'hsl(var(--primary))',
    duration: '1 hour'
  });

  useEffect(() => {
    const saved = localStorage.getItem('plannerBlocks');
    if (saved) {
      setTimeBlocks(JSON.parse(saved));
    } else {
      const defaultBlocks = [
        { id: '1', time: '08:00', task: 'Morning Routine', icon: 'Coffee', color: 'hsl(var(--accent))', duration: '1 hour' },
        { id: '2', time: '09:00', task: 'Study Session', icon: 'Book', color: 'hsl(var(--primary))', duration: '2 hours' },
        { id: '3', time: '11:00', task: 'Project Work', icon: 'Briefcase', color: 'hsl(var(--secondary))', duration: '1.5 hours' },
        { id: '4', time: '14:00', task: 'Football Practice', icon: 'Dumbbell', color: 'hsl(180 60% 55%)', duration: '1 hour' },
        { id: '5', time: '16:00', task: 'Personal Time', icon: 'Heart', color: 'hsl(340 75% 60%)', duration: '30 mins' },
      ];
      setTimeBlocks(defaultBlocks);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('plannerBlocks', JSON.stringify(timeBlocks));
  }, [timeBlocks]);

  const getIcon = (iconName: string) => {
    const found = iconOptions.find(opt => opt.value === iconName);
    return found ? found.icon : Book;
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const resetToToday = () => {
    setCurrentDate(new Date());
  };

  const addOrUpdateBlock = () => {
    if (!formData.task.trim()) {
      toast.error('Please enter a task name');
      return;
    }

    if (editingBlock) {
      setTimeBlocks(prev => 
        prev.map(block => 
          block.id === editingBlock.id 
            ? { ...block, ...formData }
            : block
        )
      );
      toast.success('Block updated!');
    } else {
      const newBlock: TimeBlock = {
        id: Date.now().toString(),
        ...formData
      };
      setTimeBlocks(prev => [...prev, newBlock].sort((a, b) => a.time.localeCompare(b.time)));
      toast.success('Block added!');
    }

    resetForm();
  };

  const deleteBlock = (id: string) => {
    setTimeBlocks(prev => prev.filter(block => block.id !== id));
    toast.success('Block deleted!');
  };

  const startEdit = (block: TimeBlock) => {
    setEditingBlock(block);
    setFormData({
      time: block.time,
      task: block.task,
      icon: block.icon,
      color: block.color,
      duration: block.duration
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      time: '09:00',
      task: '',
      icon: 'Book',
      color: 'hsl(var(--primary))',
      duration: '1 hour'
    });
    setEditingBlock(null);
    setIsDialogOpen(false);
  };

  const addTemplate = (template: string) => {
    const templates = {
      'Study': { task: 'Study Session', icon: 'Book', color: 'hsl(var(--primary))', duration: '2 hours' },
      'Work': { task: 'Project Work', icon: 'Briefcase', color: 'hsl(var(--secondary))', duration: '1.5 hours' },
      'Exercise': { task: 'Workout', icon: 'Dumbbell', color: 'hsl(180 60% 55%)', duration: '1 hour' },
      'Relax': { task: 'Personal Time', icon: 'Heart', color: 'hsl(340 75% 60%)', duration: '30 mins' },
    };

    setFormData(prev => ({
      ...prev,
      ...templates[template as keyof typeof templates]
    }));
    setIsDialogOpen(true);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const isToday = currentDate.toDateString() === today.toDateString();

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-6xl mx-auto bg-background transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Routine Planner 📅
        </h1>
        <p className="text-muted-foreground">
          Plan your day with time blocks and stay organized
        </p>
      </motion.div>

      {/* Date Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="glass-card rounded-3xl p-6 mb-6 transition-colors duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDay('prev')}
            className="rounded-xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </h2>
            <p className="text-muted-foreground">
              {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            {!isToday && (
              <Button
                variant="link"
                onClick={resetToToday}
                className="text-sm mt-1"
              >
                Back to Today
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDay('next')}
            className="rounded-xl"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex justify-between items-center gap-2">
          {[-3, -2, -1, 0, 1, 2, 3].map((offset) => {
            const date = new Date(currentDate);
            date.setDate(date.getDate() + offset);
            const isSelected = offset === 0;
            const isTodayDate = date.toDateString() === today.toDateString();
            
            return (
              <button
                key={offset}
                onClick={() => setCurrentDate(date)}
                className={`flex-1 text-center py-3 rounded-xl transition-smooth ${
                  isSelected
                    ? 'gradient-primary text-white'
                    : isTodayDate
                    ? 'bg-accent/20 hover:bg-accent/30'
                    : 'hover:bg-accent/10'
                }`}
              >
                <div className="text-xs md:text-sm font-medium">
                  {weekDays[date.getDay()]}
                </div>
                <div className={`text-lg md:text-xl font-bold mt-1 ${
                  isSelected ? 'text-white' : 'text-foreground'
                }`}>
                  {date.getDate()}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Today's Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-4 mb-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-foreground">Today's Schedule</h2>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="gradient-primary text-white hover:opacity-90 transition-smooth rounded-xl"
                onClick={() => setEditingBlock(null)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Block
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingBlock ? 'Edit Time Block' : 'Add Time Block'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Task</label>
                  <Input
                    placeholder="Enter task name"
                    value={formData.task}
                    onChange={(e) => setFormData(prev => ({ ...prev, task: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <Select value={formData.duration} onValueChange={(val) => setFormData(prev => ({ ...prev, duration: val }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30 mins">30 minutes</SelectItem>
                      <SelectItem value="1 hour">1 hour</SelectItem>
                      <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                      <SelectItem value="2 hours">2 hours</SelectItem>
                      <SelectItem value="3 hours">3 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon</label>
                  <Select value={formData.icon} onValueChange={(val) => setFormData(prev => ({ ...prev, icon: val }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <Select value={formData.color} onValueChange={(val) => setFormData(prev => ({ ...prev, color: val }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: opt.value }}
                            />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={addOrUpdateBlock} className="flex-1">
                    <Check className="w-4 h-4 mr-2" />
                    {editingBlock ? 'Update' : 'Add'}
                  </Button>
                  <Button variant="outline" onClick={resetForm} className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {timeBlocks.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <p className="text-muted-foreground mb-4">No time blocks scheduled yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Block
              </Button>
            </div>
          ) : (
            timeBlocks.map((block, index) => {
              const Icon = getIcon(block.icon);
              return (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                className="glass-card rounded-2xl p-4 hover:scale-[1.02] transition-all duration-300"
              >
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-semibold text-muted-foreground w-16">
                      {block.time}
                    </div>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${block.color}20`, color: block.color }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{block.task}</h3>
                      <p className="text-sm text-muted-foreground">{block.duration}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg hover:bg-accent/10"
                        onClick={() => startEdit(block)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => deleteBlock(block.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Quick Add Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold text-foreground mb-4">Quick Templates</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '📚', label: 'Study' },
            { icon: '💻', label: 'Work' },
            { icon: '⚽', label: 'Exercise' },
            { icon: '🧘', label: 'Relax' },
          ].map((template, index) => (
            <motion.div
              key={template.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
            >
              <Button
                variant="outline"
                onClick={() => addTemplate(template.label)}
                className="glass-card border-border hover:bg-accent/10 transition-all duration-300 rounded-xl w-full py-8 flex flex-col gap-2"
              >
                <span className="text-3xl">{template.icon}</span>
                <span className="text-sm font-medium">{template.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Planner;
