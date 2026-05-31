import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Users, 
  MapPin, 
  BookOpen, 
  Link as LinkIcon, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2,
  MoreVertical,
  Filter,
  Layout,
  ChevronRight,
  Database,
  ArrowLeft,
  Save,
  Info,
  User,
  Mail,
  Building,
  GraduationCap,
  Layers,
  Clock,
  Shield,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Settings,
  RefreshCw,
  Lock,
  Upload,
  Download,
  Copy,
  CalendarDays
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type EntityType = "teachers" | "rooms" | "subjects" | "assignments" | "plans";
type ViewMode = "list" | "detail";

const EditionPage: React.FC = () => {
  const [activeEntity, setActiveEntity] = useState<EntityType>("teachers");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Import/Export Modal states
  const [isIOModalOpen, setIsIOModalOpen] = useState(false);
  const [ioType, setIoType] = useState<"import" | "export">("export");
  const [exportFormat, setExportFormat] = useState<"pdf" | "json">("pdf");
  const [exportLevel, setExportLevel] = useState<string>("all");
  const [exportSemester, setExportSemester] = useState<string>("all");

  // Import result states (detailed)
  const [isImportResultOpen, setIsImportResultOpen] = useState(false);
  const [importResultAccepted, setImportResultAccepted] = useState<any[]>([]);
  const [importResultRejected, setImportResultRejected] = useState<Array<{item:any,reason:string}>>([]);
  
  // Data states
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  const layoutOverrider = "-m-4 md:-m-6 lg:-m-8 max-w-none w-[calc(100%+2rem)] md:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)]";

  const fetchData = useCallback(async (entity: EntityType) => {
    setLoading(true);
    try {
      switch (entity) {
        case "teachers": {
          const response = await api.get("/campushub-user-service/api/users");
          setTeachers(response.data.filter((u: any) => u.role === "TEACHER"));
          break;
        }
        case "rooms": {
          const response = await api.get("/campushub-salle-service/api/salles");
          setRooms(response.data);
          break;
        }
        case "subjects": {
          const response = await api.get("/campushub-scheduling-service/api/subjects");
          setSubjects(response.data);
          break;
        }
        case "assignments": {
          const [asgRes, teachersRes, subjectsRes] = await Promise.all([
            api.get("/campushub-scheduling-service/api/scheduling/assignments"),
            api.get("/campushub-user-service/api/users"),
            api.get("/campushub-scheduling-service/api/subjects")
          ]);
          setAssignments(asgRes.data);
          setTeachers(teachersRes.data.filter((u: any) => u.role === "TEACHER"));
          setSubjects(subjectsRes.data);
          break;
        }
        case "plans": {
          const response = await api.get("/campushub-scheduling-service/api/scheduling/plans");
          setPlans(response.data);
          break;
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur de synchronisation");
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    switch (activeEntity) {
      case "teachers":
        return teachers.filter(t => t.fullName?.toLowerCase().includes(query) || t.email?.toLowerCase().includes(query));
      case "rooms":
        return rooms.filter(r => r.nom?.toLowerCase().includes(query) || r.code?.toLowerCase().includes(query));
      case "subjects":
        return subjects.filter(s => s.name?.toLowerCase().includes(query) || s.code?.toLowerCase().includes(query));
      case "assignments":
        return assignments.filter(a => a.teacherName?.toLowerCase().includes(query) || a.subjectCode?.toLowerCase().includes(query));
      case "plans":
        return plans.filter(p => p.name?.toLowerCase().includes(query) || p.academicYear?.toLowerCase().includes(query));
      default: return [];
    }
  }, [searchQuery, activeEntity, teachers, rooms, subjects, assignments, plans]);

  useEffect(() => {
    fetchData(activeEntity);
    setViewMode("list");
  }, [activeEntity, fetchData]);

  const handleRowClick = (item: any) => {
    setSelectedItem({ ...item });
    setViewMode("detail");
  };

  const handleAdd = () => {
    let defaults = {};
    switch (activeEntity) {
      case "teachers": defaults = { role: "TEACHER", department: "INFORMATIQUE-INE", officeNumber: "", grade: "Professeur" }; break;
      case "rooms": defaults = { actif: true, capacite: 50, batiment: "Bâtiment Principal", filiere: "INFORMATIQUE-INE" }; break;
      case "subjects": defaults = { credits: 6, niveau: 1, semester: 1, category: "Fundamental", specialite: "INFORMATIQUE-INE" }; break;
      case "assignments": defaults = { role: "COURSE_LECTURER" }; break;
      case "plans": defaults = { name: "", academicYear: "2025-2026", semester: 1, level: "L1", status: "DRAFT", isDefault: false }; break;
    }
    setSelectedItem(defaults);
    setViewMode("detail");
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    
    // Validation stricte
    if (activeEntity === "teachers" && (!selectedItem.fullName || !selectedItem.email)) {
        toast.error("Veuillez remplir le nom et l'email");
        return;
    }
    if (activeEntity === "assignments" && (!selectedItem.teacherId || !selectedItem.subjectCode)) {
        toast.error("Veuillez sélectionner un enseignant et une matière");
        return;
    }

    setIsSaving(true);
    try {
      const isNew = activeEntity === "subjects" 
        ? !subjects.some(s => s.code === selectedItem.code) 
        : !selectedItem.id;
        
      const id = activeEntity === "subjects" ? selectedItem.code : selectedItem.id;
      let endpoint = "";
      
      switch (activeEntity) {
        case "teachers": endpoint = isNew ? "/campushub-user-service/api/auth/register" : `/campushub-user-service/api/users/${id}`; break;
        case "rooms": endpoint = isNew ? "/campushub-salle-service/api/salles" : `/campushub-salle-service/api/salles/${id}`; break;
        case "subjects": endpoint = isNew ? "/campushub-scheduling-service/api/subjects" : `/campushub-scheduling-service/api/subjects/${id}`; break;
        case "assignments": endpoint = isNew ? "/campushub-scheduling-service/api/scheduling/assignments" : `/campushub-scheduling-service/api/scheduling/assignments/${id}`; break;
        case "plans": endpoint = isNew ? "/campushub-scheduling-service/api/scheduling/plans" : `/campushub-scheduling-service/api/scheduling/plans/${id}`; break;
      }
      
      const payload = isNew && activeEntity === "teachers" ? { ...selectedItem, role: "TEACHER" } : selectedItem;
      
      if (isNew) await api.post(endpoint, payload);
      else await api.put(endpoint, payload);
      
      toast.success("Enregistrement réussi");
      setViewMode("list");
      fetchData(activeEntity);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("Supprimer définitivement cet élément ?")) return;
    try {
      let endpoint = "";
      switch (activeEntity) {
        case "teachers": endpoint = `/campushub-user-service/api/users/${id}`; break;
        case "rooms": endpoint = `/campushub-salle-service/api/salles/${id}`; break;
        case "subjects": endpoint = `/campushub-scheduling-service/api/subjects/${id}`; break;
        case "assignments": endpoint = `/campushub-scheduling-service/api/scheduling/assignments/${id}`; break;
        case "plans": endpoint = `/campushub-scheduling-service/api/scheduling/plans/${id}`; break;
      }
      await api.delete(endpoint);
      toast.success("Élément supprimé");
      if (viewMode === "detail") setViewMode("list");
      fetchData(activeEntity);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const stripIds = (obj: any) => {
    const copy = JSON.parse(JSON.stringify(obj));
    // Remove common id fields to make exports safe for re-import
    delete copy.id;
    // Keep 'code' for subjects (subject.code is PK and should be preserved), otherwise remove to avoid collisions
    if (activeEntity !== 'subjects') delete copy.code;
    // remove keys that end with Id or _id
    Object.keys(copy).forEach(k => {
      if (/Id$|_id$/i.test(k)) delete copy[k];
    });
    return copy;
  };

  const handleExportAction = () => {
    // Application des filtres Niveau et Semestre si applicable
    let dataToExport = filteredData;
    let description = "Liste complète des éléments";

    if (activeEntity === "subjects") {
      if (exportLevel !== "all") {
        dataToExport = dataToExport.filter(s => s.niveau?.toString() === exportLevel);
      }
      if (exportSemester !== "all") {
        dataToExport = dataToExport.filter(s => s.semester?.toString() === exportSemester);
      }
      description = `Matières - Filière: INFORMATIQUE-INE | Niveau: ${exportLevel === "all" ? "Tous" : "L"+exportLevel} | Semestre: ${exportSemester === "all" ? "Tous" : "S"+exportSemester}`;
    } else {
      const entityLabel = navItems.find(i => i.id === activeEntity)?.label || activeEntity;
      description = `Liste des ${entityLabel} - Filière: INFORMATIQUE-INE`;
    }
    
    if (!dataToExport || dataToExport.length === 0) {
      toast.error("Aucune donnée ne correspond à ces critères");
      return;
    }

    if (exportFormat === "json") {
      // Strip IDs from export to avoid PK conflicts on re-import across services
      const sanitized = dataToExport.map(item => stripIds(item));
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sanitized, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `export_${activeEntity}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      toast.success("Export JSON réussi (IDs supprimés)");
    } else {
      const doc = new jsPDF();
      doc.setFillColor(63, 81, 181);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text("CAMPUSHUB", 14, 25);
      
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(16);
      doc.text(`RAPPORT D'EDITION : ${activeEntity.toUpperCase()}`, 14, 55);
      
      // Ajout de la description détaillée
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(description, 14, 62);
      doc.text(`Date de génération: ${new Date().toLocaleString()}`, 14, 68);
      
      doc.setDrawColor(200);
      doc.line(14, 72, 196, 72);

      let head: string[][] = [];
      let body: any[][] = [];

      if (activeEntity === "teachers") {
          head = [["NOM COMPLET", "FILIERE", "GRADE", "EMAIL"]];
          body = dataToExport.map(t => [t.fullName || "N/A", "INFORMATIQUE-INE", t.grade || "N/A", t.email || "N/A"]);
      } else if (activeEntity === "rooms") {
          head = [["NOM", "CODE", "FILIERE", "CAPACITE"]];
          body = dataToExport.map(r => [r.nom || "N/A", r.code || "N/A", "INFORMATIQUE-INE", r.capacite || "0"]);
      } else if (activeEntity === "subjects") {
          head = [["NOM", "CODE", "FILIERE", "NIVEAU", "SEM"]];
          body = dataToExport.map(s => [s.name || "N/A", s.code || "N/A", "INFORMATIQUE-INE", `L${s.niveau || 1}`, `S${s.semester || 1}`]);
      } else {
          head = [["ENSEIGNANT", "CODE UE", "FILIERE", "ROLE"]];
          body = dataToExport.map(a => [a.teacherName || "N/A", a.subjectCode || "N/A", "INFORMATIQUE-INE", a.role || "N/A"]);
      }

      autoTable(doc, { head, body, startY: 78, theme: 'grid' });
      doc.save(`rapport_${activeEntity}.pdf`);
      toast.success("Rapport PDF généré");
    }
    setIsIOModalOpen(false);
  };

  const handleImportExecute = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) {
            toast.error("Le format JSON doit être une liste d'objets");
            return;
        }

        const accepted: any[] = [];
        const rejected: Array<{item:any,reason:string}> = [];

        const preprocessForImport = (obj: any) => {
          const copy = JSON.parse(JSON.stringify(obj));
          // remove client-side ids to force creation except subject.code which must be preserved
          delete copy.id;
          if (activeEntity !== 'subjects') delete copy.code;
          Object.keys(copy).forEach(k => { if (/Id$|_id$/i.test(k)) delete copy[k]; });
          return copy;
        };

        for (const rawItem of json) {
            try {
                // Basic validation per entity
                let reason: string | null = null;
                const item = { ...rawItem };

                // If the file was exported by this tool, ids are likely absent — we'll recreate safely.
                switch (activeEntity) {
                    case "teachers":
                      if (!item.fullName || !item.email) reason = 'Champs manquants: fullName ou email';
                      if (!reason && teachers.some(t => t.email === item.email)) reason = 'Existe déjà (email)';
                      break;
                    case "rooms":
                      if (!item.nom && !item.code) reason = 'Champs manquants: nom ou code';
                      if (!reason && (rooms.some(r => r.code === item.code) || rooms.some(r => r.nom === item.nom))) reason = 'Existe déjà (code/nom)';
                      break;
                    case "subjects":
                      if (!item.code || !item.name) reason = 'Champs manquants: code ou name';
                      if (!reason && subjects.some(s => s.code === item.code)) reason = 'Existe déjà (code)';
                      break;
                    case "assignments":
                      // Assignments rely on teacherId and subjectCode; if teacherId is missing, ask user to import teachers first
                      if (!item.teacherId || !item.subjectCode) reason = "Champs manquants: teacherId ou subjectCode (importez d'abord les enseignants si nécessaire)";
                      if (!reason && assignments.some(a => a.teacherId === item.teacherId && a.subjectCode === item.subjectCode)) reason = 'Existe déjà (assignation)';
                      break;
                }

                if (reason) {
                  rejected.push({ item: rawItem, reason });
                } else {
                  // prepare payload — recreate objects (strip ids) except subject.code
                  const payload = preprocessForImport(item);

                  // attempt to insert
                  let endpoint = "";
                  switch (activeEntity) {
                    case "teachers": endpoint = "/campushub-user-service/api/auth/register"; break;
                    case "rooms": endpoint = "/campushub-salle-service/api/salles"; break;
                    case "subjects": endpoint = "/campushub-scheduling-service/api/subjects"; break;
                    case "assignments": endpoint = "/campushub-scheduling-service/api/scheduling/assignments"; break;
                  }

                  try {
                    // sequential POST to make behavior predictable and easier to inspect
                    const res = await api.post(endpoint, payload);
                    // store created entity returned by server (with new id)
                    accepted.push({ item: res.data || payload, recreated: true });
                  } catch (err: any) {
                    console.error("Failed to import item:", payload, err);
                    rejected.push({ item: rawItem, reason: err.response?.data?.message || 'Erreur serveur' });
                  }
                }

            } catch (err) {
                console.error("Failed to process item:", rawItem, err);
                rejected.push({ item: rawItem, reason: 'Erreur parsing item' });
            }
        }

        // save results and show detailed dialog
        setImportResultAccepted(accepted);
        setImportResultRejected(rejected);
        setIsImportResultOpen(true);

        // refresh lists for UI
        fetchData(activeEntity);
        setIsIOModalOpen(false);
      } catch (err) {
        toast.error("Fichier JSON invalide");
      }
    };
    reader.readAsText(file);
  };

  const navItems = [
    { id: "teachers", label: "Enseignants", icon: Users },
    { id: "rooms", label: "Salles", icon: MapPin },
    { id: "subjects", label: "Matières", icon: BookOpen },
    { id: "assignments", label: "Assignations", icon: LinkIcon },
    { id: "plans", label: "Plannings", icon: CalendarDays },
  ];

  return (
    <TooltipProvider>
      <div className={cn(
        "flex h-[calc(100vh-theme(spacing.16))] bg-background overflow-hidden border-t border-border/50",
        layoutOverrider
      )}>
        {/* Sidebar Verticale */}
        <aside className={cn(
          "shrink-0 border-r border-border/50 bg-card transition-all duration-300 relative h-full",
          sidebarOpen ? "w-[14.5rem] opacity-100" : "w-0 opacity-0 overflow-hidden border-r-0"
        )}>
          <div className="w-[14.5rem] flex flex-col h-full">
            <div className="py-6">
              <div className="px-6 mb-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Navigation</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => fetchData(activeEntity)}>
                    <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                  </Button>
                </div>
              </div>
              <nav className="px-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = activeEntity === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveEntity(item.id as EntityType)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 h-10 rounded-lg transition-all duration-200 group",
                        isActive 
                          ? "bg-primary/10 text-primary hover:bg-primary/15" 
                          : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className={cn("h-4 w-4 flex-shrink-0 transition-transform duration-200", isActive && "scale-110")} />
                        <span className="ml-3 text-sm font-medium">{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="mt-auto p-4 border-t border-border/50">
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-primary/5 border border-primary/10">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-tight text-primary/80">Mode Édition Actif</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Zone de Contenu Principale */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-full bg-muted/5">
          
          {/* Header Dynamique */}
          <div className="h-16 shrink-0 bg-background/80 backdrop-blur-md z-10 border-b border-border/40 shadow-sm flex items-center px-6">
            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex items-center gap-4">
                {viewMode === "list" ? (
                  <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Layout className="h-5 w-5 text-muted-foreground" />
                  </Button>
                ) : (
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-full shadow-sm" onClick={() => setViewMode("list")}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <h1 className="text-lg font-bold tracking-tight text-foreground capitalize">
                  {viewMode === "list" 
                    ? navItems.find(i => i.id === activeEntity)?.label 
                    : "Fiche détaillée"}
                </h1>
              </div>

              {viewMode === "list" && (
                <div className="flex items-center gap-3 flex-1 max-w-xl">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={`Chercher dans ${navItems.find(i => i.id === activeEntity)?.label.toLowerCase()}...`}
                      className="h-9 pl-9 bg-muted/50 border-border/40 focus:bg-background focus:ring-1 focus:ring-primary/20"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-9 w-9 border-border/40 hover:bg-primary/5 hover:text-primary transition-colors"
                          onClick={() => { setIoType("import"); setIsIOModalOpen(true); }}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs font-bold uppercase tracking-wider">Importer la liste</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-9 w-9 border-border/40 hover:bg-primary/5 hover:text-primary transition-colors"
                          onClick={() => { setIoType("export"); setIsIOModalOpen(true); }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs font-bold uppercase tracking-wider">Exporter la liste</p>
                      </TooltipContent>
                    </Tooltip>

                    <Button size="sm" className="h-9 gap-2 px-4 shadow-sm" onClick={handleAdd}>
                      <Plus className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Nouveau</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Corps de la page */}
          <div className="flex-1 overflow-hidden relative">
            <div className="h-full overflow-y-auto scrollbar-thin [scrollbar-gutter:stable]">
              
              {loading && viewMode === "list" ? (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary opacity-30" />
                  <p className="text-sm font-medium text-muted-foreground">Synchronisation...</p>
                </div>
              ) : viewMode === "list" ? (
                /* VUE LISTE */
                <div className="w-full mb-8 bg-card border-b border-border/50 shadow-xl shadow-black/5 overflow-hidden animate-in fade-in duration-300">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[60px] px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground">#</TableHead>
                        <TableHead className="h-12 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground text-left">Désignation / Information</TableHead>
                        <TableHead className="h-12 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground text-center w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item: any, index: number) => {
                        // Pour les assignations, trouver le nom de la matière si possible
                        let subName = "";
                        if (activeEntity === "assignments") {
                            subName = subjects.find(s => s.code === item.subjectCode)?.name || "";
                        }

                        return (
                        <TableRow 
                          key={item.id || item.code} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/40 group" 
                          onClick={() => handleRowClick(item)}
                        >
                          <TableCell className="px-6 font-mono text-[10px] text-muted-foreground/60 font-bold">
                            {(index + 1).toString().padStart(2, '0')}
                          </TableCell>
                          <TableCell className="py-4 px-6 text-left">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl flex items-center justify-center text-primary bg-primary/10 transition-transform group-hover:scale-110 shadow-sm">
                                {activeEntity === "teachers" && <User className="h-5 w-5" />}
                                {activeEntity === "rooms" && <MapPin className="h-5 w-5" />}
                                {activeEntity === "subjects" && <BookOpen className="h-5 w-5" />}
                                {activeEntity === "assignments" && <LinkIcon className="h-5 w-5" />}
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-sm text-foreground">
                                  {item.fullName || item.nom || item.name || item.teacherName}
                                </p>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                  {activeEntity === "assignments" ? (
                                     <>
                                       <span className="font-semibold text-primary">{item.subjectCode}</span>
                                       {subName && <span className="opacity-70 truncate max-w-[200px]">• {subName}</span>}
                                       <Badge className="ml-2 scale-75 origin-left">{item.role === "COURSE_LECTURER" ? "Titulaire" : "Assistant"}</Badge>
                                     </>
                                  ) : activeEntity === "plans" ? (
                                    <>
                                      <span className="font-semibold text-primary">{item.academicYear}</span>
                                      <span className="opacity-70">• Niveau {item.level} • S{item.semester}</span>
                                      <Badge variant={item.status === 'ACTIVE' ? 'default' : 'secondary'} className="ml-2 scale-75 origin-left">
                                        {item.status === 'ACTIVE' ? 'Actif' : item.status}
                                      </Badge>
                                    </>
                                  ) : (
                                     item.email || item.code || item.subjectCode || item.batiment
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            <ActionsMenu onDelete={(e) => handleDelete(item.id || item.code, e)} />
                          </TableCell>
                        </TableRow>
                      )})}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                /* VUE DÉTAIL PROFESSIONNELLE */
                <div className="w-full mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-20 px-4 md:px-8 lg:px-12">
                  
                  {/* Header de la Fiche */}
                  <div className="flex items-end justify-between mb-8 px-2 text-left">
                    <div className="flex items-center gap-6">
                      <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/30 ring-4 ring-background">
                         {activeEntity === "teachers" && <User className="h-10 w-10" />}
                         {activeEntity === "rooms" && <MapPin className="h-10 w-10" />}
                         {activeEntity === "subjects" && <BookOpen className="h-10 w-10" />}
                         {activeEntity === "assignments" && <LinkIcon className="h-10 w-10" />}
                         {activeEntity === "plans" && <CalendarDays className="h-10 w-10" />}
                      </div>
                      <div className="space-y-1">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 uppercase text-[10px] font-bold tracking-tighter">
                          {navItems.find(i => i.id === activeEntity)?.label}
                        </Badge>
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                          {selectedItem.fullName || selectedItem.nom || selectedItem.name || selectedItem.teacherName || "Nouvel élément"}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                           <span className="flex items-center gap-1.5 font-mono"><Shield className="h-4 w-4 text-primary" /> {selectedItem.id || selectedItem.code || "ID Auto-généré"}</span>
                           <span className="h-1 w-1 rounded-full bg-border" />
                           <span className={cn(
                             "flex items-center gap-1.5 font-bold",
                             (selectedItem.status === 'ACTIVE' || selectedItem.actif !== false) ? "text-emerald-600" : "text-amber-600"
                           )}>
                             <CheckCircle2 className="h-4 w-4" /> 
                             Statut: {activeEntity === 'plans' ? selectedItem.status : (selectedItem.actif !== false ? 'Actif' : 'Inactif')}
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10 text-left">
                    
                    {/* SECTION 1: INFORMATIONS GÉNÉRALES */}
                    <section className="space-y-6">
                       <div className="flex items-center gap-3">
                          <Info className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-bold text-foreground tracking-tight">Informations de base</h3>
                       </div>
                       <Separator className="bg-border/60" />
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 px-2">
                         {activeEntity === "teachers" && (
                           <>
                             <FormGroup label="Nom complet" icon={<User className="h-4 w-4" />}>
                               <Input value={selectedItem.fullName || ""} onChange={v => setSelectedItem({...selectedItem, fullName: v.target.value})} placeholder="Ex: Jean Dupont" />
                             </FormGroup>
                             <FormGroup label="Identifiant de connexion" icon={<Shield className="h-4 w-4" />}>
                               <Input value={selectedItem.username || ""} onChange={v => setSelectedItem({...selectedItem, username: v.target.value})} placeholder="j.dupont" />
                             </FormGroup>
                             <FormGroup label="Email académique" icon={<Mail className="h-4 w-4" />}>
                               <Input type="email" value={selectedItem.email || ""} onChange={v => setSelectedItem({...selectedItem, email: v.target.value})} placeholder="jean.dupont@campushub.cm" />
                             </FormGroup>
                             <FormGroup label="Département" icon={<Building className="h-4 w-4" />}>
                               <Input value={selectedItem.department || ""} onChange={v => setSelectedItem({...selectedItem, department: v.target.value})} placeholder="INFORMATIQUE-INE" />
                             </FormGroup>
                             <FormGroup label="Numéro de bureau" icon={<MapPin className="h-4 w-4" />}>
                               <Input value={selectedItem.officeNumber || ""} onChange={v => setSelectedItem({...selectedItem, officeNumber: v.target.value})} placeholder="Ex: B-204" />
                             </FormGroup>
                             <FormGroup label="Photo de profil (URL)" icon={<Monitor className="h-4 w-4" />}>
                               <Input value={selectedItem.profilePictureUrl || ""} onChange={v => setSelectedItem({...selectedItem, profilePictureUrl: v.target.value})} placeholder="https://..." />
                             </FormGroup>
                             {!selectedItem.id && (
                               <FormGroup label="Mot de passe temporaire" icon={<Lock className="h-4 w-4" />}>
                                 <Input type="password" value={selectedItem.password || ""} onChange={v => setSelectedItem({...selectedItem, password: v.target.value})} placeholder="••••••••" />
                               </FormGroup>
                             )}
                           </>
                         )}

                         {activeEntity === "rooms" && (
                           <>
                             <FormGroup label="Nom de la salle" icon={<Layout className="h-4 w-4" />}>
                               <Input value={selectedItem.nom || ""} onChange={v => setSelectedItem({...selectedItem, nom: v.target.value})} placeholder="Ex: Amphi A" />
                             </FormGroup>
                             <FormGroup label="Code technique" icon={<Shield className="h-4 w-4" />}>
                               <Input value={selectedItem.code || ""} onChange={v => setSelectedItem({...selectedItem, code: v.target.value})} placeholder="AMPH-A" />
                             </FormGroup>
                             <FormGroup label="Bâtiment / Zone" icon={<Building className="h-4 w-4" />}>
                               <Input value={selectedItem.batiment || ""} onChange={v => setSelectedItem({...selectedItem, batiment: v.target.value})} placeholder="Bâtiment Principal" />
                             </FormGroup>
                             <FormGroup label="Capacité d'accueil" icon={<Users className="h-4 w-4" />}>
                               <Input type="number" value={selectedItem.capacite || ""} onChange={v => setSelectedItem({...selectedItem, capacite: parseInt(v.target.value)})} />
                             </FormGroup>
                           </>
                         )}

                         {activeEntity === "subjects" && (
                           <>
                             <FormGroup label="Intitulé du cours" icon={<BookOpen className="h-4 w-4" />}>
                               <Input value={selectedItem.name || ""} onChange={v => setSelectedItem({...selectedItem, name: v.target.value})} placeholder="Ex: Algorithmique" />
                             </FormGroup>
                             <FormGroup label="Code de l'unité" icon={<Shield className="h-4 w-4" />}>
                               <Input value={selectedItem.code || ""} onChange={v => setSelectedItem({...selectedItem, code: v.target.value})} disabled={!!selectedItem.id && subjects.some(s => s.code === selectedItem.code)} className="bg-muted/50 font-mono" placeholder="INF111" />
                             </FormGroup>
                             <FormGroup label="Catégorie" icon={<Layers className="h-4 w-4" />}>
                               <Input value={selectedItem.category || ""} onChange={v => setSelectedItem({...selectedItem, category: v.target.value})} placeholder="Fondamentale, Optionnelle..." />
                             </FormGroup>
                             <FormGroup label="Spécialité" icon={<GraduationCap className="h-4 w-4" />}>
                               <Input value={selectedItem.specialite || ""} onChange={v => setSelectedItem({...selectedItem, specialite: v.target.value})} placeholder="INFORMATIQUE-INE" />
                             </FormGroup>
                           </>
                         )}

                         {activeEntity === "assignments" && (
                           <>
                             <FormGroup label="Enseignant" icon={<User className="h-4 w-4" />}>
                               <Select 
                                 value={selectedItem.teacherId?.toString()} 
                                 onValueChange={v => {
                                   const t = teachers.find(prof => prof.id.toString() === v);
                                   setSelectedItem({...selectedItem, teacherId: parseInt(v), teacherName: t?.fullName});
                                 }}
                               >
                                 <SelectTrigger className="h-12 bg-background border-border/60">
                                   <SelectValue placeholder="Choisir un enseignant" />
                                 </SelectTrigger>
                                 <SelectContent>
                                   {teachers.map(t => (
                                     <SelectItem key={t.id} value={t.id.toString()}>{t.fullName}</SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                             </FormGroup>

                             <FormGroup label="Cours / Unité d'Enseignement" icon={<BookOpen className="h-4 w-4" />}>
                               <Select 
                                 value={selectedItem.subjectCode} 
                                 onValueChange={v => setSelectedItem({...selectedItem, subjectCode: v})}
                               >
                                 <SelectTrigger className="h-12 bg-background border-border/60">
                                   <SelectValue placeholder="Choisir une matière" />
                                 </SelectTrigger>
                                 <SelectContent>
                                   {subjects.map(s => (
                                     <SelectItem key={s.code} value={s.code}>{s.name} ({s.code})</SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                             </FormGroup>
                             
                             <FormGroup label="Rôle assigné" icon={<LinkIcon className="h-4 w-4" />}>
                               <Select 
                                 value={selectedItem.role} 
                                 onValueChange={v => setSelectedItem({...selectedItem, role: v})}
                               >
                                 <SelectTrigger className="h-12 bg-background border-border/60">
                                   <SelectValue placeholder="Choisir un rôle" />
                                 </SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="COURSE_LECTURER">Titulaire du cours (CM)</SelectItem>
                                   <SelectItem value="ASSISTANT_LECTURER">Assistant (TD/TP)</SelectItem>
                                 </SelectContent>
                               </Select>
                             </FormGroup>
                           </>
                         )}

                         {activeEntity === "plans" && (
                           <>
                             <FormGroup label="Nom du Planning" icon={<CalendarDays className="h-4 w-4" />}>
                               <Input value={selectedItem.name || ""} onChange={v => setSelectedItem({...selectedItem, name: v.target.value})} placeholder="Ex: Semestre 1 - L3 INFO" />
                             </FormGroup>
                             <FormGroup label="Année Académique" icon={<Clock className="h-4 w-4" />}>
                               <Input value={selectedItem.academicYear || ""} onChange={v => setSelectedItem({...selectedItem, academicYear: v.target.value})} placeholder="2025-2026" />
                             </FormGroup>
                             <FormGroup label="Niveau" icon={<Layers className="h-4 w-4" />}>
                               <Select value={selectedItem.level} onValueChange={v => setSelectedItem({...selectedItem, level: v})}>
                                 <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="L1">L1</SelectItem>
                                   <SelectItem value="L2">L2</SelectItem>
                                   <SelectItem value="L3">L3</SelectItem>
                                   <SelectItem value="M1">M1</SelectItem>
                                   <SelectItem value="M2">M2</SelectItem>
                                 </SelectContent>
                               </Select>
                             </FormGroup>
                             <FormGroup label="Semestre" icon={<Clock className="h-4 w-4" />}>
                               <Select value={selectedItem.semester?.toString()} onValueChange={v => setSelectedItem({...selectedItem, semester: parseInt(v)})}>
                                 <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="1">Semestre 1</SelectItem>
                                   <SelectItem value="2">Semestre 2</SelectItem>
                                 </SelectContent>
                               </Select>
                             </FormGroup>
                             <FormGroup label="Statut du Plan" icon={<Shield className="h-4 w-4" />}>
                               <Select value={selectedItem.status} onValueChange={v => setSelectedItem({...selectedItem, status: v})}>
                                 <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="DRAFT">Brouillon (Édition seule)</SelectItem>
                                   <SelectItem value="ACTIVE">Actif (Visible par tous)</SelectItem>
                                   <SelectItem value="ARCHIVED">Archivé</SelectItem>
                                 </SelectContent>
                               </Select>
                             </FormGroup>
                             <div className="flex items-center justify-between p-5 bg-background border border-border/60 rounded-2xl shadow-sm">
                               <div className="space-y-0.5">
                                 <Label className="text-sm font-bold">Plan par défaut</Label>
                                 <p className="text-xs text-muted-foreground">Utilisé pour l'affichage initial</p>
                               </div>
                               <Switch checked={selectedItem.isDefault} onCheckedChange={v => setSelectedItem({...selectedItem, isDefault: v})} />
                             </div>
                           </>
                         )}
                       </div>
                    </section>

                    {/* SECTION 2: PARAMÈTRES AVANCÉS */}
                    {(activeEntity === "teachers" || activeEntity === "rooms" || activeEntity === "subjects") && (
                      <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Settings className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-bold text-foreground tracking-tight">Paramètres spécifiques</h3>
                        </div>
                        <Separator className="bg-border/60" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 px-2">
                            {activeEntity === "teachers" && (
                              <FormGroup label="Grade / Rang" icon={<GraduationCap className="h-4 w-4" />}>
                                <Select value={selectedItem.grade || "Professeur"} onValueChange={v => setSelectedItem({...selectedItem, grade: v})}>
                                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Professeur">Professeur</SelectItem>
                                    <SelectItem value="Maître de Conférences">Maître de Conférences</SelectItem>
                                    <SelectItem value="Chargé de Cours">Chargé de Cours</SelectItem>
                                    <SelectItem value="Assistant">Assistant</SelectItem>
                                    <SelectItem value="Chargé de TD">Chargé de TD</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormGroup>
                            )}

                            {activeEntity === "rooms" && (
                              <>
                                <FormGroup label="Filière dédiée" icon={<GraduationCap className="h-4 w-4" />}>
                                  <Input value={selectedItem.filiere || ""} onChange={v => setSelectedItem({...selectedItem, filiere: v.target.value})} placeholder="INFORMATIQUE-INE" />
                                </FormGroup>
                                <div className="flex items-center justify-between p-5 bg-background border border-border/60 rounded-2xl shadow-sm">
                                  <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">État de la salle</Label>
                                    <p className="text-xs text-muted-foreground">Disponible pour planification</p>
                                  </div>
                                  <Switch checked={selectedItem.actif !== false} onCheckedChange={v => setSelectedItem({...selectedItem, actif: v})} />
                                </div>
                                <div className="md:col-span-2 pt-2">
                                  <FormGroup label="Équipements & Inventaire" icon={<Monitor className="h-4 w-4" />}>
                                    <Textarea 
                                      className="min-h-[120px] bg-background border-border/60 focus:ring-1 focus:ring-primary/20 rounded-xl" 
                                      placeholder="Ex: Projecteur, Tableau blanc, 50 PCs, Climatisation..."
                                      value={selectedItem.equipements || ""}
                                      onChange={v => setSelectedItem({...selectedItem, equipements: v.target.value})}
                                    />
                                  </FormGroup>
                                </div>
                              </>
                            )}

                            {activeEntity === "subjects" && (
                              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <FormGroup label="Crédits (ECTS)" icon={<Plus className="h-4 w-4" />}>
                                    <Input type="number" value={selectedItem.credits || ""} onChange={v => setSelectedItem({...selectedItem, credits: parseInt(v.target.value)})} />
                                  </FormGroup>
                                  <FormGroup label="Niveau académique" icon={<Layers className="h-4 w-4" />}>
                                    <Input type="number" value={selectedItem.niveau || ""} onChange={v => setSelectedItem({...selectedItem, niveau: parseInt(v.target.value)})} />
                                  </FormGroup>
                                  <FormGroup label="Semestre" icon={<Clock className="h-4 w-4" />}>
                                    <Input type="number" value={selectedItem.semester || ""} onChange={v => setSelectedItem({...selectedItem, semester: parseInt(v.target.value)})} />
                                  </FormGroup>
                              </div>
                            )}
                        </div>
                      </section>
                    )}
                  </div>

                  {/* BARRE D'ACTIONS FIXE */}
                  <div className="sticky bottom-0 left-0 w-full bg-background/95 backdrop-blur-xl border-t border-border p-4 flex items-center justify-between gap-4 mt-auto">
                      <Button variant="ghost" className="text-destructive hover:bg-destructive/10 font-bold gap-2" onClick={() => handleDelete(selectedItem.id || selectedItem.code)}>
                        <Trash2 className="h-4 w-4" /> Supprimer
                      </Button>
                      <div className="flex gap-3">
                        <Button variant="outline" className="px-6 rounded-xl font-semibold border-border/60 hover:bg-muted" onClick={() => setViewMode("list")}>Annuler</Button>
                        <Button className="px-10 rounded-xl font-bold gap-2 shadow-sm shadow-primary/20 h-11" onClick={handleSave} disabled={isSaving}>
                          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                          Enregistrer les données
                        </Button>
                      </div>
                    </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Panneau d'Import/Export (ERP Style) */}
      <Sheet open={isIOModalOpen} onOpenChange={setIsIOModalOpen}>
        <SheetContent className="sm:max-w-[500px] flex flex-col h-full border-l border-border/40 shadow-2xl">
          <SheetHeader className="text-left border-b border-border/40 pb-6 mb-6">
            <SheetTitle className="flex items-center gap-3 text-2xl font-black tracking-tighter">
              {ioType === "export" ? <Download className="h-6 w-6 text-primary" /> : <Upload className="h-6 w-6 text-primary" />}
              {ioType === "export" ? "PARAMÈTRES D'EXPORTATION" : "IMPORTATION DE DONNÉES"}
            </SheetTitle>
            <SheetDescription className="text-sm font-medium text-muted-foreground mt-2">
              {ioType === "export" 
                ? "Configurez le périmètre et le format de votre rapport académique."
                : "Chargez un fichier JSON pour synchroniser massivement vos données."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto pr-2 space-y-8 py-2">
            {ioType === "export" ? (
              <>
                {/* SECTION FORMAT */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary/80">
                    <Monitor className="h-4 w-4" />
                    <Label className="text-[11px] font-black uppercase tracking-widest">Format du document</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setExportFormat("pdf")}
                      className={cn(
                        "group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all text-center",
                        exportFormat === "pdf" ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 hover:border-primary/30"
                      )}
                    >
                      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-colors", exportFormat === "pdf" ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                        <Database className="h-6 w-6" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="block font-bold text-sm">Rapport PDF</span>
                        <span className="block text-[10px] opacity-60 uppercase font-bold">Imprimable</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => setExportFormat("json")}
                      className={cn(
                        "group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all text-center",
                        exportFormat === "json" ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 hover:border-primary/30"
                      )}
                    >
                      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-colors", exportFormat === "json" ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                        <div className="font-black text-xs">JSON</div>
                      </div>
                      <div className="space-y-0.5">
                        <span className="block font-bold text-sm">Données JSON</span>
                        <span className="block text-[10px] opacity-60 uppercase font-bold">Sauvegarde</span>
                      </div>
                    </button>
                  </div>
                </div>

                <Separator className="bg-border/40" />

                {/* SECTION PERIMETRE */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-primary/80">
                    <Filter className="h-4 w-4" />
                    <Label className="text-[11px] font-black uppercase tracking-widest">Périmètre des données</Label>
                  </div>
                  
                  <div className="space-y-4 px-1">
                    <FormGroup label="Filière / Département">
                      <Select value="INFO" disabled>
                        <SelectTrigger className="h-10 bg-muted/50 font-bold"><SelectValue placeholder="INFORMATIQUE-INE" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INFO">INFORMATIQUE-INE</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-muted-foreground italic mt-1 px-1">Seule la filière INFORMATIQUE-INE est gérée actuellement.</p>
                    </FormGroup>

                    {activeEntity === "subjects" && (
                      <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                        <FormGroup label="Niveau">
                          <Select value={exportLevel} onValueChange={setExportLevel}>
                            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tous</SelectItem>
                              <SelectItem value="1">L1</SelectItem>
                              <SelectItem value="2">L2</SelectItem>
                              <SelectItem value="3">L3</SelectItem>
                              <SelectItem value="4">M1</SelectItem>
                              <SelectItem value="5">M2</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormGroup>
                        <FormGroup label="Semestre">
                          <Select value={exportSemester} onValueChange={setExportSemester}>
                            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tous</SelectItem>
                              <SelectItem value="1">S1</SelectItem>
                              <SelectItem value="2">S2</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormGroup>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* IMPORT SECTION */
              <div className="space-y-6">
                <div 
                  onClick={() => document.getElementById('io-file-input')?.click()}
                  className="border-2 border-dashed border-border/60 rounded-3xl p-12 flex flex-col items-center justify-center gap-6 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all group"
                >
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Upload className="h-10 w-10" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-extrabold text-lg tracking-tight text-foreground">Déposez votre fichier</p>
                    <p className="text-sm text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                      Sélectionnez un fichier <span className="font-mono text-primary font-bold">.JSON</span> formaté pour l'entité <span className="font-bold underline italic">{activeEntity}</span>
                    </p>
                  </div>
                  <Button variant="outline" className="rounded-full px-8 font-bold border-primary/40 text-primary">Parcourir les fichiers</Button>
                </div>
                
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/50 flex gap-4">
                   <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                   <div className="space-y-1">
                      <p className="text-xs font-black text-amber-800 uppercase">Attention</p>
                      <p className="text-xs text-amber-700/80 leading-relaxed font-medium">
                        L'importation massive écrase ou ajoute des données directement en production. Assurez-vous de la validité de votre fichier JSON.
                      </p>
                   </div>
                </div>
              </div>
            )}
          </div>

          <SheetFooter className="border-t border-border/40 pt-6 mt-auto">
            <div className="flex w-full gap-3">
              <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setIsIOModalOpen(false)}>Fermer</Button>
              {ioType === "export" && (
                <Button onClick={handleExportAction} className="flex-[2] h-12 rounded-xl font-black gap-2 shadow-lg shadow-primary/20">
                  <Download className="h-4 w-4" /> GÉNÉRER L'EXPORTATION
                </Button>
              )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <input 
        type="file" 
        id="io-file-input" 
        className="hidden" 
        accept=".json" 
        onChange={handleImportExecute} 
      />

      {/* Dialog: detailed import results (improved styling & actions) */}
      <Dialog open={isImportResultOpen} onOpenChange={setIsImportResultOpen}>
        <DialogContent className="max-w-2xl w-full max-h-[80vh] overflow-auto bg-popover/95">
          <DialogHeader className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle>Résultat de l'import</DialogTitle>
              <DialogDescription className="text-sm">Détails des éléments insérés et des éléments rejetés avec explication.</DialogDescription>
            </div>

            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-800 text-emerald-50 border-emerald-700">Acceptés: {importResultAccepted.length}</Badge>
              <Badge className="bg-rose-800 text-rose-50 border-rose-700">Rejetés: {importResultRejected.length}</Badge>
              <Button variant="ghost" size="sm" className="gap-2" onClick={async () => {
                try {
                  await navigator.clipboard.writeText(JSON.stringify({ accepted: importResultAccepted.map(a => a.item), rejected: importResultRejected.map(r => ({ item: r.item, reason: r.reason })) }, null, 2));
                  toast.success('Copié dans le presse-papier');
                } catch (err) { toast.error('Impossible de copier'); }
              }}>
                <Copy className="h-4 w-4" /> Copier tout
              </Button>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-4">
            <section className="p-3 rounded-lg bg-card/80 border border-border/30 border-l-4 border-emerald-600/40">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Acceptés</h4>
                <span className="text-xs text-emerald-200">{importResultAccepted.length}</span>
              </div>

              <div className="space-y-3 max-h-96 overflow-auto pr-2">
                {importResultAccepted.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Aucun élément inséré.</div>
                ) : (
                  importResultAccepted.map((r, i) => (
                    <div key={i} className="p-3 rounded-lg bg-popover/80 border border-border/30 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          <div>
                            <div className="text-sm font-medium">{r.item?.fullName || r.item?.name || r.item?.nom || r.item?.title || 'Élément'}</div>
                            <div className="text-xs text-muted-foreground">{r.item?.email || r.item?.code || r.item?.subjectCode || (r.item?.teacherId ? `Teacher ${r.item.teacherId}` : '')}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => {
                            // toggle expand
                            const key = `acc-${i}`;
                            // use DOM to toggle a hidden pre (simple approach without adding more state)
                            const node = document.getElementById(key);
                            if (node) node.classList.toggle('hidden');
                          }}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={async () => {
                            try { await navigator.clipboard.writeText(JSON.stringify(r.item, null, 2)); toast.success('Copié'); }
                            catch { toast.error('Échec copie'); }
                          }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <pre id={`acc-${i}`} className="text-xs mt-1 overflow-auto max-h-40 hidden bg-card/90 p-2 rounded text-card-foreground font-mono">{JSON.stringify(r.item, null, 2)}</pre>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="p-3 rounded-lg bg-card/80 border border-border/30 border-l-4 border-rose-600/40">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Rejetés</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-700">{importResultRejected.length}</span>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-auto pr-2">
                {importResultRejected.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Aucun élément rejeté.</div>
                ) : (
                  importResultRejected.map((r, i) => (
                    <div key={i} className="p-3 rounded-lg bg-popover/80 border border-border/30 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-rose-600" />
                          <div>
                            <div className="text-sm font-medium">{r.item?.fullName || r.item?.name || r.item?.nom || r.item?.title || 'Élément'}</div>
                            <div className="text-xs text-destructive">Raison : {r.reason}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => {
                            const key = `rej-${i}`;
                            const node = document.getElementById(key);
                            if (node) node.classList.toggle('hidden');
                          }}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={async () => {
                            try { await navigator.clipboard.writeText(JSON.stringify(r.item, null, 2)); toast.success('Copié'); }
                            catch { toast.error('Échec copie'); }
                          }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <pre id={`rej-${i}`} className="text-xs mt-1 overflow-auto max-h-40 hidden bg-card/90 p-2 rounded text-card-foreground font-mono">{JSON.stringify(r.item, null, 2)}</pre>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <Button className="px-3" onClick={async () => {
                  if (importResultRejected.length === 0) return toast('Rien à réessayer');
                  const stillRejected: Array<{item:any,reason:string}> = [];
                  const newlyAccepted: any[] = [];
                  for (const rr of importResultRejected) {
                    let endpoint = '';
                    switch (activeEntity) {
                      case 'teachers': endpoint = '/campushub-user-service/api/auth/register'; break;
                      case 'rooms': endpoint = '/campushub-salle-service/api/salles'; break;
                      case 'subjects': endpoint = '/campushub-scheduling-service/api/subjects'; break;
                      case 'assignments': endpoint = '/campushub-scheduling-service/api/scheduling/assignments'; break;
                    }
                    try {
                      const res = await api.post(endpoint, rr.item);
                      newlyAccepted.push(res.data || rr.item);
                    } catch (err: any) {
                      stillRejected.push({ item: rr.item, reason: err.response?.data?.message || rr.reason || 'Erreur serveur' });
                    }
                  }

                  setImportResultAccepted(prev => [...prev, ...newlyAccepted.map(i => ({ item: i }))]);
                  setImportResultRejected(stillRejected);

                  if (newlyAccepted.length > 0) toast.success(`${newlyAccepted.length} élément(s) importé(s)`);
                  if (stillRejected.length > 0) toast.error(`${stillRejected.length} élément(s) échoués`);

                  fetchData(activeEntity);
                }}>Réessayer les échecs</Button>

              </div>
            </section>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => { setIsImportResultOpen(false); setImportResultAccepted([]); setImportResultRejected([]); }}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </TooltipProvider>
  );
};

const FormGroup = ({ label, children, icon }: any) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 ml-1 text-primary/70">
      {icon}
      <Label className="text-[11px] font-extrabold uppercase tracking-widest">{label}</Label>
    </div>
    {children}
  </div>
);

const ActionsMenu = ({ onDelete }: { onDelete: (e: React.MouseEvent) => void }) => (
  <div className="flex items-center justify-center">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-accent transition-all">
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[140px] p-1 shadow-md">
        <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive focus:text-destructive font-medium cursor-pointer text-xs">
          <Trash2 className="h-3.5 w-3.5" /> Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

export default EditionPage;
