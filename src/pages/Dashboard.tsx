import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Brain, Trophy, Flame, Clock, PlusCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Learner";

  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [bestScore, setBestScore] = useState<string>("--");
  const [recentQuiz, setRecentQuiz] = useState<string>("None yet");
  const [scoreHistory, setScoreHistory] = useState<{ date: string; score: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("score, total_questions, completed_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      if (attempts && attempts.length > 0) {
        setTotalQuizzes(attempts.length);
        const best = Math.max(...attempts.map((a) => Math.round((a.score / a.total_questions) * 100)));
        setBestScore(`${best}%`);
        const recent = new Date(attempts[0].completed_at).toLocaleDateString();
        setRecentQuiz(recent);
        setScoreHistory(
          attempts.slice(0, 10).reverse().map((a) => ({
            date: new Date(a.completed_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
            score: Math.round((a.score / a.total_questions) * 100),
          }))
        );
      }
    };
    fetchStats();
  }, [user]);

  const stats = [
    { label: "Total Quizzes", value: String(totalQuizzes), icon: Brain, color: "gradient-primary" },
    { label: "Best Score", value: bestScore, icon: Trophy, color: "gradient-pink" },
    { label: "Streak", value: `${totalQuizzes > 0 ? 1 : 0} days`, icon: Flame, color: "gradient-primary" },
    { label: "Recent Quiz", value: recentQuiz, icon: Clock, color: "gradient-pink" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold mb-1">Hey, {displayName}! 👋</h1>
          <p className="text-muted-foreground mb-8">Ready to boost your knowledge today?</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} className="bg-card rounded-2xl p-5 shadow-card border border-border">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="text-primary-foreground" size={20} />
              </div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="font-heading font-bold text-xl">{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Score Trend */}
        {scoreHistory.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl p-6 shadow-card border border-border mb-8">
            <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" /> Score Trend
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={scoreHistory}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Link to="/generate">
            <Button size="lg" className="gradient-primary text-primary-foreground rounded-full shadow-soft hover:shadow-hover transition-shadow">
              <PlusCircle className="mr-2" size={20} /> Generate New Quiz
            </Button>
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
