import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import { useState, ChangeEvent, FormEvent } from "react"; // Importation des hooks

// Interface pour la requête d'authentification attendue par l'API Java
interface LoginData {
  username: string;
  password: string;
}

const Signin = () => {
  // 💡 Changement : Utilisation de 'username' au lieu de 'email'
  const [formData, setFormData] = useState<LoginData>({
    username: "",
    password: "",
  });

  // Gestion de la modification des champs (username et password)
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    // L'objet `formData` est prêt à être envoyé à l'API Java
    console.log("Tentative de connexion avec:", formData);

    // Ici, vous feriez l'appel API (fetch ou axios)
    // Ex: api.post('/auth/login', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-muted flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow"
          >
            <LogIn className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl font-bold text-foreground mb-4"
          >
            Connexion
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-muted-foreground"
          >
            Accédez à votre espace CampusHub
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="p-8 shadow-glow">
            {/* 💡 Ajout de la fonction handleSubmit */}
            <form className="space-y-6" onSubmit={handleSubmit}> 
              <div className="space-y-2">
                {/* 💡 Changement de 'Email' à 'Nom d'utilisateur' */}
                <Label htmlFor="username">Nom d'utilisateur</Label> 
                <Input
                  id="username" // 💡 Changement de 'email' à 'username'
                  type="text" // 💡 Changement de 'email' à 'text'
                  placeholder="Votre nom d'utilisateur"
                  className="h-12"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <a
                    href="#"
                    className="text-sm text-primary hover:underline"
                  >
                    Mot de passe oublié?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-12"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="hero"
                size="lg"
              >
                Se connecter
              </Button>

              {/* ... (Séparateur et lien S'inscrire inchangés) ... */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Ou
                  </span>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Vous n'avez pas de compte?{" "}
                <a
                  href="/signup"
                  className="text-primary hover:underline font-semibold"
                >
                  S'inscrire
                </a>
              </p>
            </form>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-center mt-8"
        >
          <a
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Retour à l'accueil
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signin;