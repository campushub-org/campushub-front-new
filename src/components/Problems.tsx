import { motion } from "framer-motion";
import { XCircle, CheckCircle2, ArrowRight } from "lucide-react";

const problems = [
  {
    before: "Planification manuelle laborieuse",
    after: "Automatisation totale en quelques secondes",
  },
  {
    before: "Conflits d'horaires et de salles",
    after: "Zéro conflit garanti par notre algorithme",
  },
  {
    before: "Supports de cours éparpillés",
    after: "Espace pédagogique centralisé et validé",
  },
  {
    before: "Étudiants mal informés",
    after: "Notifications push et SMS en temps réel",
  },
];

const Problems = () => {
  return (
    <section className="py-32 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-8 tracking-tight">
              Fini le chaos administratif. <br />
              <span className="text-primary italic">Passez à la vitesse supérieure.</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-lg">
              CampusHub transforme vos processus archaïques en expériences fluides et automatisées.
            </p>
            
            <div className="space-y-6">
              {problems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <span className="text-lg font-medium text-foreground">{item.after}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 relative"
          >
            <div className="bg-slate-50 dark:bg-slate-900 rounded-[32px] p-8 lg:p-12 border border-border shadow-soft relative z-10">
              <div className="space-y-8">
                {problems.map((problem, index) => (
                  <div key={index} className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr,40px,1fr] gap-4 items-center">
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-destructive/20 shadow-sm opacity-60">
                        <div className="flex items-center gap-2 mb-1">
                          <XCircle className="w-4 h-4 text-destructive" />
                          <span className="text-[10px] font-bold uppercase text-destructive tracking-widest">Avant</span>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground line-through decoration-destructive/30">{problem.before}</p>
                      </div>
                      
                      <div className="flex justify-center">
                        <ArrowRight className="w-5 h-5 text-primary rotate-90 md:rotate-0" />
                      </div>

                      <div className="p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 shadow-medium transform hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-bold uppercase text-primary tracking-widest">Après</span>
                        </div>
                        <p className="text-sm font-bold text-foreground">{problem.after}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Background Decorations */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Problems;
