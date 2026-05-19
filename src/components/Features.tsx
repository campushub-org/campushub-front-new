import { motion } from "framer-motion";
import { Calendar, BookOpen, Bell, BarChart, Shield, Zap, MousePointer2, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const Features = () => {
  const { t } = useTranslation();

  const featureIcons = [Calendar, BookOpen, Bell, BarChart, Shield, Smartphone];
  const featureGradients = [
    "from-blue-500/10 to-cyan-500/10",
    "from-purple-500/10 to-pink-500/10",
    "from-blue-500/10 to-indigo-500/10",
    "from-green-500/10 to-emerald-500/10",
    "from-indigo-500/10 to-blue-500/10",
    "from-purple-500/10 to-blue-500/10",
  ];
  const iconColors = [
    "text-blue-500",
    "text-purple-500",
    "text-blue-500",
    "text-green-500",
    "text-indigo-500",
    "text-rose-500",
  ];

  const featureList = t("features.list", { returnObjects: true }) as Array<{title: string, description: string}>;

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
            <span>{t("features.badge")}</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            {t("features.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("features.description")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((feature, index) => {
            const Icon = featureIcons[index];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-8 h-full bg-white dark:bg-slate-900 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${featureGradients[index]} blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500`} />
                  
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                    <Icon className={`w-7 h-7 ${iconColors[index]} group-hover:text-white transition-colors`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="mt-6 flex items-center gap-2 text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>{t("features.learn_more")}</span>
                    <MousePointer2 className="w-4 h-4" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
