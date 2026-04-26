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
  Lock
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";

type EntityType = "teachers" | "rooms" | "subjects" | "assignments";
type ViewMode = "list" | "detail";

const EditionPage: React.FC = () => {
  const [activeEntity, setActiveEntity] = useState<EntityType>("teachers");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Data states
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

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
      default: return [];
    }
  }, [searchQuery, activeEntity, teachers, rooms, subjects, assignments]);

  useEffect(() => {
    fetchData(activeEntity);
    setViewMode("list");
  }, [activeEntity, fetchData]);

  const handleRowClick = (item: any) => {
    setSelectedItem({ ...item });
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
      }
      await api.delete(endpoint);
      toast.success("Élément supprimé");
      if (viewMode === "detail") setViewMode("list");
      fetchData(activeEntity);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const navItems = [
    { id: "teachers", label: "Enseignants", icon: Users },
    { id: "rooms", label: "Salles", icon: MapPin },
    { id: "subjects", label: "Matières", icon: BookOpen },
    { id: "assignments", label: "Assignations", icon: LinkIcon },
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
          sidebarOpen ? "w-72 opacity-100" : "w-0 opacity-0 overflow-hidden border-r-0"
        )}>
          <div className="w-72 flex flex-col h-full">
            <div className="py-6">
              <div className="px-6 mb-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Navigation</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => fetchData(activeEntity)}>
                   <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                </Button>
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
                  <Button size="sm" className="h-9 gap-2 px-4 shadow-sm" onClick={() => {setSelectedItem({ actif: true }); setViewMode("detail");}}>
                    <Plus className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Nouveau</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Corps de la page */}
          <div className="flex-1 overflow-hidden relative">
            <div className="h-full overflow-auto scrollbar-thin">
              
              {loading && viewMode === "list" ? (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary opacity-30" />
                  <p className="text-sm font-medium text-muted-foreground">Synchronisation...</p>
                </div>
              ) : viewMode === "list" ? (
                /* VUE LISTE */
                <div className="w-full bg-card border-x border-b border-border/50 shadow-sm overflow-hidden animate-in fade-in duration-300">
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
                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                  {activeEntity === "assignments" ? (
                                     <>
                                       <span className="font-semibold text-primary">{item.subjectCode}</span>
                                       {subName && <span className="opacity-70 truncate max-w-[200px]">• {subName}</span>}
                                       <Badge className="ml-2 scale-75 origin-left">{item.role === "COURSE_LECTURER" ? "Titulaire" : "Assistant"}</Badge>
                                     </>
                                  ) : (
                                     item.email || item.code || item.subjectCode || item.batiment
                                  )}
                                </p>
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
                <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-500 pb-20">
                  
                  {/* Header de la Fiche */}
                  <div className="flex items-end justify-between mb-8 px-2 text-left">
                    <div className="flex items-center gap-6">
                      <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/30 ring-4 ring-background">
                         {activeEntity === "teachers" && <User className="h-10 w-10" />}
                         {activeEntity === "rooms" && <MapPin className="h-10 w-10" />}
                         {activeEntity === "subjects" && <BookOpen className="h-10 w-10" />}
                         {activeEntity === "assignments" && <LinkIcon className="h-10 w-10" />}
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
                           <span className="flex items-center gap-1.5 text-emerald-600 font-bold"><CheckCircle2 className="h-4 w-4" /> Statut: Actif</span>
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
                               <Input value={selectedItem.department || ""} onChange={v => setSelectedItem({...selectedItem, department: v.target.value})} placeholder="INFO, MATH, etc." />
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
                               <Input value={selectedItem.specialite || ""} onChange={v => setSelectedItem({...selectedItem, specialite: v.target.value})} placeholder="Tronc commun, Réseaux..." />
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
                                  <Input value={selectedItem.filiere || ""} onChange={v => setSelectedItem({...selectedItem, filiere: v.target.value})} placeholder="INFO, MATH..." />
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
                  <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 animate-in slide-in-from-bottom-10 duration-700">
                    <div className="bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4">
                      <Button variant="ghost" className="text-destructive hover:bg-destructive/10 font-bold gap-2" onClick={() => handleDelete(selectedItem.id || selectedItem.code)}>
                        <Trash2 className="h-4 w-4" /> Supprimer
                      </Button>
                      <div className="flex gap-3">
                        <Button variant="outline" className="px-6 rounded-xl font-semibold border-border/60 hover:bg-muted" onClick={() => setViewMode("list")}>Annuler</Button>
                        <Button className="px-10 rounded-xl font-bold gap-2 shadow-xl shadow-primary/20 h-11" onClick={handleSave} disabled={isSaving}>
                          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                          Enregistrer les données
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
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
