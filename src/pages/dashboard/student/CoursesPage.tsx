import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  BookOpen, 
  GraduationCap, 
  Download, 
  Eye, 
  Filter, 
  ArrowUpRight,
  FileText,
  Bookmark,
  Calendar,
  Layers
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export interface SupportCours {
  id: number;
  titre: string;
  description: string;
  fichierUrl: string;
  niveau: 'L1' | 'L2' | 'L3' | 'M1' | 'M2';
  matiere: string;
  statut: string;
  dateDepot: string;
}

const StudentCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<SupportCours[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('Tous');
  const navigate = useNavigate();

  const getThumbnailUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('cloudinary.com') && url.toLowerCase().endsWith('.pdf')) {
      return url.replace('.pdf', '.jpg').replace('/upload/', '/upload/w_400,h_500,c_fill,pg_1,q_auto,f_auto/');
    }
    return null;
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get<SupportCours[]>('/campushub-support-service/api/supports');
        // Étudiant : On ne montre que les supports validés
        setCourses(response.data.filter(c => c.statut === 'VALIDÉ'));
      } catch (err) {
        toast.error("Impossible de charger les supports de cours.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         course.matiere.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'Tous' || course.niveau === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const levels = ['Tous', 'L1', 'L2', 'L3', 'M1', 'M2'];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Student SaaS Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-glow-sm">
              <BookOpen size={24} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Catalogue des Supports</h1>
          </div>
          <p className="text-muted-foreground text-lg font-medium">
            Accédez à vos ressources pédagogiques validées par la faculté.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Rechercher un cours, une matière..." 
              className="pl-10 h-12 rounded-xl border-border/50 bg-white dark:bg-slate-900 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-2xl w-fit border border-border/50">
        {levels.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setSelectedLevel(lvl)}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300",
              selectedLevel === lvl 
                ? "bg-white dark:bg-slate-800 text-primary shadow-md border border-border/50 scale-105" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {lvl === 'Tous' ? 'Tous les niveaux' : lvl}
          </button>
        ))}
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[420px] rounded-[32px] bg-muted/30 animate-pulse border border-border/50" />
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((item) => {
              const thumbnail = getThumbnailUrl(item.fichierUrl);
              
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="group h-full flex flex-col justify-between hover:shadow-2xl hover:border-primary/20 transition-all duration-500 rounded-[32px] overflow-hidden border-border/50 bg-white dark:bg-slate-900">
                    <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {thumbnail ? (
                        <img src={thumbnail} alt={item.titre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                          <FileText size={80} strokeWidth={1} />
                        </div>
                      )}
                      
                      {/* Interactive Hover Layer */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                        <Button 
                          onClick={() => navigate(`/dashboard/student/courses/view/${item.id}`)}
                          className="w-full rounded-xl font-bold bg-white text-black hover:bg-primary hover:text-white border-none h-12 mb-3"
                        >
                          Visualiser le cours <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => window.open(item.fichierUrl, '_blank')}
                          className="w-full rounded-xl font-bold bg-white/10 text-white border-white/20 hover:bg-white/20 h-12"
                        >
                          <Download size={18} className="mr-2" /> Télécharger
                        </Button>
                      </div>

                      {/* Top Info Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className="rounded-xl border shadow-lg backdrop-blur-md px-3 py-1 font-bold bg-primary/90 text-white border-none">
                          {item.niveau}
                        </Badge>
                      </div>
                      <button className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:scale-110 transition-all border border-white/30 shadow-lg">
                        <Bookmark size={18} />
                      </button>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                          <Layers size={12} /> {item.matiere}
                        </div>
                        <h3 className="text-xl font-extrabold tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {item.titre}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                          <Calendar size={14} className="text-primary" /> {new Date(item.dateDepot).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                        </div>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
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
          <Search className="h-20 w-20 text-muted-foreground/20 mx-auto mb-6" />
          <h3 className="text-2xl font-bold mb-2">Aucun support trouvé</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">Ajustez vos filtres ou votre recherche pour trouver ce que vous cherchez.</p>
        </div>
      )}
    </div>
  );
};

export default StudentCoursesPage;
