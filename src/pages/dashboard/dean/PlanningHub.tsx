import React, { useState } from 'react';
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
      description: 'Consultation instantanée par salle ou enseignant',
      icon: Zap,
      path: '/dashboard/dean/quick-planning'
    }
  ];

  return (
    <div className={cn("w-full h-full bg-background text-foreground animate-in fade-in duration-300", layoutOverrider)}>
      <div className="px-6 py-6 border-b border-border/50">
        <h1 className="text-2xl font-black tracking-tighter text-primary">Gestion de la Programmation</h1>
      </div>

      <div className="space-y-4 p-6">
        {options.map((option) => (
          <article
            id={`hub-${option.id}`}
            key={option.id}
            className={cn(
              "w-full rounded-2xl bg-card border border-border/40 p-5 flex items-center justify-between gap-6 transition-all duration-200 hover:scale-[1.005] hover:shadow-lg hover:border-primary/20",
              option.path === '#' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            )}
            onClick={() => {
              if (option.path === '#') return;
              const el = document.getElementById(`hub-${option.id}`);
              el?.classList.add('ring-2', 'ring-primary/20');
              setTimeout(() => navigate(option.path), 110);
            }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-muted text-muted-foreground shadow-inner">
                <option.icon className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <div className="text-lg font-bold text-primary">{option.title}</div>
                <div className="text-sm text-muted-foreground mt-1 max-w-2xl">{option.description}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" aria-label="Ouvrir" className="p-3 rounded-full h-10 w-10 flex items-center justify-center text-primary hover:bg-primary/5">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default PlanningHub;
