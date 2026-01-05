import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Book, Briefcase, Dumbbell, Heart, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProgressRing from "@/components/ProgressRing";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

interface FocusTask {
  icon: any;
  title: string;
  duration: string;
  completed: boolean;
  color: string;
}

const iconMap: any = {
  Coffee,
  Book,
  Briefcase,
  Dumbbell,
  Heart,
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [focusTime, setFocusTime] = useState<string>("25");
  const [todaysFocus, setTodaysFocus] = useState<FocusTask[]>([]);

  /* ================================
     LOAD USER INFO
  ================================= */
  useEffect(() => {
    const name = localStorage.getItem("username");
    if (name) setUsername(name);
  }, []);

  useEffect(() => {
    const t = localStorage.getItem("focusTime");
    if (t) setFocusTime(t);
  }, []);

  useEffect(() => {
    localStorage.setItem("focusTime", focusTime);
  }, [focusTime]);

  /* ================================
   FETCH PROFILE ON DASHBOARD LOAD
================================= */
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setUsername(data.user.username);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("email", data.user.email);
      }
    } catch (err) {
      console.error("❌ Failed to load profile", err);
    }
  };

  fetchProfile();
}, []);


  /* ================================
     LOAD TODAY TASKS (JWT FIXED)
  ================================= */
  const loadToday = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const dateStr = new Date().toISOString().split("T")[0];

    try {
      const res = await fetch(`${API_URL}/api/get_tasks?date=${dateStr}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        const mapped = data.tasks.map((item: any) => ({
          icon: iconMap[item.icon] || Heart,
          title: item.task,
          duration: item.duration,
          completed: false,
          color: item.color || "hsl(var(--primary))",
        }));

        setTodaysFocus(mapped);
      }
    } catch (err) {
      console.error("❌ Failed to load today tasks", err);
    }
  };

  useEffect(() => {
    loadToday();
  }, []);

  /* ================================
     TASK TOGGLE (UI ONLY)
  ================================= */
  const toggleTask = (index: number) => {
    setTodaysFocus((prev) =>
      prev.map((t, i) =>
        i === index ? { ...t, completed: !t.completed } : t
      )
    );
  };

  /* ================================
     PROGRESS
  ================================= */
  const completedTasks = todaysFocus.filter((t) => t.completed).length;
  const progress = todaysFocus.length
    ? (completedTasks / todaysFocus.length) * 100
    : 0;

  const quotes = [
    "Focus is the gateway to thinking clearly.",
    "Small daily improvements lead to stunning results.",
    "Balance is not something you find, it's something you create.",
    "The secret of change is to focus all of your energy on building the new.",
  ];
  const todayQuote = quotes[new Date().getDate() % quotes.length];

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-6xl mx-auto bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold">
          Welcome back, {username || "User"} 👋
        </h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Progress */}
        <motion.div className="glass-card rounded-3xl p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6">Today's Progress</h2>

          <div className="flex flex-col items-center">
            <ProgressRing progress={progress} size={160} strokeWidth={12} />
            <p className="mt-4 text-muted-foreground">
              {completedTasks} of {todaysFocus.length} tasks completed
            </p>

            <div className="w-full mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Focus Time Duration
                </label>
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
                onClick={() =>
                  navigate("/timer", {
                    state: { duration: parseInt(focusTime) },
                  })
                }
                className="w-full gradient-primary py-6 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Focus Now ({focusTime} min)
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quote */}
        <motion.div className="glass-card rounded-3xl p-6 md:p-8 gradient-primary text-white">
          <div className="text-6xl opacity-20 mb-4">"</div>
          <p className="text-xl font-medium mb-4">{todayQuote}</p>
          <p className="text-white/80 text-sm">— Daily Motivation</p>
        </motion.div>
      </div>

      {/* Tasks */}
      <h2 className="text-2xl font-semibold mb-4">Today's Focus</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {todaysFocus.map((task, index) => {
          const Icon = task.icon;
          return (
            <div
              key={index}
              className={`glass-card rounded-2xl p-6 ${
                task.completed ? "opacity-75" : ""
              }`}
            >
              <div className="flex gap-4 items-start">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(index)}
                />

                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${task.color}20`,
                    color: task.color,
                  }}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <h3
                    className={`font-semibold ${
                      task.completed ? "line-through" : ""
                    }`}
                  >
                    {task.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {task.duration}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" onClick={() => navigate("/planner")}>
          📅 Plan Day
        </Button>
        <Button variant="outline" onClick={() => navigate("/progress")}>
          📊 View Stats
        </Button>
        <Button variant="outline" onClick={() => navigate("/dsa")}>
          💻 DSA Tracker
        </Button>
        <Button variant="outline" onClick={() => navigate("/wellness")}>
          👁️ Wellness
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
