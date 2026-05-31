import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, DoorOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const QuickPlanningPage = () => {
  const navigate = useNavigate();
  const layoutOverrider = "-m-4 md:-m-6 lg:-m-8 max-w-none w-[calc(100%+2rem)] md:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] min-h-[calc(100vh-4rem)]";

  const entities = [
    {
      id: 'teachers',
      title: 'Enseignants',
      description: 'Consulter l\'emploi du temps d\'un enseignant spécifique',
      icon: Users,
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      id: 'rooms',
      title: 'Salles',
      description: 'Vérifier l\'occupation d\'une salle de classe',
      icon: DoorOpen,
      color: 'bg-emerald-500/10 text-emerald-500'
    }
  ];

  return (
    <div className={cn("w-full h-full bg-sidebar text-sidebar-foreground animate-in fade-in duration-300", layoutOverrider)}>
      <div className="px-6 py-6 border-b border-sidebar-border flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/dashboard/dean/planning-hub')}
          className="rounded-full hover:bg-sidebar-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-black tracking-tighter text-sidebar-primary">Planning Rapide</h1>
      </div>

      <div className="p-6">
        <h2 className="text-lg font-medium mb-6 text-sidebar-foreground/70">Choisissez l'entité pour laquelle vous souhaitez voir le planning</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entities.map((entity) => (
            <div
              key={entity.id}
              onClick={() => navigate(`/dashboard/dean/quick-planning/select/${entity.id}`)}
              className="group cursor-pointer p-8 rounded-3xl bg-card border border-border/30 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5 flex flex-col items-center text-center gap-4"
            >
              <div className={cn("h-20 w-20 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", entity.color)}>
                <entity.icon className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-sidebar-primary">{entity.title}</h3>
              <p className="text-sm text-sidebar-foreground/60">{entity.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickPlanningPage;
