import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, Users, DoorOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const QuickPlanningSelectionPage = () => {
  const { entityType } = useParams<{ entityType: 'teachers' | 'rooms' }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const layoutOverrider = "-m-4 md:-m-6 lg:-m-8 max-w-none w-[calc(100%+2rem)] md:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] min-h-[calc(100vh-4rem)]";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (entityType === 'teachers') {
          const response = await api.get('/campushub-user-service/api/users');
          setItems(response.data.filter((u: any) => u.role === 'TEACHER'));
        } else {
          const response = await api.get('/campushub-salle-service/api/salles');
          setItems(response.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [entityType]);

  const filteredItems = items.filter(item => {
    const query = searchQuery.toLowerCase();
    if (entityType === 'teachers') {
      return item.fullName?.toLowerCase().includes(query) || item.email?.toLowerCase().includes(query);
    } else {
      return item.nom?.toLowerCase().includes(query) || item.code?.toLowerCase().includes(query);
    }
  });

  return (
    <div className={cn("w-full h-full bg-sidebar text-sidebar-foreground animate-in fade-in duration-300", layoutOverrider)}>
      <div className="px-6 py-6 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/dashboard/dean/quick-planning')}
            className="rounded-full hover:bg-sidebar-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-sidebar-primary">
              Sélection {entityType === 'teachers' ? 'Enseignant' : 'Salle'}
            </h1>
            <p className="text-xs text-sidebar-foreground/60 font-medium uppercase tracking-widest mt-0.5">
              Étape 2 sur 3
            </p>
          </div>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground/40" />
          <Input 
            placeholder="Rechercher..." 
            className="pl-9 bg-sidebar-accent/50 border-sidebar-border/50 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sidebar-foreground/60 font-medium">Chargement des données...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id || item.code}
                onClick={() => navigate(`/dashboard/dean/quick-planning/view/${entityType}/${item.id || item.code}`)}
                className="p-5 rounded-2xl bg-card border border-border/30 hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all group shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-sidebar-accent flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
                    {entityType === 'teachers' ? <Users size={20} /> : <DoorOpen size={20} />}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-sidebar-primary truncate">
                      {entityType === 'teachers' ? item.fullName : item.nom}
                    </h3>
                    <p className="text-sm text-sidebar-foreground/60 truncate">
                      {entityType === 'teachers' ? item.email : item.code}
                    </p>
                    {entityType === 'rooms' && (
                      <div className="mt-2 flex items-center gap-2">
                         <span className="text-[10px] px-2 py-0.5 bg-sidebar-accent rounded-full font-bold uppercase tracking-tighter">
                           {item.capacite} places
                         </span>
                         <span className="text-[10px] px-2 py-0.5 bg-sidebar-accent rounded-full font-bold uppercase tracking-tighter">
                           {item.batiment}
                         </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-sidebar-foreground/60 italic">Aucun résultat trouvé pour "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickPlanningSelectionPage;
