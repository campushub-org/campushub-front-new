import { motion } from "framer-motion";
import { GraduationCap, Users, UserCheck, Settings } from "lucide-react";
import universityBuildingBg from "@/assets/1727223626892-1536x692.jpg"; // Import the new image

const roles = [
  {
    icon: GraduationCap,
    title: "Étudiants",
    description: "Consultez vos emplois du temps, accédez aux supports de cours et recevez des notifications d'examens.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "Enseignants",
    description: "Déposez vos supports, gérez vos disponibilités et suivez la planification de vos examens.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: UserCheck,
    title: "Doyens",
    description: "Validez les supports pédagogiques, supervisez la planification et accédez aux rapports détaillés.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Settings,
    title: "Administrateurs",
    description: "Gérez les utilisateurs, configurez les salles et ressources, et personnalisez le système.",
    color: "from-green-500 to-emerald-500",
  },
];

const UserRoles = () => {
  return (
    <section 
      className="py-24 relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${universityBuildingBg})` }}
    >
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 text-white" // Text color changed for contrast
        >
          <span className="text-accent font-semibold mb-4 block">Pour Tous</span>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Une plateforme adaptée à chaque rôle
          </h2>
          <p className="text-xl max-w-2xl mx-auto text-white/80">
            Des interfaces personnalisées pour chaque acteur de l'écosystème universitaire
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative h-full bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-medium overflow-hidden">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <role.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {role.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {role.description}
                  </p>
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
