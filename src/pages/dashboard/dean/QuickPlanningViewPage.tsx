import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Calendar as CalendarIcon, Filter, Users, DoorOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { ScheduleEvent, SchedulePlan, CourseType } from '@/lib/schedule-data';
import { WeekView } from '@/components/schedule/week-view';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const QuickPlanningViewPage = () => {
  const { entityType, entityId } = useParams<{ entityType: 'teachers' | 'rooms'; entityId: string }>();
  const navigate = useNavigate();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityName, setEntityName] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<CourseType[]>(['lecture', 'td', 'tp', 'exam', 'meeting']);

  const layoutOverrider = "-m-4 md:-m-6 lg:-m-8 max-w-none w-[calc(100%+2rem)] md:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] min-h-[calc(100vh-4rem)]";

  useEffect(() => {
    const fetchAllActiveData = async () => {
      setLoading(true);
      try {
        // 1. Fetch entity name
        if (entityType === 'teachers') {
          const teacherRes = await api.get(`/campushub-user-service/api/users/${entityId}`);
          setEntityName(teacherRes.data.fullName);
        } else {
          // For rooms, the ID is the code
          const roomsRes = await api.get(`/campushub-salle-service/api/salles`);
          const room = roomsRes.data.find((r: any) => r.id.toString() === entityId || r.code === entityId);
          setEntityName(room ? room.nom : entityId);
        }

        // 2. Fetch all plans
        const plansRes = await api.get<SchedulePlan[]>('/campushub-scheduling-service/api/scheduling/plans');
        const activePlans = plansRes.data.filter(p => p.status === 'ACTIVE');

        // 3. Fetch events for each active plan
        const allEventsPromises = activePlans.map(plan => 
          api.get<ScheduleEvent[]>(`/campushub-scheduling-service/api/scheduling/events?planId=${plan.id}`)
        );

        const eventsResponses = await Promise.all(allEventsPromises);
        let allFilteredEvents: ScheduleEvent[] = [];

        eventsResponses.forEach(res => {
          const planEvents = res.data;
          const filtered = planEvents.filter(event => {
            if (entityType === 'teachers') {
              return event.teacherId?.toString() === entityId || event.professor === entityName;
            } else {
              return event.roomId?.toString() === entityId || event.room === entityName || event.room === entityId;
            }
          });
          allFilteredEvents = [...allFilteredEvents, ...filtered];
        });

        setEvents(allFilteredEvents);
      } catch (error) {
        console.error('Error fetching planning data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllActiveData();
  }, [entityType, entityId, entityName]);

  const toggleType = (type: CourseType) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className={cn("w-full h-full bg-sidebar text-sidebar-foreground animate-in fade-in duration-300 flex flex-col", layoutOverrider)}>
      <div className="px-6 py-4 border-b border-sidebar-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/dashboard/dean/quick-planning/select/${entityType}`)}
            className="rounded-full hover:bg-sidebar-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {entityType === 'teachers' ? <Users size={20} /> : <DoorOpen size={20} />}
             </div>
             <div>
                <h1 className="text-xl font-black tracking-tighter text-sidebar-primary leading-none">
                  {entityName || 'Chargement...'}
                </h1>
                <p className="text-[10px] text-sidebar-foreground/60 font-bold uppercase tracking-widest mt-1">
                  Vue consolidée (Plans Actifs)
                </p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl border-sidebar-border/50">
                <Filter size={14} />
                Filtrer les types
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              {(['lecture', 'td', 'tp', 'exam', 'meeting'] as CourseType[]).map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => toggleType(type)}
                  className="capitalize"
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6 bg-sidebar-accent/20">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sidebar-foreground/60 font-medium">Génération du planning en cours...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="h-full overflow-auto">
             <WeekView 
                events={events} 
                currentDate={new Date()} 
                selectedTypes={selectedTypes}
             />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
            <div className="h-20 w-20 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground/20 mb-4">
              <CalendarIcon size={40} />
            </div>
            <h3 className="text-lg font-bold text-sidebar-primary">Aucun cours programmé</h3>
            <p className="text-sm text-sidebar-foreground/60 mt-2">
              Cette {entityType === 'teachers' ? 'enseignant n\'a' : 'salle n\'a'} aucun cours assigné dans les plans actuellement actifs.
            </p>
            <Button 
              variant="outline" 
              className="mt-6 rounded-xl"
              onClick={() => navigate(`/dashboard/dean/quick-planning/select/${entityType}`)}
            >
              Retour à la sélection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickPlanningViewPage;
