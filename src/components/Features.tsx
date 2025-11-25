import { motion } from "framer-motion";
import { Calendar, BookOpen, Bell, BarChart, Users, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Calendar,
    title: "Planification Intelligente",
    description:
      "Algorithme automatique de planification des examens éliminant tous les conflits d'horaires et optimisant l'utilisation des salles.",
  },
  {
    icon: BookOpen,
    title: "Gestion des Cours",
    description:
      "Dépôt, validation et consultation centralisée des supports pédagogiques avec workflow d'approbation intégré.",
  },
  {
    icon: Bell,
    title: "Notifications Automatiques",
    description:
      "Alertes en temps réel pour tous les acteurs : modifications d'horaires, nouveaux supports, rappels d'examens.",
  },
  {
    icon: BarChart,
    title: "Reporting & Analytics",
    description:
      "Tableaux de bord détaillés, statistiques d'occupation des salles et rapports personnalisables pour une vue d'ensemble complète.",
  },
  {
    icon: Users,
    title: "Multi-utilisateurs",
    description:
      "Gestion des rôles pour enseignants, étudiants, doyens et administrateurs avec permissions granulaires.",
  },
  {
    icon: Shield,
    title: "Sécurité Renforcée",
    description:
      "Authentification sécurisée, chiffrement des données et conformité aux standards académiques internationaux.",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-semibold mb-4 block">Fonctionnalités</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Une solution complète pour moderniser la gestion académique de votre établissement
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
              <Card className="p-8 h-full bg-gradient-card border-border hover:shadow-medium transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
