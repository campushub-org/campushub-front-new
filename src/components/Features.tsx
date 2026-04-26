import { motion } from "framer-motion";
import { Calendar, BookOpen, Bell, BarChart, Users, Shield, Zap, MousePointer2, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Calendar,
    title: "Planification Intelligente",
    description: "Algorithme automatique qui élimine les conflits d'horaires et optimise l'utilisation des salles.",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: BookOpen,
    title: "Gestion des Cours",
    description: "Supports pédagogiques centralisés avec un workflow de validation intégré et intuitif.",
    gradient: "from-purple-500/10 to-pink-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: Bell,
    title: "Notifications Temps Réel",
    description: "Alertes instantanées pour les changements d'horaires, nouveaux supports et examens.",
    gradient: "from-blue-500/10 to-indigo-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: BarChart,
    title: "Analyses & Rapports",
    description: "Tableaux de bord détaillés pour suivre l'assiduité et l'occupation des ressources.",
    gradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-500",
  },
  {
    icon: Shield,
    title: "Sécurité Maximale",
    description: "Protection des données académiques avec des standards de chiffrement de haut niveau.",
    gradient: "from-indigo-500/10 to-blue-500/10",
    iconColor: "text-indigo-500",
  },
  {
    icon: Smartphone,
    title: "Expérience Mobile",
    description: "Accédez à CampusHub partout avec une interface optimisée pour tous vos appareils.",
    gradient: "from-purple-500/10 to-blue-500/10",
    iconColor: "text-rose-500",
  },
];

const Features = () => {
  return (
    <section className="py-32 bg-slate-50/50 dark:bg-slate-900/50 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
            <Zap className="w-4 h-4" />
            <span>Puissant & Intuitif</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Tout pour votre établissement
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Une suite complète d'outils conçus pour simplifier la vie des étudiants, enseignants et administrateurs.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-8 h-full bg-white dark:bg-slate-900 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.gradient} blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500`} />
                
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                  <feature.icon className={`w-7 h-7 ${feature.iconColor} group-hover:text-white transition-colors`} />
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="mt-6 flex items-center gap-2 text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>En savoir plus</span>
                  <MousePointer2 className="w-4 h-4" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
