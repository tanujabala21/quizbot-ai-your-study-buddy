import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, Trophy, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AttemptRow {
  id: string;
  score: number;
  total_questions: number;
  time_taken: number;
  completed_at: string;
  quizzes: { title: string | null; topic: string | null; difficulty: string } | null;
}

const QuizHistory = () => {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [search, setSearch] = useState("");
  const [filterDiff, setFilterDiff] = useState("all");

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("quiz_attempts")
        .select("id, score, total_questions, time_taken, completed_at, quizzes(title, topic, difficulty)")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });
      if (data) setAttempts(data as unknown as AttemptRow[]);
    };
    fetch();
  }, [user]);

  const filtered = attempts.filter((a) => {
    const title = a.quizzes?.title || a.quizzes?.topic || "";
    const matchSearch = title.toLowerCase().includes(search.toLowerCase());
    const matchDiff = filterDiff === "all" || a.quizzes?.difficulty === filterDiff;
    return matchSearch && matchDiff;
  });

  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold mb-2">My Quizzes 📚</h1>
          <p className="text-muted-foreground mb-6">Review your past quizzes and track your progress.</p>
        </motion.div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input placeholder="Search quizzes..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filterDiff} onValueChange={setFilterDiff}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-card border border-border p-12 text-center">
            <BookOpen className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="font-heading font-semibold text-lg mb-2">No quizzes yet</h3>
            <p className="text-sm text-muted-foreground">Generate your first quiz to see it here!</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a, i) => {
              const pct = Math.round((a.score / a.total_questions) * 100);
              return (
                <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card rounded-2xl shadow-card border border-border p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}>
                    {pct}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{a.quizzes?.title || a.quizzes?.topic || "Quiz"}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.score}/{a.total_questions} correct • {a.quizzes?.difficulty}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground shrink-0">
                    <div className="flex items-center gap-1"><Clock size={12} />{formatTime(a.time_taken)}</div>
                    <div className="flex items-center gap-1 mt-1"><Trophy size={12} />{new Date(a.completed_at).toLocaleDateString()}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuizHistory;
