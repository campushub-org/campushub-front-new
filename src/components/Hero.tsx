import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, Users, BookOpen, Bell } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-muted">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block"
            >
              <span className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold border border-accent/20">
                Plateforme de Gestion Académique
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-foreground"
            >
              Transformez votre{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                gestion académique
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-muted-foreground max-w-xl"
            >
              CampusHub automatise la planification des examens, le suivi des cours et la
              communication universitaire. Fini les conflits d'horaires et les erreurs manuelles.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Button variant="hero" size="lg" asChild>
                <a href="/signup">S'inscrire</a>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <a href="/signin">Se connecter</a>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right side - Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-glow border border-border/50 bg-card">
              <img
                src={heroDashboard}
                alt="CampusHub Dashboard"
                className="w-full h-auto"
              />
              
              {/* Floating cards */}
              <motion.div
                className="absolute -top-4 -left-4 bg-card p-4 rounded-xl shadow-medium border border-border"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Calendar className="w-8 h-8 text-primary mb-2" />
                <p className="text-sm font-semibold">Planification auto</p>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -right-4 bg-card p-4 rounded-xl shadow-medium border border-border"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              >
                <Bell className="w-8 h-8 text-accent mb-2" />
                <p className="text-sm font-semibold">Notifications temps réel</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
