import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, PencilLine, X, Camera, Loader2, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import api from '@/lib/api';
import axios from 'axios';
import { decodeToken } from '@/lib/auth';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Interface for the user profile data from the backend
interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  email: string;
  department: string;
  profilePictureUrl?: string; // Optional as it might not be set
  officeNumber?: string; // Specific to Teacher/Dean
  grade?: string; // Specific to Teacher/Dean
  role: string; // To differentiate between roles if needed
}

const DeanProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [editableProfileData, setEditableProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showSecuritySection, setShowSecuritySection] = useState(false);
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null); // Use File object
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
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
      const userId = decoded.id;

      try {
        const response = await api.get<UserProfile>(`/campushub-user-service/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fetchedData = response.data;
        setProfileData(fetchedData);
        setEditableProfileData(fetchedData);
        if (fetchedData.profilePictureUrl) {
          setProfileImage(fetchedData.profilePictureUrl);
          localStorage.setItem('userProfileImage', fetchedData.profilePictureUrl); // Update localStorage for Header
          window.dispatchEvent(new Event('profileImageUpdated'));
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError("Impossible de charger le profil.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    if (isEditingProfile) {
      setEditableProfileData(profileData); // Reset changes if cancelling
    }
    setIsEditingProfile(!isEditingProfile);
  };

  const handleSaveProfile = async () => {
    if (!editableProfileData || !profileData) return;

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await api.put<UserProfile>(`/campushub-user-service/api/users/${profileData.id}`, editableProfileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(response.data);
      setEditableProfileData(response.data);
      setIsEditingProfile(false);
      toast.success("Profil mis à jour avec succès !");
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error("Échec de la mise à jour du profil. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editableProfileData) {
      setEditableProfileData({ ...editableProfileData, [e.target.id]: e.target.value });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPendingImageFile(e.target.files[0]); // Store the File object
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string); // Set preview image
        setIsImageDialogOpen(true);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const confirmImageChange = async () => {
    if (!pendingImageFile || !profileData) return;

    setIsUploadingImage(true);
    const token = localStorage.getItem('token');

    try {
      // 1. Upload file to Cloudinary
      const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_profile_pictures'; // Use a specific preset for profile pictures

      if (!cloudinaryCloudName) {
        toast.error("Configuration Cloudinary manquante: Cloud Name.");
        setIsUploadingImage(false);
        return;
      }

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', pendingImageFile);
      cloudinaryFormData.append('upload_preset', cloudinaryUploadPreset);
      cloudinaryFormData.append('cloud_name', cloudinaryCloudName);
      
      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/upload`,
        cloudinaryFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const newProfilePictureUrl = cloudinaryResponse.data.secure_url;

      // 2. Update user profile with new URL
      await api.put<UserProfile>(
        `/campushub-user-service/api/users/${profileData.id}`,
        { profilePictureUrl: newProfilePictureUrl }, // Only send the changed field
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfileImage(newProfilePictureUrl);
      setProfileData(prev => prev ? { ...prev, profilePictureUrl: newProfilePictureUrl } : null);
      setEditableProfileData(prev => prev ? { ...prev, profilePictureUrl: newProfilePictureUrl } : null);
      localStorage.setItem('userProfileImage', newProfilePictureUrl);
      window.dispatchEvent(new Event('profileImageUpdated'));
      toast.success("Photo de profil mise à jour avec succès !");

    } catch (err) {
      console.error('Error uploading profile picture:', err);
      toast.error("Échec du téléversement de la photo de profil. Veuillez réessayer.");
    } finally {
      setIsImageDialogOpen(false);
      setPendingImageFile(null);
      setIsUploadingImage(false);
    }
  };

  const cancelImageChange = () => {
    setIsImageDialogOpen(false);
    setPendingImageFile(null);
    setProfileImage(profileData?.profilePictureUrl || null); // Revert preview
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return <Card><CardContent>Chargement du profil...</CardContent></Card>;
  }

  if (error) {
    return <Card><CardContent className="text-red-500">{error}</CardContent></Card>;
  }

  if (!profileData || !editableProfileData) {
    return <Card><CardContent>Profil non trouvé.</CardContent></Card>;
  }

  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Dialog for Image Confirmation */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Confirmer la nouvelle photo de profil ?</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center p-4">
                  {pendingImageFile && <img src={URL.createObjectURL(pendingImageFile)} alt="Aperçu" className="max-h-64 rounded-full aspect-square object-cover" />}
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={cancelImageChange} disabled={isUploadingImage}>Annuler</Button>
                  <Button onClick={confirmImageChange} disabled={isUploadingImage}>
                    {isUploadingImage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Modifier la photo de profil
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mon Profil Doyen</CardTitle>
            <CardDescription>Consultez et mettez à jour vos informations professionnelles.</CardDescription>
          </div>
          {isEditingProfile ? (
            <div className="space-x-2">
              <Button variant="outline" onClick={handleEditToggle} disabled={loading}>
                <X className="mr-2 h-4 w-4" /> Annuler
              </Button>
              <Button onClick={handleSaveProfile} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Enregistrer
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={handleEditToggle} disabled={loading}>
              <PencilLine className="mr-2 h-4 w-4" /> Modifier
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative group">
              <Avatar className="h-24 w-24 cursor-pointer" onClick={triggerFileInput}>
                {profileImage ? (
                  <AvatarImage src={profileImage} alt="Photo de profil" />
                ) : (
                  <AvatarFallback className="text-3xl">
                    {getInitials(profileData.fullName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={triggerFileInput}>
                <Camera className="h-6 w-6 text-white" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
              />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold">{profileData.fullName}</h3>
              <p className="text-md text-muted-foreground">{profileData.grade}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input id="fullName" value={editableProfileData.fullName || ''} onChange={handleChange} readOnly={!isEditingProfile} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input id="username" value={editableProfileData.username} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={editableProfileData.email} onChange={handleChange} readOnly={!isEditingProfile} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Département</Label>
              <Input id="department" value={editableProfileData.department || ''} onChange={handleChange} readOnly={!isEditingProfile} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="officeNumber">Numéro de bureau</Label>
              <Input id="officeNumber" value={editableProfileData.officeNumber || ''} onChange={handleChange} readOnly={!isEditingProfile} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="grade">Grade / Titre</Label>
              <Input id="grade" value={editableProfileData.grade || ''} onChange={handleChange} readOnly={!isEditingProfile} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sécurité</CardTitle>
          <CardDescription>Gérez votre mot de passe.</CardDescription>
            <Button variant="outline" onClick={() => setShowSecuritySection(!showSecuritySection)}>
                {showSecuritySection ? 'Masquer la section' : 'Modifier mot de passe'}
            </Button>
        </CardHeader>
        {showSecuritySection && (
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                    <Input id="confirmPassword" type="password" />
                </div>
                <Button variant="destructive">Changer le mot de passe</Button>
            </CardContent>
        )}
      </Card>

      {error && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DeanProfilePage;