import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Calendar as CalendarIcon, Filter, Users, DoorOpen, FileText } from 'lucide-react';
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from 'sonner';

const QuickPlanningViewPage = () => {
  const { entityType, entityId } = useParams<{ entityType: 'teachers' | 'rooms'; entityId: string }>();
  const navigate = useNavigate();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityName, setEntityName] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<CourseType[]>(['lecture', 'td', 'tp', 'exam', 'meeting']);

  const layoutOverrider = "-m-4 md:-m-6 lg:-m-8 max-w-none w-[calc(100%+2rem)] md:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] min-h-[calc(100vh-4rem)]";

  const handleExportPDF = () => {
    if (events.length === 0) {
      toast.error("Aucun événement à exporter.");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246); // Primary blue
    doc.text(`CampusHub - Planning Consolide`, 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    const entityLabel = entityType === 'teachers' ? 'Enseignant' : 'Salle';
    doc.text(`${entityLabel}: ${entityName}`, 14, 28);
    
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Généré le: ${new Date().toLocaleString('fr-FR')} | Source: Plans actifs`, 14, 34);

    const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const timeSlotsToExport = [
      { label: "07h00 - 09h55", start: 7.0, end: 9.92, pause: "09h55 - 10h05" },
      { label: "10h05 - 12h55", start: 10.08, end: 12.92, pause: "12h55 - 13h05" },
      { label: "13h05 - 15h55", start: 13.08, end: 15.92, pause: "15h55 - 16h05" },
      { label: "16h05 - 18h55", start: 16.08, end: 18.92, pause: null }
    ];

    const tableData: any[][] = [];

    timeSlotsToExport.forEach(slot => {
      const row: any[] = [slot.label];

      for (let dayIndex = 0; dayIndex < 6; dayIndex++) {
        const slotEvents = events.filter(e => {
          const [sH, sM] = e.startTime.split(':').map(Number);
          const [eH, eM] = e.endTime.split(':').map(Number);
          const eventStart = sH + sM/60;
          const eventEnd = eH + eM/60;

          return e.day === dayIndex && selectedTypes.includes(e.type) &&
                 ((eventStart >= slot.start && eventStart < slot.end) ||
                  (eventEnd > slot.start && eventEnd <= slot.end) ||
                  (eventStart <= slot.start && eventEnd >= slot.end));
        });

        if (slotEvents.length > 0) {
          const text = slotEvents.map(e => {
            const roomInfo = (e.room && !["N/A", "NULL", "UNDEFINED", "NON ASSIGNÉ", "NON ASSIGNE"].includes(e.room.toUpperCase())) ? e.room : "";
            
            let profName = "";
            const rawProf = e.professor ? e.professor.toUpperCase() : "";
            if (rawProf && 
                !["N/A", "NULL", "UNDEFINED", "NON ASSIGNÉ", "NON ASSIGNE"].includes(rawProf) && 
                !rawProf.includes("DÉTERMINER") && 
                !rawProf.includes("DETERMINER")) {
              const profs = e.professor.split(',').map(p => p.trim().split(' ')[0].toUpperCase());
              profName = profs.join(' ');
            }
            
            let codeDisplay = e.subjectCode || e.title;
            if (e.type === 'tp') codeDisplay = `TP-${codeDisplay}`;
            else if (e.type === 'td') codeDisplay = `TD-${codeDisplay}`;
            else if (e.type === 'exam') codeDisplay = `CC-${codeDisplay}`;

            return [
              codeDisplay.toUpperCase(),
              roomInfo,
              profName,
              e.type !== 'lecture' ? `${e.startTime} - ${e.endTime}` : ""
            ].filter(line => line !== "").join("\n");
          }).join("\n\n");
          row.push(text);
        } else {
          row.push("");
        }
      }
      tableData.push(row);

      if (slot.pause) {
        tableData.push([
          { 
            content: 'PAUSE 10 MIN', 
            colSpan: 7, 
            styles: { 
              halign: 'center', 
              fillColor: [241, 245, 249], 
              fontStyle: 'bold',
              textColor: [71, 85, 105],
              fontSize: 7,
              cellPadding: 1
            } 
          }
        ]);
      }
    });

    autoTable(doc, {
      startY: 40,
      head: [['HEURES', ...days.map(d => d.toUpperCase())]],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [30, 41, 59], 
        textColor: 255, 
        fontSize: 10, 
        halign: 'center',
        fontStyle: 'bold',
        cellPadding: 4
      },
      styles: { 
        fontSize: 8, 
        cellPadding: 3, 
        valign: 'middle', 
        halign: 'center',
        overflow: 'linebreak',
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold', fillColor: [241, 245, 249] }
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index !== 0) {
          if (data.cell.raw && typeof data.cell.raw === 'object') {
             // Pause row
          } else if (data.cell.text.length > 0 && data.cell.text[0] !== "") {
             data.cell.styles.fillColor = [248, 250, 252];
             data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    doc.save(`planning_${entityType}_${entityName.replace(/\s+/g, '_')}.pdf`);
    toast.success("Exportation PDF (Calendrier) réussie");
  };

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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPDF}
            className="gap-2 rounded-xl border-sidebar-border/50 hover:bg-primary/5 hover:text-primary transition-all"
            disabled={loading || events.length === 0}
          >
            <FileText size={14} />
            Exporter PDF
          </Button>

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
