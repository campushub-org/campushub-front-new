import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  ArrowLeft, 
  Calendar, 
  FileText, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  BookOpen,
  GraduationCap,
  Maximize2,
  MoreVertical,
  Share2,
  History,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

export interface SupportCours {
  id: number;
  titre: string;
  description: string;
  matiere: string;
  niveau: string;
  statut: 'BROUILLON' | 'SOUMIS' | 'VALIDÉ' | 'REJETÉ';
  fichierUrl: string;
  dateDepot: string;
  dateValidation?: string;
  remarqueDoyen?: string;
}

const ViewMaterialPage: React.FC = () => {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<SupportCours | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterial = async () => {
      if (!materialId) return;
      try {
        const response = await api.get<SupportCours>(`/campushub-support-service/api/supports/${materialId}`);
        setMaterial(response.data);
      } catch (err) {
        setError("Impossible de charger le support de cours.");
      } finally {
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [materialId]);

  const getStatusConfig = (status: SupportCours['statut']) => {
    const configs = {
      'VALIDÉ': { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800', label: 'Validé', icon: ShieldCheck },
      'BROUILLON': { color: 'text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700', label: 'Brouillon', icon: FileText },
      'SOUMIS': { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800', label: 'En attente', icon: Clock },
      'REJETÉ': { color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800', label: 'À corriger', icon: AlertCircle },
    };
    return configs[status] || configs['BROUILLON'];
  };

  const handleDownload = () => {
    if (material?.fichierUrl) {
      window.open(material.fichierUrl, '_blank');
      toast.success("Téléchargement démarré");
    }
  };

  if (loading) return (
    <div className="flex flex-col h-[70vh] items-center justify-center gap-4 animate-in fade-in duration-500">
      <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <p className="text-muted-foreground font-medium">Chargement du document...</p>
    </div>
  );

  if (error || !material) return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
      <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
        <AlertCircle size={32} />
      </div>
      <h2 className="text-xl font-bold mb-2">Support introuvable</h2>
      <p className="text-muted-foreground max-w-md mb-6">{error || "Nous n'avons pas pu charger ce support."}</p>
      <Button onClick={() => navigate(-1)} variant="outline" className="rounded-lg">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>
    </div>
  );

  const status = getStatusConfig(material.statut);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-lg hover:bg-muted" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{material.titre}</h1>
              <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider", status.color)}>
                <status.icon size={14} />
                {status.label}
              </div>
            </div>
            <p className="text-muted-foreground flex items-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-primary" /> {material.matiere}</span>
              <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-primary" /> {material.niveau}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-lg gap-2 h-10 font-semibold" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Télécharger
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-lg h-10 w-10">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem onClick={handleDownload} className="rounded-lg">
                <Download className="mr-2 h-4 w-4" /> Télécharger
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg">
                <Share2 className="mr-2 h-4 w-4" /> Partager
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg">
                <History className="mr-2 h-4 w-4" /> Historique
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview and Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-xl border-border/50 overflow-hidden shadow-sm">
            <div className="bg-muted/30 p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                <FileText className="h-4 w-4 text-primary" /> Aperçu du document
              </div>
              <Button variant="ghost" size="sm" className="h-8 rounded-lg" onClick={() => window.open(material.fichierUrl, '_blank')}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
            <CardContent className="p-0 bg-slate-50 dark:bg-slate-900/50">
              <div className="aspect-[16/9] md:aspect-auto md:h-[700px] w-full">
                <iframe 
                  src={`${material.fichierUrl}#toolbar=0`}
                  className="w-full h-full border-none"
                  title={material.titre}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed font-medium">
                {material.description || "Aucune description fournie pour ce support."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Status and Info */}
        <div className="space-y-6">
          {material.remarqueDoyen && (
            <Card className={cn(
              "rounded-xl overflow-hidden border-l-4 shadow-sm",
              material.statut === 'VALIDÉ' ? "border-l-emerald-500 border-border/50" : "border-l-rose-500 border-border/50"
            )}>
              <CardContent className="p-5 bg-muted/30">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-3 text-foreground">
                  <MessageSquare size={16} className={material.statut === 'VALIDÉ' ? "text-emerald-500" : "text-rose-500"} />
                  Retour pédagogique
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium italic">
                  "{material.remarqueDoyen}"
                </p>
                {material.dateValidation && (
                  <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 border-t border-border/10 pt-3 text-right">
                    Décidé le {new Date(material.dateValidation).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="rounded-xl border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-primary" /> Date de dépôt
                </span>
                <span className="text-sm font-bold">
                  {new Date(material.dateDepot).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                  <Clock className="h-4 w-4 text-primary" /> Statut
                </span>
                <div className={cn("px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase border", status.color)}>
                  {status.label}
                </div>
              </div>
              <div className="pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-primary mb-2 uppercase tracking-wider">
                  <AlertCircle className="h-4 w-4" /> Visibilité
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Visible par les étudiants une fois validé par le doyen de votre département.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewMaterialPage;
