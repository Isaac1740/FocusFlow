import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { API_URL } from "../config";

type Task = {
  id: number;
  date: string;      // "YYYY-MM-DD"
  time?: string;
  task: string;
  icon?: string;
  color?: string;
  duration?: string; // free text like "1h", "30m", "90", "1.5h"
};

type DailyStat = { day: string; focus: number; dsa: number; custom: number };

const daysArray = (n: number) => {
  const arr: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    arr.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD
  }
  return arr;
};

// parse duration string to minutes
function parseDurationToMinutes(d?: string): number {
  if (!d) return 0;
  const s = String(d).trim().toLowerCase();

  // patterns: "1h", "1.5h", "90", "30m", "30 min", "1 hr", "1 hour"
  const hourMatch = s.match(/([\d.]+)\s*h(ou)?r?/);
  if (hourMatch) {
    const val = parseFloat(hourMatch[1]);
    if (!isNaN(val)) return Math.round(val * 60);
  }

  const minMatch = s.match(/([\d.]+)\s*m(in)?/);
  if (minMatch) {
    const val = parseFloat(minMatch[1]);
    if (!isNaN(val)) return Math.round(val);
  }

  // plain number (assume minutes if >0)
  const num = parseFloat(s);
  if (!isNaN(num)) {
    // heuristics: if number <= 6 and contains decimal maybe it's hours? (e.g., 1.5)
    // but safer: if number <= 6 and contains '.' treat as hours
    if (s.includes(".") && num <= 6) {
      return Math.round(num * 60);
    }
    // if number >= 24 treat as minutes (someone put minutes). If <= 6 treat as hours? ambiguous.
    // We'll assume plain integers are minutes unless <=6 and user likely meant hours using decimal (handled above).
    return Math.round(num);
  }

  return 0;
}

