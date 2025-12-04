import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GraduationCap, BookOpen, Shield, User } from "lucide-react";
import { useState, ChangeEvent, FormEvent } from "react";

// --- Définition des Rôles (Assurez-vous que l'ID correspond à l'énumération Role de Java) ---
const roles = [
  {
    id: "STUDENT",
    label: "Étudiant",
    icon: GraduationCap,
    description: "Accédez aux supports de cours et consultez vos emplois du temps",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "TEACHER",
    label: "Enseignant",
    icon: BookOpen,
    description: "Gérez vos cours et déposez des supports pédagogiques",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "DEAN",
    label: "Doyen",
    icon: Shield,
    description: "Validez les supports et supervisez les planifications",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "ADMIN",
    label: "Administrateur",
    icon: User,
    description: "Administrez l'ensemble de la plateforme",
    gradient: "from-green-500 to-emerald-500",
  },
];

// --- Interface de base couvrant TOUS les champs possibles (base + spécifiques) ---
interface FullSignupData {
  // Champs de base (User.java)
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  
  // Champs spécifiques
  studentNumber: string;
  officeNumber: string;
  grade: string;
}

const initialFormData: FullSignupData = {
  username: "",
  password: "",
  fullName: "",
  email: "",
  role: "", 
  department: "",
  studentNumber: "",
  officeNumber: "",
  grade: "",
};

const Signup = () => {
  const [formData, setFormData] = useState<FullSignupData>(initialFormData);
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  // Fonction de mise à jour générique pour tous les champs
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id as keyof FullSignupData]: value, // Assure le typage correct de l'ID
    }));
  };

  // Mise à jour de l'état du rôle
  const handleRoleSelection = (roleId: string) => {
    setFormData((prevData) => ({
      ...prevData,
      role: roleId,
    }));
  };

  // Mise à jour de fullName et suggestion de username
  const updateFullName = (fName: string, lName: string) => {
    setFormData((prevData) => ({
      ...prevData,
      fullName: `${fName.trim()} ${lName.trim()}`,
      username: `${fName.toLowerCase().charAt(0)}${lName.toLowerCase()}`,
    }));
  };

  // Logique de soumission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (formData.password !== passwordConfirm) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

    if (!formData.role) {
      alert("Veuillez sélectionner un rôle.");
      return;
    }

    // --- CONSTRUCTION DE L'OBJET FINAL POUR L'API JAVA ---
    const baseData = {
      username: formData.username,
      password: formData.password,
      fullName: formData.fullName,
      email: formData.email,
      role: formData.role,
      department: formData.department,
    };

    let submissionData: any = baseData;

    switch (formData.role) {
      case 'STUDENT':
        // Ajout des champs spécifiques à Student
        submissionData = { ...baseData, studentNumber: formData.studentNumber };
        break;
      case 'TEACHER':
      case 'DEAN':
        // Teacher et Dean utilisent les mêmes champs spécifiques de Teacher.java
        submissionData = { ...baseData, officeNumber: formData.officeNumber, grade: formData.grade };
        break;
      case 'ADMIN':
        // Aucun champ supplémentaire pour Admin pour l'instant
        submissionData = baseData;
        break;
    }
    // ----------------------------------------------------

    console.log(`Données finalisées pour l'API Java (${formData.role}):`, submissionData);

    // Ici, vous feriez l'appel API (fetch ou axios)
    // Exemple : api.post('/api/users/signup', submissionData);
  };

  // --- RENDU CONDITIONNEL DES CHAMPS SPÉCIFIQUES ---
  const renderSpecificFields = () => {
    switch (formData.role) {
      case 'STUDENT':
        return (
          <div className="space-y-2">
            <Label htmlFor="studentNumber">Numéro d'étudiant</Label>
            <Input
              id="studentNumber"
              placeholder="Ex: 2024-001"
              value={formData.studentNumber}
              onChange={handleChange}
              required
            />
          </div>
        );
      case 'TEACHER':
      case 'DEAN':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="officeNumber">Numéro de bureau</Label>
              <Input
                id="officeNumber"
                placeholder="Ex: B205"
                value={formData.officeNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade / Titre</Label>
              <Input
                id="grade"
                placeholder="Ex: Maître de Conférences"
                value={formData.grade}
                onChange={handleChange}
                required
              />
            </div>
          </>
        );
      case 'ADMIN':
        // Aucun champ supplémentaire pour l'instant
        return null;
      default:
        return null;
    }
  };

  // ... (code précédent jusqu'à la définition de selectedRole)
const selectedRole = formData.role;

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

        {/* ======================================================= */}
        {/* ÉTAPE 1: SÉLECTION DU RÔLE (Affichée si selectedRole est vide) */}
        {/* ======================================================= */}
        {!selectedRole ? (
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
                  onClick={() => handleRoleSelection(role.id)}
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
        ) : (
          /* ======================================================= */
          /* ÉTAPE 2: FORMULAIRE D'INSCRIPTION (Affichée si selectedRole est défini) */
          /* ======================================================= */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <Card className="max-w-2xl mx-auto p-8 shadow-glow">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-semibold">
                  Inscription :{" "}
                  <span className="text-primary">
                    {roles.find(r => r.id === selectedRole)?.label}
                  </span>
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRoleSelection("")} // Réinitialise le rôle
                >
                  Changer de rôle
                </Button>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* ... (Le reste du formulaire avec tous les champs) ... */}
                
                {/* CHAMPS DE BASE (USER.JAVA) */}
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      placeholder="Votre prénom"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        updateFullName(e.target.value, lastName);
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      placeholder="Votre nom"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        updateFullName(firstName, e.target.value);
                      }}
                      required
                    />
                  </div>
                </div>

                {/* CHAMPS DE BASE (SUITE) */}

                <div className="space-y-2">
                  <Label htmlFor="department">Département/Faculté</Label>
                  <Input
                    id="department"
                    placeholder="Ex: Informatique ou Faculté de Droit"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    placeholder="Nom d'utilisateur généré ou choisi"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>


                {/* CHAMPS SPÉCIFIQUES (CONDITIONNEL) */}
                {selectedRole && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 pt-4 border-t border-border mt-6"
                  >
                    <h3 className="font-semibold text-lg text-primary">Informations Spécifiques au Rôle</h3>
                    {renderSpecificFields()}
                  </motion.div>
                )}


                {/* CHAMPS MOT DE PASSE */}

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  variant="hero"
                  size="lg"
                  // Je n'ai pas pu valider tous les champs ici, donc je me base sur le rôle
                  disabled={!selectedRole || !formData.email || !formData.password || !passwordConfirm}
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
        )}
        {/* FIN DU BLOC CONDITIONNEL */}

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