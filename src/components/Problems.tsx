import { motion } from "framer-motion";
import { XCircle, ArrowRight, CheckCircle } from "lucide-react";

const problems = [
  {
    before: "Planification manuelle chronophage",
    after: "Planification automatique en quelques clics",
  },
  {
    before: "Conflits d'horaires fréquents",
    after: "Zéro conflit grâce à l'algorithme intelligent",
  },
  {
    before: "Communication fragmentée par e-mail",
    after: "Notifications centralisées et automatiques",
  },
  {
    before: "Supports pédagogiques non validés",
    after: "Workflow de validation intégré",
  },
];

const Problems = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-semibold mb-4 block">Le Changement</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            De la complexité à la simplicité
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transformez vos processus académiques en workflows efficaces et automatisés
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-card rounded-2xl p-8 border border-border shadow-soft hover:shadow-medium transition-all duration-300"
            >
              <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6 items-center">
                {/* Before */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avant</p>
                    <p className="text-foreground font-medium">{problem.before}</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-accent" />
                </div>

                {/* After */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Après</p>
                    <p className="text-foreground font-medium">{problem.after}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problems;
