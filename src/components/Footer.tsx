import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-card border-t border-border py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🤖</span>
            <span className="font-heading font-bold text-lg text-gradient">QuizBot AI</span>
          </div>
          <p className="text-sm text-muted-foreground">Turn your notes into quizzes with AI. Study smarter, not harder.</p>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
            <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
          </div>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3">Contact</h4>
          <p className="text-sm text-muted-foreground">support@quizbot.ai</p>
        </div>
      </div>
      <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} QuizBot AI. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
