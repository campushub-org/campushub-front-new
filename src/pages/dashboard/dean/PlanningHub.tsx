import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Zap, ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PlanningHub = () => {
  const navigate = useNavigate();
  const layoutOverrider = "-m-4 md:-m-6 lg:-m-8 max-w-none w-[calc(100%+2rem)] md:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] min-h-[calc(100vh-4rem)]";

  const options = [
    {
      id: 'global',
      title: 'Planning Global',
      description: 'Vue d\'ensemble et outils d\'édition complets',
      icon: Calendar,
      path: '/dashboard/dean/schedule'
    },
    {
      id: 'fast',
      title: 'Planning Rapide',
      description: 'Ajustements rapides des créneaux critiques',
      icon: Zap,
      path: '#'
    }
  ];

  return (
    <div className={cn("w-full h-full bg-card animate-in fade-in duration-300", layoutOverrider)}>
      <div className="px-6 py-6 border-b border-border">
        <h1 className="text-2xl font-black tracking-tighter text-foreground">Gestion de la Programmation</h1>
      </div>

      <div className="flex flex-col">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => option.path !== '#' && navigate(option.path)}
            disabled={option.path === '#'}
            className={cn(
              "flex items-center gap-6 px-6 py-8 w-full text-left transition-colors duration-150 border-b border-border",
              "hover:bg-accent/50",
              option.path === '#' && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="text-primary">
              <option.icon className="h-6 w-6" />
            </div>
            
            <div className="flex-1">
              <div className="text-lg font-bold text-foreground">{option.title}</div>
              <div className="text-sm text-muted-foreground">{option.description}</div>
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlanningHub;
