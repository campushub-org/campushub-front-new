import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  Eye, 
  FileText, 
  Search, 
  Filter, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck,
  AlertCircle,
  Inbox,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { decodeToken } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Interface pour typer nos données
export interface SupportCours {
  id: number;
  titre: string;
  description: string;
  fichierUrl: string;
  niveau: 'L1' | 'L2' | 'L3' | 'M1' | 'M2';
  matiere: string;
  enseignantId: number;
  dateDepot: string;
  statut: 'BROUILLON' | 'SOUMIS' | 'VALIDÉ' | 'REJETÉ';
  dateValidation?: string;
  remarqueDoyen?: string;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  department: string;
}

const ValidationPage: React.FC = () => {
  const [supports, setSupports] = useState<SupportCours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deanDepartment, setDeanDepartment] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'TOUT' | 'SOUMIS' | 'VALIDÉ'>('TOUT');
  const navigate = useNavigate();

  // Fonction pour générer une miniature Cloudinary à partir d'un PDF
  const getThumbnailUrl = (url: string) => {
    if (!url) return null;
    // Si c'est un PDF Cloudinary, on peut générer une image de la 1ère page
    if (url.includes('cloudinary.com') && url.toLowerCase().endsWith('.pdf')) {
      return url.replace('.pdf', '.jpg').replace('/upload/', '/upload/w_400,h_500,c_fill,pg_1,q_auto,f_auto/');
    }
    return null;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem('token');
      const decoded = decodeToken(token || '');
      if (!decoded?.id) {
        setError("Session expirée");
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch Dean Profile
        const userResp = await api.get<UserProfile>(`/campushub-user-service/api/users/${decoded.id}`);
        const dept = userResp.data.department;
        setDeanDepartment(dept);

        // 2. Fetch Supports
        const supportsResp = await api.get<SupportCours[]>('/campushub-support-service/api/supports');
        const allSupports = supportsResp.data;

        // 3. Fetch Teachers to filter by department
        const teacherIds = Array.from(new Set(allSupports.map(s => s.enseignantId)));
        const teacherDeptsMap = new Map<number, string>();

        await Promise.all(teacherIds.map(async (id) => {
          try {
            const tResp = await api.get<UserProfile>(`/campushub-user-service/api/users/${id}`);
            teacherDeptsMap.set(id, tResp.data.department);
          } catch {
            teacherDeptsMap.set(id, 'Inconnu');
          }
        }));

        const filtered = allSupports.filter(s => {
          const tDept = teacherDeptsMap.get(s.enseignantId);
          return (s.statut === 'SOUMIS' || s.statut === 'VALIDÉ' || s.statut === 'REJETÉ') && tDept === dept;
        });

        setSupports(filtered);
      } catch (err) {
        setError("Impossible de charger les dossiers de validation.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const filteredSupports = supports.filter(s => {
    const matchesSearch = s.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.matiere.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'TOUT' || s.statut === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: SupportCours['statut']) => {
    switch (status) {
      case 'VALIDÉ': return { label: 'Approuvé', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', icon: CheckCircle2 };
      case 'REJETÉ': return { label: 'Rejeté', color: 'bg-rose-500/10 text-rose-600 border-rose-200', icon: AlertCircle };
      case 'SOUMIS': return { label: 'En attente', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: Clock };
      default: return { label: status, color: 'bg-slate-100 text-slate-600 border-slate-200', icon: FileText };
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary">
            <ShieldCheck size={28} className="drop-shadow-glow" />
            <h1 className="text-4xl font-extrabold tracking-tight">Validation Académique</h1>
          </div>
          <p className="text-muted-foreground text-lg font-medium">
            Supervision des supports de cours pour la filière <span className="text-foreground font-bold underline decoration-primary/30 underline-offset-4">{deanDepartment || '...'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Rechercher un support ou une matière..." 
              className="pl-10 h-12 rounded-xl border-border/50 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabs / Filters */}
      <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-2xl w-fit border border-border/50">
        {(['TOUT', 'SOUMIS', 'VALIDÉ'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
              filterStatus === status 
                ? "bg-white dark:bg-slate-800 text-primary shadow-md border border-border/50 scale-105" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {status === 'TOUT' ? 'Tous les dossiers' : status === 'SOUMIS' ? 'En attente' : 'Déjà validés'}
          </button>
        ))}
      </div>

      {/* Grid Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[400px] rounded-[32px] bg-muted/30 animate-pulse border border-dashed border-border/50" />
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5 rounded-[32px] p-12 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
          <h3 className="text-2xl font-bold mb-2">Erreur système</h3>
          <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-8 rounded-xl">Réessayer</Button>
        </Card>
      ) : filteredSupports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredSupports.map((item) => {
              const config = getStatusConfig(item.statut);
              const thumbnail = getThumbnailUrl(item.fichierUrl);
              
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="group h-full flex flex-col justify-between hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 rounded-[32px] overflow-hidden border-border/50 bg-white dark:bg-slate-900">
                    <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {/* PDF Thumbnail */}
                      {thumbnail ? (
                        <img 
                          src={thumbnail} 
                          alt={item.titre}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                          <FileText size={80} strokeWidth={1} />
                        </div>
                      )}
                      
                      {/* Overlay Info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                        <p className="text-white text-sm line-clamp-3 italic mb-4">
                          "{item.description || "Pas de description..."}"
                        </p>
                        <Button 
                          onClick={() => navigate(`/dashboard/dean/validations/view/${item.id}`)}
                          className="w-full rounded-xl font-bold bg-white text-black hover:bg-primary hover:text-white border-none h-12"
                        >
                          Examiner le dossier <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>

                      {/* Status Badge (Top Right) */}
                      <div className="absolute top-4 right-4">
                        <Badge className={cn("rounded-xl border shadow-lg backdrop-blur-md px-3 py-1.5 font-bold gap-2", config.color)}>
                          <config.icon size={14} />
                          {config.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                          <BookOpen size={12} />
                          {item.matiere}
                        </div>
                        <h3 className="text-xl font-extrabold leading-tight tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {item.titre}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                          <GraduationCap size={14} className="text-primary" />
                          Niveau {item.niveau}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {new Date(item.dateDepot).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-32 text-center border-4 border-dashed border-muted-foreground/10 rounded-[48px] bg-muted/5">
          <Inbox className="h-20 w-20 text-muted-foreground/20 mx-auto mb-6" />
          <h3 className="text-2xl font-bold mb-2">Aucun support trouvé</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Il n'y a actuellement aucun support de cours correspondant à vos critères dans cette filière.
          </p>
        </div>
      )}
    </div>
  );
};

export default ValidationPage;
