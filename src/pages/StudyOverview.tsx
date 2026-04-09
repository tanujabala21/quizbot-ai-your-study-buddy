import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, Lightbulb, ListChecks, FlaskConical, BookMarked, AlertTriangle, Loader2, Play } from "lucide-react";
import robotMascot from "@/assets/robot-mascot.png";

interface StudyOverviewData {
  summary: string;
  key_points: string[];
  topics_covered: string[];
  formulas: { name: string; formula: string; description?: string }[];
  definitions: { term: string; definition: string }[];
  topics_to_revise: string[];
  estimated_difficulty: string;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-700 border-green-300",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
  hard: "bg-red-100 text-red-700 border-red-300",
};

const StudyOverview = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<StudyOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = sessionStorage.getItem("studyOverview");
    if (!data) {
      navigate("/generate");
      return;
    }
    setOverview(JSON.parse(data));
    setLoading(false);
  }, [navigate]);

  const handleStartQuiz = () => {
    navigate("/quiz");
  };

  if (loading || !overview) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary mb-4" size={48} />
          <p className="text-muted-foreground">Loading study overview...</p>
        </div>
      </DashboardLayout>
    );
  }

  const sections = [
    {
      icon: BookOpen,
      title: "Summary 📖",
      color: "from-blue-500 to-purple-500",
      content: <p className="text-muted-foreground leading-relaxed">{overview.summary}</p>,
    },
    {
      icon: Lightbulb,
      title: "Key Points 💡",
      color: "from-yellow-400 to-orange-500",
      content: (
        <ul className="space-y-2">
          {overview.key_points.map((point, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span className="text-muted-foreground">{point}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      icon: ListChecks,
      title: "Topics Covered 📋",
      color: "from-green-400 to-emerald-500",
      content: (
        <div className="flex flex-wrap gap-2">
          {overview.topics_covered.map((topic, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {topic}
            </span>
          ))}
        </div>
      ),
    },
    {
      icon: FlaskConical,
      title: "Important Formulas 🧪",
      color: "from-purple-400 to-pink-500",
      content: overview.formulas.length > 0 ? (
        <div className="grid gap-3">
          {overview.formulas.map((f, i) => (
            <div key={i} className="bg-muted/50 rounded-xl p-4 border border-border">
              <p className="font-semibold text-sm">{f.name}</p>
              <p className="font-mono text-primary mt-1">{f.formula}</p>
              {f.description && <p className="text-xs text-muted-foreground mt-1">{f.description}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground italic">No important formulas found in this content.</p>
      ),
    },
    {
      icon: BookMarked,
      title: "Important Definitions 📚",
      color: "from-cyan-400 to-blue-500",
      content: overview.definitions.length > 0 ? (
        <div className="space-y-3">
          {overview.definitions.map((d, i) => (
            <div key={i} className="bg-muted/50 rounded-xl p-4 border border-border">
              <p className="font-semibold text-sm text-primary">{d.term}</p>
              <p className="text-sm text-muted-foreground mt-1">{d.definition}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground italic">No key definitions found.</p>
      ),
    },
    {
      icon: AlertTriangle,
      title: "Topics to Revise ⚠️",
      color: "from-red-400 to-orange-500",
      content: (
        <div className="flex flex-wrap gap-2">
          {overview.topics_to_revise.map((topic, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
              {topic}
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <img src={robotMascot} alt="QuizBot" width={80} height={80} className="mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold mb-2">Study Overview 📝</h1>
          <p className="text-muted-foreground mb-3">Here's what I found in your content!</p>
          <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold border ${difficultyColors[overview.estimated_difficulty] || difficultyColors.medium}`}>
            Estimated Difficulty: {overview.estimated_difficulty.charAt(0).toUpperCase() + overview.estimated_difficulty.slice(1)}
          </span>
        </motion.div>

        <div className="space-y-6 mb-8">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl shadow-card border border-border overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${section.color} p-3 flex items-center gap-2`}>
                <section.icon className="text-white" size={20} />
                <h2 className="font-heading font-semibold text-white">{section.title}</h2>
              </div>
              <div className="p-5">{section.content}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center">
          <Button
            size="lg"
            onClick={handleStartQuiz}
            className="gradient-primary text-primary-foreground rounded-full shadow-soft hover:shadow-hover px-10 py-6 text-lg"
          >
            <Play className="mr-2" size={22} /> Start Quiz 🚀
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default StudyOverview;
