import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { CheckCircle2, XCircle, RotateCcw, Home } from "lucide-react";
import robotMascot from "@/assets/robot-mascot.png";

interface QuizResults {
  questions: { question: string; options: string[]; correct_answer: string; explanation: string }[];
  answers: Record<number, string>;
  score: number;
  total: number;
  time: number;
}

const getReaction = (pct: number) => {
  if (pct >= 90) return { emoji: "🏆", text: "Amazing! You're a genius!" };
  if (pct >= 70) return { emoji: "🎉", text: "Great job! Keep it up!" };
  if (pct >= 50) return { emoji: "😊", text: "Not bad! Room to improve!" };
  return { emoji: "💪", text: "Don't give up! Try again!" };
};

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<QuizResults | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("quizResults");
    if (!data) { navigate("/dashboard"); return; }
    setResults(JSON.parse(data));
  }, [navigate]);

  if (!results) return null;

  const pct = Math.round((results.score / results.total) * 100);
  const reaction = getReaction(pct);
  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl shadow-card border border-border p-8 text-center mb-8"
        >
          <img src={robotMascot} alt="QuizBot" width={100} height={100} className="mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold mb-2">Quiz Complete! {reaction.emoji}</h1>
          <p className="text-muted-foreground mb-4">{reaction.text}</p>
          <div className="text-5xl font-heading font-bold text-gradient mb-2">{pct}%</div>
          <p className="text-muted-foreground">
            {results.score}/{results.total} correct • Time: {formatTime(results.time)}
          </p>
        </motion.div>

        {/* Detailed results */}
        <div className="space-y-4 mb-8">
          {results.questions.map((q, i) => {
            const isCorrect = results.answers[i] === q.correct_answer;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl border-2 p-5 ${
                  isCorrect ? "border-green-300 bg-green-50/50" : "border-red-300 bg-red-50/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="text-green-500 mt-1 shrink-0" size={20} />
                  ) : (
                    <XCircle className="text-red-500 mt-1 shrink-0" size={20} />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold mb-2">{q.question}</p>
                    {!isCorrect && (
                      <p className="text-sm text-red-600 mb-1">Your answer: {results.answers[i] || "—"}</p>
                    )}
                    <p className="text-sm text-green-700">Correct: {q.correct_answer}</p>
                    {q.explanation && (
                      <p className="text-sm text-muted-foreground mt-2 italic">💡 {q.explanation}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Link to="/generate" className="flex-1">
            <Button className="w-full gradient-primary text-primary-foreground">
              <RotateCcw size={18} className="mr-2" /> New Quiz
            </Button>
          </Link>
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
