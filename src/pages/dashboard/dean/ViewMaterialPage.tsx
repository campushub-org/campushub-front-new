import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  MoreVertical,
  Share2,
  History
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

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

const DeanViewMaterialPage: React.FC = () => {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<SupportCours | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remarque, setRemarque] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchMaterial = async () => {
      if (!materialId) return;
      try {
        const response = await api.get<SupportCours>(`/campushub-support-service/api/supports/${materialId}`);
        setMaterial(response.data);
        setRemarque(response.data.remarqueDoyen || '');
      } catch (err) {
        setError("Impossible de charger le support de cours.");
      } finally {
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [materialId]);

  const handleAction = async (newStatus: 'VALIDÉ' | 'REJETÉ') => {
    if (!material) return;
    setIsProcessing(true);
    try {
      const endpoint = newStatus === 'VALIDÉ' ? 'validate' : 'reject';
      // The backend expects a simple string for the remark in the body
      const response = await api.post<SupportCours>(
        `/campushub-support-service/api/supports/${material.id}/${endpoint}`,
        remarque,
        {
          headers: {
            'Content-Type': 'text/plain'
          }
        }
      );
      setMaterial(response.data);
      toast.success(newStatus === 'VALIDÉ' ? "Support validé avec succès" : "Support rejeté");
    } catch (err: any) {
      console.error("Erreur lors de la validation:", err);
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour du statut.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusConfig = (status: SupportCours['statut']) => {
    const configs = {
      'VALIDÉ': { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800', label: 'Validé', icon: ShieldCheck },
      'BROUILLON': { color: 'text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700', label: 'Brouillon', icon: FileText },
      'SOUMIS': { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800', label: 'À Valider', icon: Clock },
      'REJETÉ': { color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800', label: 'Rejeté', icon: XCircle },
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
      <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <p className="text-muted-foreground font-medium">Chargement du dossier de validation...</p>
    </div>
  );

  if (error || !material) return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
      <div className="h-20 w-20 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive mb-6">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Erreur de chargement</h2>
      <p className="text-muted-foreground max-w-md mb-8">{error || "Support introuvable."}</p>
      <Button onClick={() => navigate(-1)} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>
    </div>
  );

  const status = getStatusConfig(material.statut);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50">
        <div className="flex items-center gap-5">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{material.titre}</h1>
              <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider", status.color)}>
                <status.icon size={14} />
                {status.label}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground font-medium">
              <span className="flex items-center gap-2"><BookOpen size={16} className="text-primary" /> {material.matiere}</span>
              <span className="flex items-center gap-2"><GraduationCap size={16} className="text-primary" /> {material.niveau}</span>
              <span className="flex items-center gap-2"><Calendar size={16} className="text-primary" /> {new Date(material.dateDepot).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="lg" className="rounded-xl font-bold gap-2" onClick={handleDownload}>
            <Download size={18} />
            Télécharger
          </Button>
          <Button size="lg" className="rounded-xl font-bold shadow-glow gap-2" onClick={() => window.open(material.fichierUrl, '_blank')}>
            <ExternalLink size={18} />
            Plein écran
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <MoreVertical size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl">
              <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer"><Share2 size={16} /> Partager</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer"><History size={16} /> Historique</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Viewer */}
        <div className="lg:col-span-8 space-y-6">
          <Card className={cn(
            "overflow-hidden border-border/50 bg-slate-50 dark:bg-slate-900/50 transition-all duration-500",
            isFullscreen ? "fixed inset-0 z-50 rounded-none" : "rounded-[24px] shadow-soft"
          )}>
            <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FileText size={18} />
                </div>
                <span className="font-bold text-sm tracking-tight truncate max-w-[300px]">{material.titre}.pdf</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg" 
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize2 size={16} />
              </Button>
            </div>
            <CardContent className="p-0">
              {material.fichierUrl ? (
                <div className={cn(
                  "relative w-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center",
                  isFullscreen ? "h-screen" : "h-[750px]"
                )}>
                  <iframe 
                    src={`${material.fichierUrl}#toolbar=0&navpanes=0`} 
                    className="w-full h-full border-0"
                    title={`Visualisation de ${material.titre}`}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center px-6">
                  <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground mb-6">
                    <FileText size={40} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Document indisponible</h3>
                  <p className="text-muted-foreground max-w-sm">Le fichier n'est pas encore disponible pour la prévisualisation.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Validation & Metadata */}
        <div className="lg:col-span-4 space-y-6">
          {/* Validation Panel - Affiché uniquement pour les supports SOUMIS */}
          {material.statut === 'SOUMIS' && (
            <Card className="rounded-[24px] border-border/50 shadow-soft overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-b border-border/50">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShieldCheck size={20} className="text-primary" />
                  Panel de Validation
                </h3>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Commentaires / Remarques</Label>
                  <Textarea 
                    placeholder="Inscrivez vos remarques pédagogiques ici..." 
                    className="min-h-[150px] rounded-xl border-border/50 bg-slate-50 dark:bg-slate-800 focus:ring-primary/20 resize-none font-medium text-sm"
                    value={remarque}
                    onChange={(e) => setRemarque(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-12 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-bold gap-2"
                    onClick={() => handleAction('REJETÉ')}
                    disabled={isProcessing}
                  >
                    <XCircle size={18} /> Rejeter
                  </Button>
                  <Button 
                    className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-lg shadow-emerald-600/20"
                    onClick={() => handleAction('VALIDÉ')}
                    disabled={isProcessing}
                  >
                    <CheckCircle2 size={18} /> Valider
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historique des remarques - Affiché pour VALIDÉ ou REJETÉ s'il y a une remarque */}
          {(material.statut === 'VALIDÉ' || material.statut === 'REJETÉ') && material.remarqueDoyen && (
            <Card className={cn(
              "rounded-[24px] overflow-hidden border-l-4 shadow-soft animate-in zoom-in-95 duration-500",
              material.statut === 'VALIDÉ' ? "border-l-emerald-500 border-border/50" : "border-l-rose-500 border-border/50"
            )}>
              <div className="p-6 bg-muted/30">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <MessageSquare size={20} className={material.statut === 'VALIDÉ' ? "text-emerald-500" : "text-rose-500"} />
                  Retour pédagogique
                </h3>
                <div className="relative">
                  <div className="absolute -left-1 top-0 h-full w-0.5 bg-border/50" />
                  <p className="pl-4 italic text-sm text-muted-foreground leading-relaxed">
                    "{material.remarqueDoyen}"
                  </p>
                </div>
                {material.dateValidation && (
                  <div className="mt-6 pt-4 border-t border-border/20 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Décision rendue le</span>
                    <span>{new Date(material.dateValidation).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Description Card */}
          <Card className="rounded-[24px] border-border/50 shadow-soft overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-b border-border/50">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <BookOpen size={20} className="text-primary" />
                Détails du support
              </h3>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</Label>
                <p className="text-sm leading-relaxed text-foreground/80 font-medium">
                  {material.description || "Aucune description détaillée n'a été fournie pour ce support de cours."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Matière</Label>
                  <p className="text-sm font-bold">{material.matiere}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Niveau</Label>
                  <p className="text-sm font-bold">{material.niveau}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Help Card */}
          <Card className="rounded-[24px] border-border/50 bg-primary/5 dark:bg-primary/10 p-6 relative overflow-hidden group border-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-primary">
                <AlertCircle size={18} />
                Besoin d'aide ?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Si vous rencontrez un problème lors de la validation ou de la lecture du support, contactez le support académique.
              </p>
              <Button variant="outline" size="sm" className="w-full rounded-xl font-bold bg-white/50 dark:bg-slate-900/50 border-primary/20 hover:bg-primary hover:text-white transition-all duration-300">
                Contacter le support
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeanViewMaterialPage;
