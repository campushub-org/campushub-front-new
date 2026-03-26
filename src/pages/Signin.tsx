import api from "@/lib/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { LogIn, GraduationCap, ArrowRight, ShieldCheck, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface LoginData {
  username: string;
  password: string;
}

const Signin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginData>({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.username || !formData.password) {
      setError("Veuillez remplir tous les champs.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post("/campushub-user-service/api/auth/login", formData);

      if (response.data.token) {
        const token = response.data.token;
        localStorage.setItem("token", token);

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const role = decodedToken.role.toLowerCase();
        const userId = decodedToken.id;

        localStorage.setItem('userRole', role);

        try {
          const userProfileResponse = await api.get(`/campushub-user-service/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const profilePictureUrl = userProfileResponse.data.profilePictureUrl;
          if (profilePictureUrl) {
            localStorage.setItem('userProfileImage', profilePictureUrl);
            window.dispatchEvent(new Event('profileImageUpdated'));
          }
        } catch (profileErr) {
          console.error("Erreur profil:", profileErr);
        }

        switch (role) {
          case 'student': navigate('/dashboard/student'); break;
          case 'teacher': navigate('/dashboard/teacher'); break;
          case 'dean': navigate('/dashboard/dean'); break;
          case 'admin': navigate('/dashboard/admin'); break;
          default: navigate('/dashboard'); break;
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Nom d'utilisateur ou mot de passe incorrect.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_2px_2px,rgba(0,0,0,0.05)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:40px_40px]" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[1000px] grid lg:grid-cols-2 bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-border/50"
      >
        {/* Left Side - Form */}
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <a href="/" className="flex items-center gap-2 mb-8 group">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-glow group-hover:rotate-12 transition-transform">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tighter">CampusHub</span>
            </a>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Bon retour !</h1>
            <p className="text-muted-foreground">Connectez-vous pour accéder à votre espace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="username"
                  placeholder="votre.nom"
                  className="h-14 pl-12 bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <a href="#" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">Oublié ?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-14 pl-12 pr-12 bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                  value={formData.password}
                  onChange={handleChange}
                  required
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

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold shadow-glow group"
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : "Se connecter"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white dark:bg-slate-900 px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Ou</span>
              </div>
            </div>

            <p className="text-center text-muted-foreground">
              Pas encore de compte ?{" "}
              <a href="/signup" className="text-primary font-bold hover:underline transition-all">S'inscrire</a>
            </p>
          </form>
        </div>

        {/* Right Side - Visual/Marketing */}
        <div className="hidden lg:block relative bg-slate-50 dark:bg-slate-800 p-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent" />
          
          <div className="relative h-full flex flex-col justify-between z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20">
                <ShieldCheck className="h-4 w-4" />
                <span>Plateforme Sécurisée</span>
              </div>
              <h2 className="text-4xl font-bold leading-tight tracking-tight">
                La gestion académique réinventée pour <span className="text-primary">votre succès.</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Rejoignez une communauté d'excellence et profitez d'outils intelligents pour vos études.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-border/50 transform rotate-2 translate-y-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-20 bg-slate-50 dark:bg-slate-800 rounded" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 w-full bg-slate-50 dark:bg-slate-800 rounded" />
                <div className="h-4 w-[80%] bg-slate-50 dark:bg-slate-800 rounded" />
                <div className="h-12 w-full bg-primary/10 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signin;
