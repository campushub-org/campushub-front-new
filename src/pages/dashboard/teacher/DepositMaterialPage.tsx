import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';
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

import { SupportCours } from './SupportPage'; 

const DepositMaterialPage: React.FC = () => {
  const navigate = useNavigate();
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [niveau, setNiveau] = useState('');
  const [matiere, setMatiere] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!titre || !description || !niveau || !matiere || !selectedFile) {
      setError('Veuillez remplir tous les champs et sélectionner un fichier.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentification requise.");
      setLoading(false);
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded || !decoded.id) {
      setError("Impossible de récupérer les informations de l'utilisateur depuis le token.");
      setLoading(false);
      return;
    }
    const enseignantId = decoded.id;

    try {
      // 1. Upload file to Cloudinary
      const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_upload_preset'; // Define an unsigned upload preset in Cloudinary

      if (!cloudinaryCloudName) {
        setError("Configuration Cloudinary manquante: Cloud Name.");
        setLoading(false);
        return;
      }

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', selectedFile);
      cloudinaryFormData.append('upload_preset', cloudinaryUploadPreset);
      cloudinaryFormData.append('cloud_name', cloudinaryCloudName);
      // Optional: Add tags, folder, etc.
      // cloudinaryFormData.append('folder', 'course_materials');

      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/upload`,
        cloudinaryFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const fichierUrl = cloudinaryResponse.data.secure_url;

      // 2. Submit data to backend
      const supportData = {
        titre,
        description,
        fichierUrl, // Cloudinary URL
        niveau,
        matiere,
      };

      await api.post(`/campushub-support-service/api/supports`, supportData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate('/dashboard/teacher/support');
    } catch (err) {
      console.error('Erreur lors du dépôt du support:', err);
      setError('Erreur lors du dépôt du support. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Déposer un Support de Cours</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <Label htmlFor="titre">Titre du Support</Label>
            <Input 
              id="titre" 
              placeholder="Ex: Algèbre Linéaire - Chapitre 1" 
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Courte description du contenu du support..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="niveau">Niveau</Label>
            <Select onValueChange={setNiveau} value={niveau} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L1">L1</SelectItem>
                <SelectItem value="L2">L2</SelectItem>
                <SelectItem value="L3">L3</SelectItem>
                <SelectItem value="M1">M1</SelectItem>
                <SelectItem value="M2">M2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="matiere">Matière</Label>
            <Input 
              id="matiere" 
              placeholder="Ex: Mathématiques I" 
              value={matiere}
              onChange={(e) => setMatiere(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="file">Fichier du Support</Label>
            <Input id="file" type="file" onChange={handleFileChange} required />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Dépôt en cours...' : 'Déposer comme Brouillon'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DepositMaterialPage;
