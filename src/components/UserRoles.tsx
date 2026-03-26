import { motion } from "framer-motion";
import { GraduationCap, Users, UserCheck, Settings, ChevronRight } from "lucide-react";

const roles = [
  {
    icon: GraduationCap,
    title: "Étudiants",
    description: "Accédez à vos supports de cours, consultez vos emplois du temps et recevez vos alertes d'examen.",
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    darkColor: "dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    icon: Users,
    title: "Enseignants",
    description: "Déposez vos cours, gérez vos disponibilités et suivez les validations de vos supports.",
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    darkColor: "dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  {
    icon: UserCheck,
    title: "Doyens",
    description: "Supervisez la planification, validez les ressources et accédez aux statistiques de l'établissement.",
    color: "bg-orange-500",
    lightColor: "bg-orange-50",
    darkColor: "dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  {
    icon: Settings,
    title: "Administrateurs",
    description: "Gérez les comptes, configurez les salles et maintenez l'infrastructure du campus.",
    color: "bg-green-500",
    lightColor: "bg-green-50",
    darkColor: "dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
  },
];

const UserRoles = () => {
  return (
    <section className="py-32 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-primary font-bold uppercase tracking-widest text-sm mb-4 block">Écosystème</span>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Une expérience sur mesure
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            CampusHub s'adapte à chaque utilisateur avec des interfaces optimisées pour leurs besoins spécifiques.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {roles.map((role, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className={`h-full relative p-8 rounded-[32px] border ${role.borderColor} ${role.lightColor} ${role.darkColor} transition-all duration-300 hover:shadow-2xl hover:-translate-y-2`}>
                <div className={`w-16 h-16 rounded-2xl ${role.color} text-white flex items-center justify-center mb-8 shadow-lg group-hover:rotate-12 transition-transform`}>
                  <role.icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {role.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {role.description}
                </p>
                
                <div className="flex items-center gap-2 text-foreground font-bold group-hover:gap-4 transition-all">
                  <span>En savoir plus</span>
                  <ChevronRight className="w-5 h-5 text-primary" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserRoles;
