import { ReactNode } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Home,
  Timer,
  Calendar,
  TrendingUp,
  Eye,
  Code2,
  Moon,
  Sun,
  User,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Layout = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/timer", icon: Timer, label: "Timer" },
    { path: "/planner", icon: Calendar, label: "Planner" },
    { path: "/progress", icon: TrendingUp, label: "Progress" },
    { path: "/dsa", icon: Code2, label: "DSA" },
    { path: "/wellness", icon: Eye, label: "Wellness" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  // 🔒 Logout function
  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully!");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* 🌗 Theme Toggle + Logout (Top Right) */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {/* Theme toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="glass-card rounded-full w-12 h-12 border-border hover:bg-accent/10 transition-all duration-300"
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
            key={theme}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-primary" />
            ) : (
              <Sun className="w-5 h-5 text-accent" />
            )}
          </motion.div>
        </Button>

        {/* 🚪 Logout Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleLogout}
          className="glass-card rounded-full w-12 h-12 border-border hover:bg-destructive/10 transition-all duration-300"
        >
          <LogOut className="w-5 h-5 text-destructive" />
        </Button>
      </div>

      {/* 🧩 Main Content (renders nested pages) */}
      <main className="pb-20 md:pb-6">
        <Outlet />
      </main>

      {/* 📱 Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden glass-card border-t border-border z-50">
        <div className="flex justify-around items-center h-16 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center flex-1 h-full"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-accent/10 rounded-xl"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <Icon
                  className={`w-6 h-6 relative transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-xs mt-1 relative transition-colors ${
                    isActive
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 🖥️ Sidebar Navigation (Desktop) */}
      <nav className="hidden md:block fixed top-0 left-0 h-screen w-20 glass-card border-r border-border z-50">
        <div className="flex flex-col items-center py-8 space-y-8">
          {/* Logo */}
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg">
            FF
          </div>

          {/* Sidebar icons */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link key={item.path} to={item.path} className="relative group">
                {isActive && (
                  <motion.div
                    layoutId="activeTabDesktop"
                    className="absolute inset-0 -left-1 w-1 bg-primary rounded-r"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent/10 text-muted-foreground"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="absolute left-full ml-2 px-2 py-1 bg-card rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm pointer-events-none">
                  {item.label}
                </div>
              </Link>
            );
          })}

          {/* Logout button (Desktop sidebar) */}
          <button
            onClick={handleLogout}
            className="mt-8 w-12 h-12 rounded-xl flex items-center justify-center text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Padding for sidebar */}
      <div className="hidden md:block md:ml-20" />
    </div>
  );
};

export default Layout;
