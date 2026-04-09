import { motion } from "framer-motion";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/DashboardLayout";

const QuizHistory = () => {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold mb-2">My Quizzes 📚</h1>
          <p className="text-muted-foreground mb-6">Review your past quizzes and track your progress.</p>
        </motion.div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Search quizzes..." className="pl-10" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-card border border-border p-12 text-center"
        >
          <BookOpen className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="font-heading font-semibold text-lg mb-2">No quizzes yet</h3>
          <p className="text-sm text-muted-foreground">Generate your first quiz to see it here!</p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default QuizHistory;
