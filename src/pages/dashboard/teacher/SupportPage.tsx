import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Trash2, 
  Eye, 
  MoreVertical,
  BookOpen,
  GraduationCap,
  ArrowUpRight,
  Filter,
  Inbox
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import api from '@/lib/api';
import { decodeToken } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import DepositMaterialDrawer from '@/components/dashboard/teacher/DepositMaterialDrawer';

export interface Material {
  id: number;
  titre: string;
  matiere: string;
  fichierUrl: string;
  niveau: 'L1' | 'L2' | 'L3' | 'M1' | 'M2';
  statut: 'BROUILLON' | 'SOUMIS' | 'VALIDÉ' | 'REJETÉ';
  dateDepot: string;
}

const TeacherSupportPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDepositDrawerOpen, setIsDepositDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const getThumbnailUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('cloudinary.com') && url.toLowerCase().endsWith('.pdf')) {
      return url.replace('.pdf', '.jpg').replace('/upload/', '/upload/w_400,h_500,c_fill,pg_1,q_auto,f_auto/');
    }
    return null;
  };

  const fetchMaterials = async () => {
    const token = localStorage.getItem('token');
    const decoded = decodeToken(token || '');
    if (!decoded?.id) return;

    try {
      const response = await api.get<Material[]>(`/campushub-support-service/api/supports/enseignant/${decoded.id}`);
      setMaterials(response.data);
    } catch (err) {
      toast.error("Erreur de chargement des supports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMaterials(); }, []);

  const handleAction = async (id: number, action: 'submit' | 'delete') => {
    try {
      if (action === 'submit') {
        await api.post(`/campushub-support-service/api/supports/${id}/submit`);
        setMaterials(prev => prev.map(m => m.id === id ? { ...m, statut: 'SOUMIS' } : m));
        toast.success("Support soumis pour validation");
      } else {
        await api.delete(`/campushub-support-service/api/supports/${id}`);
        setMaterials(prev => prev.filter(m => m.id !== id));
        toast.success("Support supprimé");
      }
    } catch (err) {
      toast.error("L'opération a échoué");
    }
  };

  const getStatusConfig = (status: Material['statut']) => {
    switch (status) {
      case 'VALIDÉ': return { label: 'Approuvé', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', icon: CheckCircle2 };
      case 'REJETÉ': return { label: 'À corriger', color: 'bg-rose-500/10 text-rose-600 border-rose-200', icon: XCircle };
      case 'SOUMIS': return { label: 'En attente', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: Clock };
      default: return { label: 'Brouillon', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: FileText };
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.matiere.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Mes Supports de Cours</h1>
          <p className="text-muted-foreground">
            Gérez votre catalogue pédagogique et suivez l'état des validations.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Rechercher un support..." 
              className="pl-10 h-10 rounded-lg border-border/50 bg-background shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setIsDepositDrawerOpen(true)} 
            className="h-10 rounded-lg px-4 font-semibold shadow-sm gap-2"
          >
            <Plus size={18} /> Nouveau support
          </Button>
        </div>
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[380px] rounded-xl bg-muted/30 animate-pulse border border-border/50" />
          ))}
        </div>
      ) : filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredMaterials.map((item) => {
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
                    <div className="relative aspect-[4/5] overflow-hidden bg-muted cursor-pointer" onClick={() => navigate(`/dashboard/teacher/support/view/${item.id}`)}>
                      {thumbnail ? (
                        <img src={thumbnail} alt={item.titre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                          <FileText size={64} strokeWidth={1.5} />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
                        <Button variant="secondary" className="rounded-lg font-bold gap-2">
                          Voir les détails <ArrowUpRight size={16} />
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
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                          <GraduationCap size={14} className="text-primary" /> Niveau {item.niveau}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {item.statut === 'BROUILLON' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-primary hover:bg-primary/10" 
                              onClick={() => handleAction(item.id, 'submit')}
                              title="Soumettre pour validation"
                            >
                              <Send size={16} />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-lg">
                                <MoreVertical size={18} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                              <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer" onClick={() => navigate(`/dashboard/teacher/support/view/${item.id}`)}>
                                <Eye size={16} /> Détails
                              </DropdownMenuItem>
                              {item.statut === 'BROUILLON' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-lg gap-2 cursor-pointer text-destructive focus:text-destructive">
                                      <Trash2 size={16} /> Supprimer
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Supprimer ce support ?</AlertDialogTitle>
                                      <AlertDialogDescription>Cette action est irréversible. Le fichier sera définitivement supprimé.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="rounded-xl font-bold">Annuler</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleAction(item.id, 'delete')} className="bg-destructive text-white rounded-xl font-bold">Supprimer</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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
        <div className="py-32 text-center border-4 border-dashed border-border/50 rounded-[48px] bg-muted/5">
          <Inbox className="h-20 w-20 text-muted-foreground/20 mx-auto mb-6" />
          <h3 className="text-2xl font-bold mb-2">Aucun support déposé</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">Commencez par déposer votre premier support de cours pour vos étudiants.</p>
          <Button onClick={() => setIsDepositDrawerOpen(true)} size="lg" className="rounded-xl font-bold px-8 shadow-glow">
            <Plus className="mr-2 h-5 w-5" /> Déposer mon premier support
          </Button>
        </div>
      )}

      <DepositMaterialDrawer open={isDepositDrawerOpen} onOpenChange={setIsDepositDrawerOpen} onSuccess={fetchMaterials} />
    </div>
  );
};

export default TeacherSupportPage;
