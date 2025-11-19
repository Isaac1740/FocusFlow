import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");

    if (!user_id) {
      navigate("/login");
      return;
    }

    axios
      .post("http://localhost:5000/api/profile", { user_id })
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.user);

          // ✅ Store username & email for Dashboard
          localStorage.setItem("username", res.data.user.username);
          localStorage.setItem("email", res.data.user.email);
        } else {
          console.error("Error:", res.data.message);
        }
      })
      .catch((err) => console.error("Profile fetch error:", err));
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
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

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-background transition-colors duration-300 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="glass-card rounded-3xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Your Profile</h1>
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
          <Button onClick={() => navigate("/")}>🏠 Back to Home</Button>
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
