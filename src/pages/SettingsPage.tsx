import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Bell, Volume2, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/DashboardLayout";

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [language, setLanguage] = useState("English");

  const toggleDark = (val: boolean) => {
    setDarkMode(val);
    document.documentElement.classList.toggle("dark", val);
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold mb-2">Settings ⚙️</h1>
          <p className="text-muted-foreground mb-8">Customize your QuizBot experience.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-card border border-border p-6 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon size={20} className="text-primary" />
              <div>
                <Label className="font-semibold">Dark Mode</Label>
                <p className="text-xs text-muted-foreground">Switch to dark theme</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDark} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-primary" />
              <div>
                <Label className="font-semibold">Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive quiz reminders</p>
              </div>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 size={20} className="text-primary" />
              <div>
                <Label className="font-semibold">Sound</Label>
                <p className="text-xs text-muted-foreground">Play sounds on actions</p>
              </div>
            </div>
            <Switch checked={sound} onCheckedChange={setSound} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-primary" />
              <div>
                <Label className="font-semibold">Language</Label>
                <p className="text-xs text-muted-foreground">App display language</p>
              </div>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["English", "Spanish", "French", "German", "Hindi"].map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
