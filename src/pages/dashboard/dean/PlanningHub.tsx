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
      description: 'Ajustements rapides des créneaux critiques',
      icon: Zap,
      path: '#'
    }
  ];

  return (
    <div className={cn("w-full h-full bg-sidebar text-sidebar-foreground animate-in fade-in duration-300", layoutOverrider)}>
      <div className="px-6 py-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-black tracking-tighter text-sidebar-primary">Gestion de la Programmation</h1>
      </div>

      <div className="grid gap-6 p-6 grid-cols-1 sm:grid-cols-2">
        {options.map((option) => (
          <article
            key={option.id}
            className={cn(
              "flex flex-col justify-between w-full rounded-lg border border-sidebar-border bg-card/70 p-4 transition-shadow duration-200",
              "hover:shadow-medium hover:scale-[1.01]",
              option.path === '#' && "opacity-60 cursor-not-allowed"
            )}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                <option.icon className="h-6 w-6" />
              </div>

              <div className="flex-1">
                <div className="text-lg font-semibold text-sidebar-primary">{option.title}</div>
                <div className="text-sm text-sidebar-foreground/80 mt-1">{option.description}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => option.path !== '#' && navigate(option.path)}
                disabled={option.path === '#'}
                className={cn(
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  option.path === '#' && "pointer-events-none"
                )}
              >
                Ouvrir
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default PlanningHub;
