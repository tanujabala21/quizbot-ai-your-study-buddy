import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Brain, Trophy, Flame, Clock, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

const stats = [
  { label: "Total Quizzes", value: "0", icon: Brain, color: "gradient-primary" },
  { label: "Best Score", value: "--", icon: Trophy, color: "gradient-pink" },
  { label: "Streak", value: "0 days", icon: Flame, color: "gradient-primary" },
  { label: "Recent Quiz", value: "None yet", icon: Clock, color: "gradient-pink" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Learner";

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold mb-1">Hey, {displayName}! 👋</h1>
          <p className="text-muted-foreground mb-8">Ready to boost your knowledge today?</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-5 shadow-card border border-border"
            >
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="text-primary-foreground" size={20} />
              </div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="font-heading font-bold text-xl">{s.value}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Link to="/generate">
            <Button size="lg" className="gradient-primary text-primary-foreground rounded-full shadow-soft hover:shadow-hover transition-shadow">
              <PlusCircle className="mr-2" size={20} />
              Generate New Quiz
            </Button>
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
