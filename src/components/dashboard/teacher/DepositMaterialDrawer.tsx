import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Loader2, CheckCircle2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import api from '@/lib/api';
import axios from 'axios';
import { decodeToken } from '@/lib/auth';
import { toast } from 'sonner';

interface DepositMaterialDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const DepositMaterialDrawer: React.FC<DepositMaterialDrawerProps> = ({ open, onOpenChange, onSuccess }) => {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [niveau, setNiveau] = useState('');
  const [matiere, setMatiere] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const resetForm = () => {
    setTitre('');
    setDescription('');
    setNiveau('');
    setMatiere('');
    setSelectedFile(null);
    setIsSuccess(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Authentification requise");
      setLoading(false);
      return;
    }

    try {
      // 1. Upload file to Cloudinary
      const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_course_materials';

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', selectedFile!);
      cloudinaryFormData.append('upload_preset', cloudinaryUploadPreset);

      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/upload`,
        cloudinaryFormData
      );

      const fichierUrl = cloudinaryResponse.data.secure_url;

      // 2. Submit to backend
      await api.post(`/campushub-support-service/api/supports`, {
        titre,
        description,
        fichierUrl,
        niveau,
        matiere,
      });

      setIsSuccess(true);
      toast.success("Support déposé avec succès !");
      
      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 1500);

    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du dépôt du support");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-1">
          <SheetTitle className="text-2xl font-bold">Nouveau Support</SheetTitle>
          <SheetDescription>
            Remplissez les informations pour publier un nouveau support de cours.
          </SheetDescription>
        </SheetHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in zoom-in duration-300">
            <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-xl font-semibold">Publication réussie !</h3>
            <p className="text-muted-foreground text-center">Votre document est maintenant en attente de validation.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="titre" className="text-sm font-semibold">Titre du Support</Label>
              <Input 
                id="titre" 
                placeholder="Ex: Algèbre Linéaire - Chapitre 1" 
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                required
                className="focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Décrivez brièvement le contenu..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="min-h-[100px] resize-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="niveau" className="text-sm font-semibold">Niveau</Label>
                <Select onValueChange={setNiveau} value={niveau} required>
                  <SelectTrigger className="focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {['L1', 'L2', 'L3', 'M1', 'M2'].map(lv => (
                      <SelectItem key={lv} value={lv}>{lv}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="matiere" className="text-sm font-semibold">Matière</Label>
                <Input 
                  id="matiere" 
                  placeholder="Ex: Mathématiques I" 
                  value={matiere}
                  onChange={(e) => setMatiere(e.target.value)}
                  required
                  className="focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Fichier du Support</Label>
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 hover:bg-muted/50 transition-colors group cursor-pointer relative">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  required
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Upload size={20} />
                  </div>
                  <p className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : "Cliquez ou glissez un fichier"}
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, DOCX, ZIP (Max 10MB)</p>
                </div>
              </div>
            </div>

            <SheetFooter className="pt-4 gap-2 flex-col sm:flex-row">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  "Publier le support"
                )}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default DepositMaterialDrawer;
