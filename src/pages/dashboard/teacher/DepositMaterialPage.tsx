import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, ArrowLeft, BookOpen, GraduationCap, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from '@/lib/api';
import axios from 'axios';
import { decodeToken } from '@/lib/auth';
import { toast } from 'sonner';

const DepositMaterialPage: React.FC = () => {
  const navigate = useNavigate();
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [niveau, setNiveau] = useState('');
  const [matiere, setMatiere] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type !== 'application/pdf') {
        toast.error("Seuls les fichiers PDF sont acceptés.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!titre || !description || !niveau || !matiere || !selectedFile) {
      toast.error('Veuillez remplir tous les champs et sélectionner un fichier.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Authentification requise.");
      setLoading(false);
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded || !decoded.id) {
      toast.error("Session invalide.");
      setLoading(false);
      return;
    }

    try {
      // 1. Upload file to Cloudinary
      const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_upload_preset';

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', selectedFile);
      cloudinaryFormData.append('upload_preset', cloudinaryUploadPreset);

      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/upload`,
        cloudinaryFormData
      );

      const fichierUrl = cloudinaryResponse.data.secure_url;

      // 2. Submit data to backend
      const supportData = {
        titre,
        description,
        fichierUrl,
        niveau,
        matiere,
      };

      await api.post(`/campushub-support-service/api/supports`, supportData);
      toast.success("Support déposé avec succès !");
      navigate('/dashboard/teacher/support');
    } catch (err) {
      console.error('Erreur lors du dépôt du support:', err);
      toast.error('Erreur lors du dépôt du support. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Déposer un Support</h1>
            <p className="text-muted-foreground">Créez une nouvelle ressource pédagogique pour vos étudiants.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="rounded-xl border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/10">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Détails du document
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-6" id="deposit-form" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="titre" className="text-sm font-semibold">Titre du Support</Label>
                  <Input 
                    id="titre" 
                    placeholder="Ex: Algèbre Linéaire - Chapitre 1" 
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    className="rounded-lg border-border/50 h-11 focus:ring-primary shadow-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="matiere" className="text-sm font-semibold">Matière</Label>
                    <div className="relative group">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary" />
                      <Input 
                        id="matiere" 
                        placeholder="Ex: Mathématiques" 
                        value={matiere}
                        onChange={(e) => setMatiere(e.target.value)}
                        className="pl-10 rounded-lg border-border/50 h-11 focus:ring-primary shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="niveau" className="text-sm font-semibold">Niveau d'études</Label>
                    <Select onValueChange={setNiveau} required>
                      <SelectTrigger className="h-11 rounded-lg border-border/50 shadow-sm">
                        <SelectValue placeholder="Choisir un niveau" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="L1">Licence 1 (L1)</SelectItem>
                        <SelectItem value="L2">Licence 2 (L2)</SelectItem>
                        <SelectItem value="L3">Licence 3 (L3)</SelectItem>
                        <SelectItem value="M1">Master 1 (M1)</SelectItem>
                        <SelectItem value="M2">Master 2 (M2)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Résumez brièvement le contenu de ce support..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px] rounded-lg border-border/50 focus:ring-primary shadow-sm resize-none"
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="h-11 px-8 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-lg shadow-primary/20"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} /> Publier le support
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-xl border-border/50 shadow-sm overflow-hidden border-dashed border-2 bg-muted/5 group hover:bg-muted/10 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                <Upload size={16} /> Fichier Source
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-border/50 rounded-lg bg-background group-hover:border-primary/50 transition-all">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <FileText size={24} />
                  </div>
                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-foreground truncate max-w-[200px]">{selectedFile.name}</p>
                      <p className="text-[10px] text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-foreground">Sélectionner un PDF</p>
                      <p className="text-[10px] text-muted-foreground">Maximum 20MB</p>
                    </div>
                  )}
                </div>
                
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full rounded-lg h-10 font-bold border-border/50 group-hover:border-primary/50"
                >
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {selectedFile ? 'Changer de fichier' : 'Parcourir les fichiers'}
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/50 bg-primary/5 p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <AlertCircle size={18} />
              Important
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Une fois publié, votre support sera soumis à la validation du doyen de votre département avant d'être visible par les étudiants.
            </p>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4 font-medium">
              <li>Format PDF uniquement</li>
              <li>Contenu pédagogique vérifié</li>
              <li>Visible par les étudiants après validation</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DepositMaterialPage;
