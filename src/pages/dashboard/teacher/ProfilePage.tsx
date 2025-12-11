import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, PencilLine, X, Camera, Loader2, Info, Eye as EyeIcon, Trash2, LogOut, KeyRound } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import api from '@/lib/api';
import axios from 'axios';
import { decodeToken } from '@/lib/auth';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';


// Interface for the user profile data from the backend
interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  email: string;
  department: string;
  profilePictureUrl?: string; // Optional as it might not be set
  officeNumber?: string; // Specific to Teacher/Dean
  grade?: string; // Specific to Teacher
  role: string; // To differentiate between roles if needed
}

const TeacherProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [editableProfileData, setEditableProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [isImageUploadConfirmDialogOpen, setIsImageUploadConfirmDialogOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);

  // Account deletion states
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [deleteConfirmationPassword, setDeleteConfirmationPassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);


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
          localStorage.setItem('userProfileImage', fetchedData.profilePictureUrl);
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
      // Filter out unchanged fields to send a partial update
      const updatedFields: Partial<UserProfile> = {};
      for (const key in editableProfileData) {
        if (
          Object.prototype.hasOwnProperty.call(editableProfileData, key) &&
          (editableProfileData as any)[key] !== (profileData as any)[key] &&
          key !== 'id' && key !== 'username' && key !== 'email' // These fields are not typically changed via this UI
        ) {
          (updatedFields as any)[key] = (editableProfileData as any)[key];
        }
      }

      if (Object.keys(updatedFields).length > 0) {
        const response = await api.put<UserProfile>(`/campushub-user-service/api/users/${profileData.id}`, updatedFields, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(response.data);
        setEditableProfileData(response.data);
        toast.success("Profil mis à jour avec succès !");
      } else {
        toast.info("Aucune modification à enregistrer.");
      }
      setIsEditingProfile(false);

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
      setIsImageUploadConfirmDialogOpen(true); // Open confirmation dialog
    }
  };

  const confirmImageChange = async () => {
    if (!pendingImageFile || !profileData) return;

    setIsUploadingImage(true);
    const token = localStorage.getItem('token');

    try {
      const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_profile_pictures';

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
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const newProfilePictureUrl = cloudinaryResponse.data.secure_url;

      await api.put<UserProfile>(
        `/campushub-user-service/api/users/${profileData.id}`,
        { profilePictureUrl: newProfilePictureUrl },
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
      setIsImageUploadConfirmDialogOpen(false);
      setPendingImageFile(null);
      setIsUploadingImage(false);
    }
  };

  const removeProfilePicture = async () => {
    if (!profileData) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
        await api.put<UserProfile>(
            `/campushub-user-service/api/users/${profileData.id}`,
            { profilePictureUrl: null }, // Set to null to remove
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfileImage(null);
        setProfileData(prev => prev ? { ...prev, profilePictureUrl: undefined } : null);
        setEditableProfileData(prev => prev ? { ...prev, profilePictureUrl: undefined } : null);
        localStorage.removeItem('userProfileImage');
        window.dispatchEvent(new Event('profileImageUpdated'));
        toast.success("Photo de profil supprimée !");
    } catch (err) {
        console.error('Error removing profile picture:', err);
        toast.error("Échec de la suppression de la photo de profil.");
    } finally {
        setLoading(false);
    }
  };

  const cancelImageChange = () => {
    setIsImageUploadConfirmDialogOpen(false);
    setPendingImageFile(null);
    setProfileImage(profileData?.profilePictureUrl || null); // Revert preview to current
    if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);
    if (!newPassword || !confirmNewPassword || !currentPassword) {
      setPasswordChangeError("Veuillez remplir tous les champs du mot de passe.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
      return;
    }
    if (newPassword.length < 6) { // Example minimum length
        setPasswordChangeError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
        return;
    }

    setIsChangingPassword(true);
    const token = localStorage.getItem('token');
    if (!profileData) return;

    try {
      // This requires a new backend endpoint or modification to /api/users/{id} PUT
      // For now, assuming an endpoint like /api/users/change-password
      await api.put(
        `/campushub-user-service/api/users/${profileData.id}/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Mot de passe mis à jour avec succès !");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      console.error('Error changing password:', err);
      setPasswordChangeError(err.response?.data?.message || "Échec de la mise à jour du mot de passe.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!profileData || !deleteConfirmationPassword) return;

    setIsDeletingAccount(true);
    setDeleteAccountError(null);
    const token = localStorage.getItem('token');

    try {
      // This requires a new backend endpoint
      // For now, assuming an endpoint like /api/users/{id}/delete-account-confirm
      await api.post(
        `/campushub-user-service/api/users/${profileData.id}/delete-account-confirm`,
        { password: deleteConfirmationPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Votre compte a été supprimé avec succès.");
      // Perform logout actions
      localStorage.clear();
      navigate('/signin');
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setDeleteAccountError(err.response?.data?.message || "Échec de la suppression du compte. Le mot de passe est-il correct ?");
    } finally {
      setIsDeletingAccount(false);
    }
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
      <Dialog open={isImageUploadConfirmDialogOpen} onOpenChange={setIsImageUploadConfirmDialogOpen}>
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

      {/* Dialog for Delete Account Confirmation */}
      <Dialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer votre compte ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes vos données seront définitivement supprimées. Pour confirmer, veuillez entrer votre mot de passe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label htmlFor="deletePasswordConfirm">Mot de passe</Label>
            <Input
              id="deletePasswordConfirm"
              type="password"
              value={deleteConfirmationPassword}
              onChange={(e) => setDeleteConfirmationPassword(e.target.value)}
              disabled={isDeletingAccount}
            />
            {deleteAccountError && <p className="text-destructive text-sm">{deleteAccountError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAccountDialogOpen(false)} disabled={isDeletingAccount}>Annuler</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeletingAccount || !deleteConfirmationPassword}>
              {isDeletingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer mon compte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Card>
        <CardHeader>
          <CardTitle>Mon Profil Enseignant</CardTitle>
          <CardDescription>Consultez et mettez à jour vos informations professionnelles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative group cursor-pointer">
                  <Avatar className="h-28 w-28">
                    {profileImage ? (
                      <AvatarImage src={profileImage} alt="Photo de profil" />
                    ) : (
                      <AvatarFallback className="text-4xl">
                        {getInitials(profileData.fullName)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-7 w-7 text-white" />
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>Photo de profil</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.open(profileImage || 'about:blank', '_blank')} disabled={!profileImage}>
                  <EyeIcon className="mr-2 h-4 w-4" /> Voir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={triggerFileInput}>
                  <Camera className="mr-2 h-4 w-4" /> Changer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={removeProfilePicture} disabled={!profileImage}>
                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageSelect}
            />

            <div className="text-center sm:text-left">
              <h3 className="text-3xl font-bold">{profileData.fullName}</h3>
              <p className="text-lg text-muted-foreground">{profileData.grade}</p>
              <p className="text-sm text-muted-foreground">{profileData.department}</p>
            </div>
          </div>
          
          <Tabs defaultValue="personal" className="mt-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Informations Personnelles</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
              <TabsTrigger value="account">Gestion du Compte</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Détails du Profil</CardTitle>
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
                <CardContent className="space-y-4">
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
            </TabsContent>

            <TabsContent value="security" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Changer le mot de passe</CardTitle>
                  <CardDescription>Mettez à jour votre mot de passe régulièrement pour la sécurité de votre compte.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                      <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                      <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe</Label>
                      <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
                    </div>
                    {passwordChangeError && <p className="text-destructive text-sm">{passwordChangeError}</p>}
                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Changer le mot de passe
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion du Compte</CardTitle>
                  <CardDescription>Options avancées de gestion de compte.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Déconnexion</h4>
                        <p className="text-sm text-muted-foreground mb-4">Déconnectez-vous de votre compte CampusHub.</p>
                        <Button variant="outline" onClick={() => { localStorage.clear(); navigate('/signin'); }}>
                            <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                        </Button>
                    </div>
                    <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold text-lg mb-2 text-destructive">Supprimer le Compte</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            Cette action est irréversible et supprimera définitivement votre compte et toutes les données associées.
                        </p>
                        <Button variant="destructive" onClick={() => setIsDeleteAccountDialogOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer mon compte
                        </Button>
                    </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TeacherProfilePage;