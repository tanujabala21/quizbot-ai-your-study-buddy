import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { CheckCircle2, XCircle, RotateCcw, Home, Download, BookOpen, TrendingUp, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import robotMascot from "@/assets/robot-mascot.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface QuizResults {
  questions: { question: string; options: string[]; correct_answer: string; explanation: string; topic?: string }[];
  answers: Record<number, string>;
  score: number;
  total: number;
  time: number;
  quizId?: string;
}

const COLORS = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const getReaction = (pct: number) => {
  if (pct >= 90) return { emoji: "🏆", text: "Amazing! You're a genius!", tip: "You've mastered this material!" };
  if (pct >= 70) return { emoji: "🎉", text: "Great job! Keep it up!", tip: "Review the few you missed and you'll be perfect!" };
  if (pct >= 50) return { emoji: "😊", text: "Not bad! Room to improve!", tip: "Focus on your weak areas below." };
  return { emoji: "💪", text: "Don't give up! Try again!", tip: "Go through the study overview again and retake!" };
};

const Results = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem("quizResults");
    if (!data) { navigate("/dashboard"); return; }
    setResults(JSON.parse(data));
  }, [navigate]);

  // Save attempt to DB
  useEffect(() => {
    if (!results || !user || saved) return;
    const saveAttempt = async () => {
      try {
        // Create quiz record
        const { data: quiz, error: quizError } = await supabase.from("quizzes").insert({
          user_id: user.id,
          title: sessionStorage.getItem("quizTopic") || "Quiz",
          topic: sessionStorage.getItem("quizTopic") || null,
          difficulty: sessionStorage.getItem("quizDifficulty") || "medium",
          question_type: sessionStorage.getItem("quizType") || "mcq",
          total_questions: results.total,
        }).select("id").single();

        if (quizError) throw quizError;

        // Save questions
        const questions = results.questions.map((q) => ({
          quiz_id: quiz.id,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation || "",
          topic: q.topic || null,
        }));
        await supabase.from("quiz_questions").insert(questions);

        // Save attempt
        await supabase.from("quiz_attempts").insert({
          user_id: user.id,
          quiz_id: quiz.id,
          score: results.score,
          total_questions: results.total,
          time_taken: results.time,
          answers: results.answers,
        });

        setSaved(true);
      } catch (err) {
        console.error("Failed to save quiz:", err);
      }
    };
    saveAttempt();
  }, [results, user, saved]);

  if (!results) return null;

  const pct = Math.round((results.score / results.total) * 100);
  const reaction = getReaction(pct);
  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  // Compute topic-wise performance
  const topicMap = new Map<string, { correct: number; total: number }>();
  results.questions.forEach((q, i) => {
    const topic = q.topic || "General";
    const entry = topicMap.get(topic) || { correct: 0, total: 0 };
    entry.total++;
    if (results.answers[i] === q.correct_answer) entry.correct++;
    topicMap.set(topic, entry);
  });
  const topicData = Array.from(topicMap.entries()).map(([name, d]) => ({
    name: name.length > 15 ? name.slice(0, 15) + "…" : name,
    score: Math.round((d.correct / d.total) * 100),
    correct: d.correct,
    total: d.total,
  }));

  const strongAreas = topicData.filter((t) => t.score >= 70).map((t) => t.name);
  const weakAreas = topicData.filter((t) => t.score < 70).map((t) => t.name);

  const pieData = [
    { name: "Correct", value: results.score },
    { name: "Wrong", value: results.total - results.score },
  ];

  const handleDownloadReport = () => {
    const report = `QuizBot AI - Performance Report
================================
Date: ${new Date().toLocaleDateString()}
Score: ${results.score}/${results.total} (${pct}%)
Time: ${formatTime(results.time)}

${results.questions.map((q, i) => {
  const isCorrect = results.answers[i] === q.correct_answer;
  return `Q${i + 1}: ${q.question}
Your Answer: ${results.answers[i] || "—"}
Correct Answer: ${q.correct_answer}
Status: ${isCorrect ? "✅ Correct" : "❌ Wrong"}
${q.explanation ? `Explanation: ${q.explanation}` : ""}
`;
}).join("\n")}

Strong Areas: ${strongAreas.join(", ") || "N/A"}
Weak Areas: ${weakAreas.join(", ") || "N/A"}
`;
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz-report.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl shadow-card border border-border p-8 text-center mb-8"
        >
          <img src={robotMascot} alt="QuizBot" width={80} height={80} className="mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold mb-2">Quiz Complete! {reaction.emoji}</h1>
          <p className="text-muted-foreground mb-2">{reaction.text}</p>
          <p className="text-sm text-muted-foreground italic mb-4">{reaction.tip}</p>

          <div className="flex items-center justify-center gap-8 mb-4">
            <div>
              <div className="text-5xl font-heading font-bold text-gradient">{pct}%</div>
              <p className="text-sm text-muted-foreground mt-1">
                {results.score}/{results.total} correct • {formatTime(results.time)}
              </p>
            </div>
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" strokeWidth={0}>
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-green-50 rounded-xl p-3 border border-green-200">
              <CheckCircle2 className="text-green-500 mx-auto mb-1" size={20} />
              <p className="font-semibold text-green-700">{results.score} Correct</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 border border-red-200">
              <XCircle className="text-red-500 mx-auto mb-1" size={20} />
              <p className="font-semibold text-red-700">{results.total - results.score} Wrong</p>
            </div>
          </div>
        </motion.div>

        {/* Topic Performance Chart */}
        {topicData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl shadow-card border border-border p-6 mb-6">
            <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" /> Topic-wise Performance
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topicData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {topicData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Strong & Weak Areas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl shadow-card border border-border p-5">
            <h3 className="font-heading font-semibold flex items-center gap-2 mb-3">
              <Target size={18} className="text-green-500" /> Strong Areas 💪
            </h3>
            {strongAreas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {strongAreas.map((a) => (
                  <span key={a} className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">{a}</span>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Keep practicing to build strong areas!</p>}
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl shadow-card border border-border p-5">
            <h3 className="font-heading font-semibold flex items-center gap-2 mb-3">
              <BookOpen size={18} className="text-red-500" /> Weak Areas — Revise These 📖
            </h3>
            {weakAreas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {weakAreas.map((a) => (
                  <span key={a} className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">{a}</span>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No weak areas — perfect score! 🎉</p>}
          </motion.div>
        </div>

        {/* Detailed Q&A */}
        <h2 className="font-heading font-semibold text-lg mb-4">Detailed Review 🔍</h2>
        <div className="space-y-4 mb-8">
          {results.questions.map((q, i) => {
            const isCorrect = results.answers[i] === q.correct_answer;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.03 }}
                className={`rounded-2xl border-2 p-5 ${isCorrect ? "border-green-300 bg-green-50/50" : "border-red-300 bg-red-50/50"}`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? <CheckCircle2 className="text-green-500 mt-1 shrink-0" size={20} /> : <XCircle className="text-red-500 mt-1 shrink-0" size={20} />}
                  <div className="flex-1">
                    <p className="font-semibold mb-2">{q.question}</p>
                    {!isCorrect && <p className="text-sm text-red-600 mb-1">Your answer: {results.answers[i] || "—"}</p>}
                    <p className="text-sm text-green-700">Correct: {q.correct_answer}</p>
                    {q.explanation && <p className="text-sm text-muted-foreground mt-2 italic">💡 {q.explanation}</p>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link to="/generate" className="flex-1">
            <Button className="w-full gradient-primary text-primary-foreground">
              <RotateCcw size={18} className="mr-2" /> Retake / New Quiz
            </Button>
          </Link>
          <Button variant="outline" onClick={handleDownloadReport} className="flex-1">
            <Download size={18} className="mr-2" /> Download Report
          </Button>
          <Link to="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">
              <Home size={18} className="mr-2" /> Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Results;
