import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, Bell, ArrowRight, Star, CheckCircle2 } from "lucide-react";
import newHeroImage from "@/assets/Capture d’écran de 2025-12-04 02-31-05.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-primary/5 rounded-bl-[100px] -z-10" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -z-10" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 shadow-soft border border-border/50 rounded-full"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">
                Déjà adopté par +50 universités
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-foreground"
            >
              L'excellence académique{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                en un clic
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-muted-foreground max-w-xl leading-relaxed"
            >
              CampusHub est la plateforme tout-en-un qui révolutionne la planification des examens, la gestion des cours et la vie étudiante.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" className="h-14 px-8 text-lg font-semibold shadow-glow group" asChild>
                <a href="/signup">
                  Démarrer maintenant
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold" asChild>
                <a href="#features">Découvrir les fonctions</a>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="flex items-center gap-6 pt-4"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Sans installation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Support 24/7</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right side - Visual mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex-1 relative"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card p-2 transform perspective-1000 rotate-y-[-5deg]">
              <img
                src={newHeroImage}
                alt="CampusHub Dashboard"
                className="w-full h-auto rounded-xl"
              />
            </div>

            {/* Floating elements */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 z-20 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-glow border border-border/50 flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Planning</p>
                <p className="text-sm font-bold text-foreground">Zéro conflit détecté</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-6 -left-12 z-20 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-medium border border-border/50 flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Bell className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Alertes</p>
                <p className="text-sm font-bold text-foreground">Notification envoyée</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 -left-20 z-20 bg-white dark:bg-slate-900 p-3 rounded-full shadow-medium border border-border/50 flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center">
                <Star className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-sm font-bold pr-2">4.9/5</span>
            </motion.div>
            
            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 rounded-full blur-[120px] -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
