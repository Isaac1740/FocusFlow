import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { API_URL } from "../config";

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // ✅ ONLY check token
    if (!token) {
      navigate("/login");
      return;
    }

    // ✅ Correct HTTP method: GET
    axios
      .get(`${API_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.user);

          // Optional: keep for dashboard usage
          localStorage.setItem("username", res.data.user.username);
          localStorage.setItem("email", res.data.user.email);
          localStorage.setItem("user_id", String(res.data.user.id));
        } else {
          navigate("/login");
        }
      })
      .catch((err) => {
        console.error("Profile fetch error:", err);
        navigate("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  /* ================================
     LOADING STATE (NO REDIRECT)
  ================================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg font-medium"
        >
          Loading profile...
        </motion.div>
      </div>
    );
  }

  /* ================================
     SAFETY (should not trigger now)
  ================================= */
  if (!user) return null;

  /* ================================
     UI
  ================================= */
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-background p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="glass-card rounded-3xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Your Profile
        </h1>

        <div className="space-y-4 text-left">
          <div>
            <p className="text-muted-foreground text-sm">Username</p>
            <p className="text-lg font-semibold">{user.username}</p>
          </div>

          <div>
            <p className="text-muted-foreground text-sm">Email</p>
            <p className="text-lg font-semibold">{user.email}</p>
          </div>

          <div>
            <p className="text-muted-foreground text-sm">User ID</p>
            <p className="text-lg font-semibold">{user.id}</p>
          </div>
        </div>

        <div className="flex gap-4 mt-8 justify-center">
          <Button onClick={() => navigate("/")}>
            🏠 Home
          </Button>

          <Button
            variant="destructive"
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
          >
            🚪 Logout
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
