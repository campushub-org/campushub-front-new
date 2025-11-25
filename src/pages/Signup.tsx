import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { UserCircle, GraduationCap, BookOpen, Shield, User } from "lucide-react";
import { useState } from "react";

const roles = [
  {
    id: "student",
    label: "Étudiant",
    icon: GraduationCap,
    description: "Accédez aux supports de cours et consultez vos emplois du temps",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "teacher",
    label: "Enseignant",
    icon: BookOpen,
    description: "Gérez vos cours et déposez des supports pédagogiques",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "dean",
    label: "Doyen",
    icon: Shield,
    description: "Validez les supports et supervisez les planifications",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "admin",
    label: "Administrateur",
    icon: User,
    description: "Administrez l'ensemble de la plateforme",
    gradient: "from-green-500 to-emerald-500",
  },
];

const Signup = () => {
  const [selectedRole, setSelectedRole] = useState<string>("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-muted flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            Créer un compte
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-muted-foreground text-lg"
          >
            Rejoignez CampusHub et choisissez votre rôle
          </motion.p>
        </div>

        {/* Role Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
            >
              <Card
                className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-medium ${
                  selectedRole === role.id
                    ? "ring-2 ring-primary shadow-glow border-primary"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-4`}>
                  <role.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{role.label}</h3>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <Card className="max-w-2xl mx-auto p-8 shadow-glow">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" placeholder="Votre prénom" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" placeholder="Votre nom" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="vous@exemple.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" />
              </div>

              {selectedRole && (
                <div className="bg-muted/50 p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">
                    Rôle sélectionné: <span className="font-semibold text-foreground">{roles.find(r => r.id === selectedRole)?.label}</span>
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                variant="hero"
                size="lg"
                disabled={!selectedRole}
              >
                Créer mon compte
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Vous avez déjà un compte?{" "}
                <a href="/signin" className="text-primary hover:underline font-semibold">
                  Se connecter
                </a>
              </p>
            </form>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="text-center mt-8"
        >
          <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            ← Retour à l'accueil
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;
