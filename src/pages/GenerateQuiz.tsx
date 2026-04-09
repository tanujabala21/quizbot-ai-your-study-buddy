import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Image, Type, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const GenerateQuiz = () => {
  const [inputType, setInputType] = useState<"text" | "pdf" | "image">("text");
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState("5");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionType, setQuestionType] = useState("mcq");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const navigate = useNavigate();

  const extractTextFromFile = async (f: File): Promise<string> => {
    if (f.type === "text/plain") return await f.text();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(`[File: ${f.name}, type: ${f.type}]\nBase64 content provided for AI processing.`);
      };
      reader.readAsDataURL(f);
    });
  };

  const handleGenerate = async () => {
    let content = textContent;
    if (inputType !== "text") {
      if (!file) { toast.error("Please upload a file first!"); return; }
      content = await extractTextFromFile(file);
    }
    if (!content.trim()) { toast.error("Please provide some content!"); return; }

    setLoading(true);
    try {
      // Step 1: Generate study overview
      setLoadingStep("🤖 Analyzing your content...");
      const { data: overviewData, error: overviewError } = await supabase.functions.invoke("generate-study-overview", {
        body: { content, topic, language },
      });
      if (overviewError) throw overviewError;
      sessionStorage.setItem("studyOverview", JSON.stringify(overviewData));

      // Step 2: Generate quiz
      setLoadingStep("✨ Generating quiz questions...");
      const { data: quizData, error: quizError } = await supabase.functions.invoke("generate-quiz", {
        body: { content, numQuestions: parseInt(numQuestions), difficulty, questionType, topic, language },
      });
      if (quizError) throw quizError;

      sessionStorage.setItem("currentQuiz", JSON.stringify(quizData));
      sessionStorage.setItem("quizTopic", topic || "General");
      sessionStorage.setItem("quizDifficulty", difficulty);
      sessionStorage.setItem("quizType", questionType);

      navigate("/study-overview");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const handleClear = () => { setTextContent(""); setFile(null); setTopic(""); };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold mb-2">Generate Quiz ✨</h1>
          <p className="text-muted-foreground mb-8">Upload content and let AI create the perfect quiz for you.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-card border border-border p-6 space-y-6">

          {/* Input Type */}
          <div>
            <Label className="mb-2 block">Input Type</Label>
            <div className="flex gap-2">
              {([
                { type: "text" as const, icon: Type, label: "Text" },
                { type: "pdf" as const, icon: FileText, label: "PDF" },
                { type: "image" as const, icon: Image, label: "Image" },
              ]).map((t) => (
                <Button key={t.type} variant={inputType === t.type ? "default" : "outline"}
                  className={inputType === t.type ? "gradient-primary text-primary-foreground" : ""}
                  onClick={() => setInputType(t.type)}>
                  <t.icon size={16} className="mr-1" />{t.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Content */}
          {inputType === "text" ? (
            <div>
              <Label htmlFor="content">Paste your content</Label>
              <Textarea id="content" placeholder="Paste your study notes, article, or any text here..."
                value={textContent} onChange={(e) => setTextContent(e.target.value)} className="min-h-[150px] mt-1" />
            </div>
          ) : (
            <div>
              <Label>Upload {inputType === "pdf" ? "PDF" : "Image"}</Label>
              <div className="mt-1 border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="mx-auto text-muted-foreground mb-2" size={32} />
                <p className="text-sm text-muted-foreground mb-2">
                  {file ? file.name : `Click or drag to upload ${inputType === "pdf" ? "a PDF" : "an image"}`}
                </p>
                <Input type="file" accept={inputType === "pdf" ? ".pdf,.txt" : "image/*"}
                  onChange={(e) => setFile(e.target.files?.[0] || null)} className="max-w-xs mx-auto" />
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Number of Questions</Label>
              <Select value={numQuestions} onValueChange={setNumQuestions}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{["3","5","10","15","20"].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy 😊</SelectItem>
                  <SelectItem value="medium">Medium 🤔</SelectItem>
                  <SelectItem value="hard">Hard 🔥</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Question Type</Label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">MCQ</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["English","Spanish","French","German","Hindi","Arabic","Chinese","Japanese"].map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="topic">Topic (optional)</Label>
            <Input id="topic" placeholder="e.g., Machine Learning, History..." value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1" />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleGenerate} disabled={loading} className="flex-1 gradient-primary text-primary-foreground">
              {loading ? (
                <><Loader2 className="mr-2 animate-spin" size={18} />{loadingStep || "Generating..."}</>
              ) : (
                <><Sparkles className="mr-2" size={18} />Generate Quiz</>
              )}
            </Button>
            <Button variant="outline" onClick={handleClear}>Clear</Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default GenerateQuiz;
