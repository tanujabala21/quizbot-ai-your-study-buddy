import { motion } from "framer-motion";
import { User, Mail, Calendar } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import robotMascot from "@/assets/robot-mascot.png";

const Profile = () => {
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name || "QuizBot User";
  const email = user?.email || "";
  const joined = user?.created_at ? new Date(user.created_at).toLocaleDateString() : "";

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-card border border-border p-8 text-center"
        >
          <img src={robotMascot} alt="Avatar" width={100} height={100} className="mx-auto mb-4 rounded-full bg-muted p-2" />
          <h1 className="font-heading text-2xl font-bold mb-1">{name}</h1>

          <div className="mt-6 space-y-4 text-left">
            <div className="flex items-center gap-3 text-sm">
              <User size={18} className="text-primary" />
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail size={18} className="text-primary" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={18} className="text-primary" />
              <span className="text-muted-foreground">Joined:</span>
              <span className="font-medium">{joined}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
