import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  BookOpen, 
  FileText,
  Calendar,
  ArrowUpRight,
  Download
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Catalogue des Supports</h1>
          <p className="text-muted-foreground">
            Accédez à vos ressources pédagogiques validées par la faculté.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Rechercher un cours, une matière..." 
              className="pl-10 h-10 rounded-lg border-border/50 bg-background shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-xl w-fit border border-border/50">
        {levels.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setSelectedLevel(lvl)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200",
              selectedLevel === lvl 
                ? "bg-background text-primary shadow-sm border border-border/50" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {lvl === 'Tous' ? 'Tous les niveaux' : lvl}
          </button>
        ))}
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[400px] rounded-xl bg-muted/30 animate-pulse border border-border/50" />
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  <Card className="group h-full flex flex-col justify-between hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden border-border/50 bg-card">
                    <div className="relative aspect-[4/5] overflow-hidden bg-muted cursor-pointer" onClick={() => navigate(`/dashboard/student/courses/view/${item.id}`)}>
                      {thumbnail ? (
                        <img src={thumbnail} alt={item.titre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                          <FileText size={64} strokeWidth={1.5} />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6 gap-2">
                        <Button variant="secondary" size="sm" className="rounded-lg font-bold">
                          Consulter
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="rounded-lg h-9 w-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.fichierUrl, '_blank');
                          }}
                        >
                          <Download size={16} />
                        </Button>
                      </div>

                      <div className="absolute top-3 right-3">
                        <Badge className="rounded-lg border shadow-sm px-2.5 py-0.5 font-semibold bg-background/80 backdrop-blur-sm text-primary border-primary/20">
                          {item.niveau}
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
                          {new Date(item.dateDepot).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                        </div>
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
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
          <Search className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-1">Aucun support trouvé</h3>
          <p className="text-muted-foreground max-w-xs mx-auto text-sm">Ajustez vos filtres ou votre recherche pour trouver ce que vous cherchez.</p>
        </div>
      )}
    </div>
  );
};

export default StudentCoursesPage;
