import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-32 relative overflow-hidden bg-white dark:bg-slate-950">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[48px] bg-primary overflow-hidden p-12 lg:p-24 shadow-glow"
        >
          {/* Abstract circles */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl -z-10" />

          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-full text-sm font-bold mb-8 border border-white/20 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Prêt pour le futur ?</span>
            </motion.div>

            <h2 className="text-4xl lg:text-7xl font-bold text-white mb-8 tracking-tight">
              Réinventez la gestion de votre campus dès aujourd'hui.
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              Rejoignez les universités qui font confiance à CampusHub pour moderniser leur infrastructure académique.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="h-16 px-10 text-xl font-bold bg-white text-primary hover:bg-white/90 shadow-2xl group"
                asChild
              >
                <a href="/signup">
                  Créer un compte gratuit
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <div className="flex items-center gap-2 text-white/80 font-medium">
                <ShieldCheck className="w-6 h-6 text-green-400" />
                <span>Essai de 30 jours inclus</span>
              </div>
            </div>

            {/* Trust logos */}
            <div className="mt-20 pt-12 border-t border-white/10">
              <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-10">Partenaires de confiance</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center justify-items-center opacity-40 grayscale contrast-125">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-white" />
                    <span className="text-xl font-bold text-white tracking-tighter">UNIVERSITY {i}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
