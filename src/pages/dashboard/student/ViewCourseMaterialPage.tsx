import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  ArrowLeft, 
  Calendar, 
  FileText, 
  BookOpen,
  GraduationCap,
  Maximize2,
  Share2,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface SupportCours {
  id: number;
  titre: string;
  description: string;
  matiere: string;
  niveau: string;
  statut: string;
  fichierUrl: string;
  dateDepot: string;
}

const StudentViewMaterialPage: React.FC = () => {
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

  const handleDownload = () => {
    if (material?.fichierUrl) {
      window.open(material.fichierUrl, '_blank');
      toast.success("Téléchargement démarré");
    }
  };

  if (loading) return (
    <div className="flex flex-col h-[70vh] items-center justify-center gap-4 animate-in fade-in duration-500">
      <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <p className="text-muted-foreground font-medium">Chargement du cours...</p>
    </div>
  );

  if (error || !material) return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
      <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
        <AlertCircle size={32} />
      </div>
      <h2 className="text-xl font-bold mb-2">Cours introuvable</h2>
      <p className="text-muted-foreground max-w-md mb-6">{error || "Nous n'avons pas pu charger ce support."}</p>
      <Button onClick={() => navigate(-1)} variant="outline" className="rounded-lg">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour au catalogue
      </Button>
    </div>
  );

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
            <h1 className="text-2xl font-bold tracking-tight">{material.titre}</h1>
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
          <Button variant="ghost" size="icon" className="rounded-lg h-10 w-10">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview and Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-xl border-border/50 overflow-hidden shadow-sm">
            <div className="bg-muted/30 p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                <FileText className="h-4 w-4 text-primary" /> Lecteur de document
              </div>
              <Button variant="ghost" size="sm" className="h-8 rounded-lg" onClick={() => window.open(material.fichierUrl, '_blank')}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
            <CardContent className="p-0 bg-slate-50 dark:bg-slate-900/50">
              <div className="aspect-[16/9] md:aspect-auto md:h-[750px] w-full">
                <iframe 
                  src={`${material.fichierUrl}#toolbar=0`}
                  className="w-full h-full border-none"
                  title={material.titre}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Info */}
        <div className="space-y-6">
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

          <Card className="rounded-xl border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Détails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-primary" /> Mis en ligne le
                </span>
                <span className="text-sm font-bold">
                  {new Date(material.dateDepot).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                  <BookOpen className="h-4 w-4 text-primary" /> Matière
                </span>
                <span className="text-sm font-bold">{material.matiere}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                  <GraduationCap className="h-4 w-4 text-primary" /> Niveau
                </span>
                <Badge variant="secondary" className="rounded-lg">{material.niveau}</Badge>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground leading-relaxed font-medium italic">
                  Ce support est mis à disposition par la faculté pour votre usage pédagogique personnel.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentViewMaterialPage;
