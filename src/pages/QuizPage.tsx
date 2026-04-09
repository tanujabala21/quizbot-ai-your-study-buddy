import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/DashboardLayout";
import { Clock, ChevronRight, ChevronLeft, Send } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

const QuizPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timer, setTimer] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem("currentQuiz");
    if (!data) {
      navigate("/generate");
      return;
    }
    try {
      const parsed = JSON.parse(data);
      setQuestions(parsed.questions || []);
    } catch {
      navigate("/generate");
    }
  }, [navigate]);

  useEffect(() => {
    if (submitted || questions.length === 0) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [submitted, questions.length]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleSubmit = () => {
    setSubmitted(true);
    const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correct_answer ? 1 : 0), 0);
    sessionStorage.setItem("quizResults", JSON.stringify({
      questions,
      answers,
      score,
      total: questions.length,
      time: timer,
    }));
    navigate("/results");
  };

  if (questions.length === 0) return null;
  const q = questions[current];
  const progress = ((Object.keys(answers).length) / questions.length) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock size={18} />
            <span className="font-mono">{formatTime(timer)}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {current + 1} / {questions.length}
          </span>
        </div>

        <Progress value={progress} className="mb-6 h-2" />

        {/* Question Card */}
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-2xl shadow-card border border-border p-6 mb-6"
        >
          <h2 className="font-heading text-xl font-semibold mb-6">{q.question}</h2>
          <div className="space-y-3">
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswers({ ...answers, [current]: opt })}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  answers[current] === opt
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            disabled={current === 0}
            onClick={() => setCurrent(current - 1)}
          >
            <ChevronLeft size={18} className="mr-1" /> Previous
          </Button>

          {current === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              className="gradient-primary text-primary-foreground"
              disabled={Object.keys(answers).length < questions.length}
            >
              <Send size={18} className="mr-1" /> Submit Quiz
            </Button>
          ) : (
            <Button onClick={() => setCurrent(current + 1)}>
              Next <ChevronRight size={18} className="ml-1" />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QuizPage;