export default function Progress() {
  const [loading, setLoading] = useState<boolean>(true);
  const [weekData, setWeekData] = useState<DailyStat[]>([]);
  const [focusHours, setFocusHours] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [productivity, setProductivity] = useState<number>(0);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [customTrackers, setCustomTrackers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTracker, setNewTracker] = useState({ title: "", emoji: "⚡", progress: 0 });

  useEffect(() => {
    // load custom trackers from localStorage (keep existing behavior)
    const saved = localStorage.getItem("customTrackers");
    if (saved) setCustomTrackers(JSON.parse(saved));
  }, []);

  useEffect(() => {
    // fetch tasks for the last 7 days and compute stats
    async function load() {
      setLoading(true);
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          // not logged in: keep dummy data but show prompt
          setWeekData(defaultWeekData());
          setFocusHours(0);
          setStreak(0);
          setProductivity(0);
          setRadarData(defaultRadar(0, 0));
          setLoading(false);
          return;
        }

        const days = daysArray(7); // last 7 days YYYY-MM-DD
        const perDay: DailyStat[] = [];
        let totalMinutes = 0;
        const daysWithTasks: string[] = [];

        for (const day of days) {
          // call backend endpoint for each day
          const url = `${API_URL}/api/get_tasks?user_id=${encodeURIComponent(userId)}&date=${encodeURIComponent(day)}`;
          try {
            const res = await fetch(url);
            const json = await res.json();
            const tasks: Task[] = (json && json.success && Array.isArray(json.tasks)) ? json.tasks : [];

            // count focus minutes for this day
            let dayMinutes = 0;
            tasks.forEach((t) => {
              dayMinutes += parseDurationToMinutes(t.duration);
            });

            if (tasks.length > 0) daysWithTasks.push(day);

            totalMinutes += dayMinutes;

            // DSA: try detect tasks containing "dsa" or "problem" or "leetcode" as proxy (fallback)
            const dayDSA = tasks.filter(t => /dsa|leetcode|problem|algo|algorithm|practice|code/i.test(t.task)).length;
            const dayFocusScore = Math.round(dayMinutes / 60); // hours as int for chart

            perDay.push({
              day: new Date(day).toLocaleDateString(undefined, { weekday: "short" }), // 'Mon' etc
              focus: dayFocusScore,
              dsa: dayDSA,
              custom: 0
            });
          } catch (e) {
            // on per-day fetch error, push zeros
            perDay.push({
              day: new Date(day).toLocaleDateString(undefined, { weekday: "short" }),
              focus: 0, dsa: 0, custom: 0
            });
          }
        }

        // compute focus hours total
        const hours = Math.round((totalMinutes / 60) * 100) / 100;
        setFocusHours(hours);

        // streak: consecutive days from today backwards
        let s = 0;
        const today = new Date();
        // create set of daysWithTasks in YYYY-MM-DD
        const setDays = new Set(daysWithTasks);
        let delta = 0;
        while (true) {
          const d = new Date(today);
          d.setDate(today.getDate() - delta);
          const key = d.toISOString().slice(0, 10);
          if (setDays.has(key)) {
            s += 1;
            delta += 1;
          } else {
            break;
          }
        }
        setStreak(s);

        // productivity: share of days with at least one task
        const productivityPercent = Math.round((daysWithTasks.length / days.length) * 100);
        setProductivity(productivityPercent);

        // radar data: compute a normalized score out of 100 for focus using hours
        // focusScore = min(100, hours / (7*2) * 100) assuming 2 hours/day target
        const focusScore = Math.min(100, Math.round((hours / (7 * 2)) * 100));
        // dsaScore: ratio of DSA tasks to total tasks (approx) -> compute total tasks
        const totalTasksCount = perDay.reduce((acc, d) => acc + (d.focus > 0 ? 1 : 0) + d.dsa, 0) || 0;
        // naive dsa score
        const dsaScore = Math.min(100, Math.round((perDay.reduce((acc, d) => acc + d.dsa, 0) / Math.max(1, totalTasksCount)) * 100));

        setRadarData([
          { category: "Focus", value: focusScore },
          { category: "DSA", value: dsaScore },
          { category: "Planning", value: 75 },
          { category: "Consistency", value: Math.min(100, 50 + s * 7) }, // approx
          { category: "Wellness", value: 65 }
        ]);

        // set week data for charts - keep focus numeric for chart (hours or counts)
        setWeekData(perDay);

      } catch (err) {
        console.error("Progress load error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // default week data if not logged in
  function defaultWeekData(): DailyStat[] {
    const d = daysArray(7);
    return d.map(day => ({ day: new Date(day).toLocaleDateString(undefined, { weekday: "short" }), focus: 0, dsa: 0, custom: 0 }));
  }

  // custom trackers handlers — kept from previous file
  const addTracker = () => {
    if (newTracker.title.trim()) {
      const tracker = { id: Date.now().toString(), title: newTracker.title, emoji: newTracker.emoji, progress: newTracker.progress };
      setCustomTrackers(prev => {
        const next = [...prev, tracker];
        localStorage.setItem("customTrackers", JSON.stringify(next));
        return next;
      });
      setNewTracker({ title: "", emoji: "⚡", progress: 0 });
      setIsDialogOpen(false);
    }
  };

  const updateTracker = (id: string, progress: number) => {
    setCustomTrackers(prev => {
      const next = prev.map(t => t.id === id ? { ...t, progress } : t);
      localStorage.setItem("customTrackers", JSON.stringify(next));
      return next;
    });
  };

  const deleteTracker = (id: string) => {
    setCustomTrackers(prev => {
      const next = prev.filter(t => t.id !== id);
      localStorage.setItem("customTrackers", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-6xl mx-auto bg-background transition-colors duration-300">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Progress Tracker 📊</h1>
        <p className="text-muted-foreground">Your real progress (last 7 days)</p>
      </motion.div>

      {loading ? (
        <div className="text-center py-16">Loading progress...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card rounded-2xl p-6">
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{focusHours}h</div>
              <div className="text-xs text-muted-foreground mb-1">Focus Hours (7 days)</div>
              <div className="text-xs text-secondary font-medium">Total</div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{streak} days</div>
              <div className="text-xs text-muted-foreground mb-1">Current Streak</div>
              <div className="text-xs text-secondary font-medium">Consecutive</div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{productivity}%</div>
              <div className="text-xs text-muted-foreground mb-1">Productivity</div>
              <div className="text-xs text-secondary font-medium">Days active (last 7)</div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{customTrackers.length}</div>
              <div className="text-xs text-muted-foreground mb-1">Custom Trackers</div>
              <div className="text-xs text-secondary font-medium">Personal Goals</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Weekly Activity</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="focus" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="dsa" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Performance Overview</h2>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <Radar name="Performance" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Custom trackers and badges (kept from old UI) */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-foreground">Custom Trackers</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setNewTracker({ title: "", emoji: "⚡", progress: 0 }); setIsDialogOpen(true); }} className="gradient-primary text-white">
                    Add Tracker
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-border">
                  <DialogHeader>
                    <DialogTitle>Add New Tracker</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label>Title</label>
                      <input value={newTracker.title} onChange={(e) => setNewTracker({ ...newTracker, title: e.target.value })} className="w-full" />
                    </div>
                    <div>
                      <label>Emoji</label>
                      <input value={newTracker.emoji} onChange={(e) => setNewTracker({ ...newTracker, emoji: e.target.value })} maxLength={2} />
                    </div>
                    <div>
                      <label>Progress: {newTracker.progress}%</label>
                      <Slider value={[newTracker.progress]} onValueChange={(v) => setNewTracker({ ...newTracker, progress: v[0] })} max={100} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addTracker} className="gradient-primary text-white">Add</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {customTrackers.map((t, i) => (
                <div key={t.id} className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{t.emoji}</div>
                      <div>
                        <div className="font-semibold">{t.title}</div>
                        <div className="text-sm text-muted-foreground">{t.progress}%</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => updateTracker(t.id, Math.min(100, t.progress + 10))}>+</Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteTracker(t.id)}>Delete</Button>
                    </div>
                  </div>
                </div>
              ))}
              {customTrackers.length === 0 && (
                <div className="glass-card rounded-2xl p-8 text-center">No custom trackers yet. Create one to track your goals!</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
