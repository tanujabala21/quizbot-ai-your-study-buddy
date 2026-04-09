import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import robotLost from "@/assets/robot-lost.png";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <img src={robotLost} alt="Lost robot" width={200} height={200} className="mx-auto mb-6 animate-float" loading="lazy" />
      <h1 className="font-heading text-5xl font-bold text-gradient mb-3">404</h1>
      <p className="text-lg text-muted-foreground mb-6">Oops! This page got lost in the quiz universe 🌌</p>
      <Link to="/">
        <Button className="gradient-primary text-primary-foreground rounded-full">
          Take Me Home 🏠
        </Button>
      </Link>
    </motion.div>
  </div>
);

export default NotFound;
