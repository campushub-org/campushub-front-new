import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  Eye, 
  FileText, 
  Search, 
  ShieldCheck,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { decodeToken } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [filterStatus, setFilterStatus] = useState<'TOUT' | 'SOUMIS' | 'VALIDÉ' | 'REJETÉ'>('TOUT');
  const navigate = useNavigate();

  const getThumbnailUrl = (url: string) => {
    if (!url) return null;
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
        const userResp = await api.get<UserProfile>(`/campushub-user-service/api/users/${decoded.id}`);
        const dept = userResp.data.department;
        setDeanDepartment(dept);

        const supportsResp = await api.get<SupportCours[]>('/campushub-support-service/api/supports');
        const allSupports = supportsResp.data;

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
          return (s.statut !== 'BROUILLON') && tDept === dept;
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
      case 'VALIDÉ': return { label: 'Approuvé', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle2 };
      case 'REJETÉ': return { label: 'Rejeté', color: 'bg-rose-50 text-rose-600 border-rose-200', icon: AlertCircle };
      case 'SOUMIS': return { label: 'En attente', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Clock };
      default: return { label: status, color: 'bg-slate-50 text-slate-600 border-slate-200', icon: FileText };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Validation Académique</h1>
          <p className="text-muted-foreground">
            Département : <span className="text-foreground font-semibold">{deanDepartment || 'Chargement...'}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Rechercher un dossier..." 
              className="pl-10 h-10 rounded-lg border-border/50 bg-background shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-xl w-fit border border-border/50">
        {(['TOUT', 'SOUMIS', 'VALIDÉ', 'REJETÉ'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200",
              filterStatus === status 
                ? "bg-background text-primary shadow-sm border border-border/50" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {status === 'TOUT' ? 'Tous les dossiers' : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[380px] rounded-xl bg-muted/30 animate-pulse border border-border/50" />
          ))}
        </div>
      ) : filteredSupports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredSupports.map((item) => {
              const config = getStatusConfig(item.statut);
              const thumbnail = getThumbnailUrl(item.fichierUrl);
              
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="group h-full flex flex-col justify-between hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden border-border/50 bg-card">
                    <div className="relative aspect-[4/5] overflow-hidden bg-muted cursor-pointer" onClick={() => navigate(`/dashboard/dean/support/view/${item.id}`)}>
                      {thumbnail ? (
                        <img src={thumbnail} alt={item.titre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                          <FileText size={64} strokeWidth={1.5} />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
                        <Button variant="secondary" className="rounded-lg font-bold gap-2">
                          Examiner <ArrowRight size={16} />
                        </Button>
                      </div>

                      <div className="absolute top-3 right-3">
                        <Badge className={cn("rounded-lg border shadow-sm px-2.5 py-0.5 font-semibold gap-1.5", config.color)}>
                          <config.icon size={12} /> {config.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                          <BookOpen size={10} /> {item.matiere}
                        </div>
                        <h3 className="text-lg font-bold tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {item.titre}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                          <Calendar size={14} className="text-primary" /> 
                          {new Date(item.dateDepot).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                          <GraduationCap size={12} /> {item.niveau}
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
        <div className="py-24 text-center border-2 border-dashed border-border/50 rounded-2xl bg-muted/5">
          <ShieldCheck className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-1">Aucun dossier en attente</h3>
          <p className="text-muted-foreground max-w-xs mx-auto text-sm">Tous les supports de cours de votre département ont été traités.</p>
        </div>
      )}
    </div>
  );
};

export default ValidationPage;
