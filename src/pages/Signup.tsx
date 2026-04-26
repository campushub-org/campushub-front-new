import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GraduationCap, BookOpen, Shield, User, ArrowRight, ArrowLeft, CheckCircle2, Mail, Lock, UserCircle, School, Eye, EyeOff } from "lucide-react";
import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roles = [
  {
    id: "STUDENT",
    label: "Étudiant",
    icon: GraduationCap,
    description: "Accédez aux supports et vos emplois du temps",
    color: "bg-blue-500",
    lightColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    id: "TEACHER",
    label: "Enseignant",
    icon: BookOpen,
    description: "Gérez vos cours et supports pédagogiques",
    color: "bg-purple-500",
    lightColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  {
    id: "DEAN",
    label: "Doyen",
    icon: Shield,
    description: "Validez les supports et superviser le campus",
    color: "bg-indigo-500",
    lightColor: "bg-indigo-50 dark:bg-indigo-900/20",
    borderColor: "border-indigo-200 dark:border-indigo-800",
  },
];

const DEPARTMENT_OPTIONS = [
  "Informatique", "Mathématiques", "Physique", "Chimie", "Biologie", "Droit", 
  "Économie", "Gestion", "Lettres Modernes", "Histoire", "Géographie", 
  "Médecine", "Pharmacie", "Architecture",
];

const GRADE_OPTIONS = [
  "Professeur", "Maître de Conférences", "Assistant", "Doctorant", 
  "Chargé de TD", "Vacataire", "Ingénieur Pédagogique",
];

interface FullSignupData {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  studentNumber: string;
  officeNumber: string;
  grade: string;
}

const initialFormData: FullSignupData = {
  username: "", password: "", fullName: "", email: "", role: "", 
  department: "", studentNumber: "", officeNumber: "", grade: "",
};

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FullSignupData>(initialFormData);
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleSelectChange = (id: keyof FullSignupData, value: string) => {
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleRoleSelection = (roleId: string) => {
    setFormData((prevData) => ({
      ...prevData, role: roleId, department: "", grade: "",
    }));
  };

  const updateFullName = (fName: string, lName: string) => {
    setFormData((prevData) => ({
      ...prevData,
      fullName: `${fName.trim()} ${lName.trim()}`,
      username: `${fName.toLowerCase().charAt(0)}${lName.toLowerCase()}`,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (formData.password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas !");
      setIsLoading(false);
      return;
    }

    const baseData = {
      username: formData.username,
      password: formData.password,
      fullName: formData.fullName,
      email: formData.email,
      role: formData.role,
      department: formData.department,
    };

    let submissionData: any = baseData;
    if (formData.role === 'STUDENT') submissionData = { ...baseData, studentNumber: formData.studentNumber };
    else submissionData = { ...baseData, officeNumber: formData.officeNumber, grade: formData.grade };

    try {
      const response = await api.post('/campushub-user-service/api/auth/register', submissionData);
      if (response.status === 201) {
        setSuccess("Inscription réussie ! Redirection...");
        setTimeout(() => navigate('/signin'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderSpecificFields = () => {
    if (formData.role === 'STUDENT') {
      return (
        <div className="space-y-2">
          <Label htmlFor="studentNumber">Numéro d'étudiant</Label>
          <Input id="studentNumber" placeholder="Ex: 2024-001" value={formData.studentNumber} onChange={handleChange} required className="h-12 bg-slate-50 dark:bg-slate-800 border-none" />
        </div>
      );
    }
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="officeNumber">Numéro de bureau</Label>
          <Input id="officeNumber" placeholder="Ex: B205" value={formData.officeNumber} onChange={handleChange} required className="h-12 bg-slate-50 dark:bg-slate-800 border-none" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grade">Grade / Titre</Label>
          <Select onValueChange={(value) => handleSelectChange('grade', value)} value={formData.grade} required>
            <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-800 border-none">
              <SelectValue placeholder="Votre grade" />
            </SelectTrigger>
            <SelectContent>
              {GRADE_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_2px_2px,rgba(0,0,0,0.03)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-[size:40px_40px]" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl z-10">
        <div className="text-center mb-12">
          <a href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-glow group-hover:rotate-12 transition-transform">
              <GraduationCap className="h-8 w-8" />
            </div>
            <span className="text-2xl font-bold tracking-tighter">CampusHub</span>
          </a>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4">Créer votre compte</h1>
          <p className="text-xl text-muted-foreground">Rejoignez l'élite académique et gérez votre avenir.</p>
        </div>

        <AnimatePresence mode="wait">
          {!formData.role ? (
            <motion.div key="roles" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid md:grid-cols-3 gap-8">
              {roles.map((role) => (
                <Card key={role.id} onClick={() => handleRoleSelection(role.id)} className={`p-8 cursor-pointer rounded-[32px] border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group ${role.borderColor} ${role.lightColor}`}>
                  <div className={`w-16 h-16 rounded-2xl ${role.color} text-white flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <role.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{role.label}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{role.description}</p>
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <span>Choisir ce rôle</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </Card>
              ))}
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl mx-auto">
              <Card className="p-8 lg:p-12 rounded-[40px] shadow-2xl border border-border/50">
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/50">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${roles.find(r => r.id === formData.role)?.color} text-white flex items-center justify-center shadow-md`}>
                      {(() => {
                        const Icon = roles.find(r => r.id === formData.role)?.icon || User;
                        return <Icon className="w-6 h-6" />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Inscription {roles.find(r => r.id === formData.role)?.label}</h2>
                      <p className="text-sm text-muted-foreground">Étape 2 sur 2</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="rounded-full group" onClick={() => handleRoleSelection("")}>
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Changer de rôle
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <div className="relative group">
                        <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input id="firstName" placeholder="Jean" value={firstName} onChange={(e) => { setFirstName(e.target.value); updateFullName(e.target.value, lastName); }} required className="h-12 pl-12 bg-slate-50 dark:bg-slate-800 border-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input id="lastName" placeholder="Dupont" value={lastName} onChange={(e) => { setLastName(e.target.value); updateFullName(firstName, e.target.value); }} required className="h-12 bg-slate-50 dark:bg-slate-800 border-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Nom d'utilisateur (Pseudo)</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input id="username" placeholder="j.dupont" value={formData.username} onChange={handleChange} required className="h-12 pl-12 bg-slate-50 dark:bg-slate-800 border-none font-medium text-primary" />
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest ml-1">Généré automatiquement à partir de votre nom</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="department">Département</Label>
                      <Select onValueChange={(v) => handleSelectChange('department', v)} value={formData.department} required>
                        <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-800 border-none">
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENT_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Académique</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input id="email" type="email" placeholder="jean.dupont@univ.edu" value={formData.email} onChange={handleChange} required className="h-12 pl-12 bg-slate-50 dark:bg-slate-800 border-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-border/50">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <School className="w-5 h-5 text-primary" />
                      Détails académiques
                    </h3>
                    {renderSpecificFields()}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-border/50">
                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="h-12 pl-12 pr-12 bg-slate-50 dark:bg-slate-800 border-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmation</Label>
                      <div className="relative group">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={passwordConfirm}
                          onChange={(e) => setPasswordConfirm(e.target.value)}
                          required
                          className="h-12 pr-12 bg-slate-50 dark:bg-slate-800 border-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">{error}</div>}
                  {success && <div className="p-4 rounded-xl bg-green-500/10 text-green-600 text-sm font-medium border border-green-500/20">{success}</div>}

                  <Button type="submit" className="w-full h-14 text-lg font-bold shadow-glow group" disabled={isLoading}>
                    {isLoading ? "Création..." : "Créer mon compte"}
                    <CheckCircle2 className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  </Button>

                  <p className="text-center text-muted-foreground">
                    Déjà inscrit ? <a href="/signin" className="text-primary font-bold hover:underline">Se connecter</a>
                  </p>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Signup;
