import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, PencilLine, X, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const ProfilePage: React.FC = () => {
  // Données de profil simulées
  const initialProfileData = {
    fullName: "Alice Martin",
    username: "amartin",
    email: "alice.martin@campus.com",
    department: "Informatique",
    studentNumber: "2024-123",
  };

  const [profileData, setProfileData] = useState(initialProfileData);
  const [editableProfileData, setEditableProfileData] = useState(initialProfileData);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showSecuritySection, setShowSecuritySection] = useState(false);
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger l'image depuis localStorage au montage
  useEffect(() => {
    const storedImage = localStorage.getItem('userProfileImage');
    if (storedImage) {
      setProfileImage(storedImage);
    }
  }, []);

  const handleEditToggle = () => {
    if (isEditingProfile) {
      setEditableProfileData(profileData);
    }
    setIsEditingProfile(!isEditingProfile);
  };

  const handleSaveProfile = () => {
    setProfileData(editableProfileData);
    console.log("Saving profile:", editableProfileData);
    setIsEditingProfile(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableProfileData({ ...editableProfileData, [e.target.id]: e.target.value });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingImage(reader.result as string);
        setIsImageDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const confirmImageChange = () => {
      if (pendingImage) {
        setProfileImage(pendingImage);
        localStorage.setItem('userProfileImage', pendingImage);
        window.dispatchEvent(new Event('profileImageUpdated'));
      }
      setIsImageDialogOpen(false);
      setPendingImage(null);
  };
  
  const cancelImageChange = () => {
      setIsImageDialogOpen(false);
      setPendingImage(null);
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
                  {pendingImage && <img src={pendingImage} alt="Aperçu" className="max-h-64 rounded-full aspect-square object-cover" />}
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={cancelImageChange}>Annuler</Button>
                  <Button onClick={confirmImageChange}>Modifier la photo de profil</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mon Profil Étudiant</CardTitle>
            <CardDescription>Consultez et mettez à jour vos informations personnelles.</CardDescription>
          </div>
          {isEditingProfile ? (
            <div className="space-x-2">
              <Button variant="outline" onClick={handleEditToggle}>
                <X className="mr-2 h-4 w-4" /> Annuler
              </Button>
              <Button onClick={handleSaveProfile}>
                <Save className="mr-2 h-4 w-4" /> Enregistrer
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={handleEditToggle}>
              <PencilLine className="mr-2 h-4 w-4" /> Modifier
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <Avatar className="h-20 w-20 cursor-pointer" onClick={triggerFileInput}>
                {profileImage ? (
                  <AvatarImage src={profileImage} alt="Photo de profil" />
                ) : (
                  <AvatarFallback className="text-xl">
                    {profileData.fullName.split(' ').map(n => n[0]).join('')}
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
            <div>
              <h3 className="text-2xl font-bold">{profileData.fullName}</h3>
              <p className="text-md text-muted-foreground">Étudiant(e)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input id="fullName" value={editableProfileData.fullName} onChange={handleChange} readOnly={!isEditingProfile} />
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
              <Input id="department" value={editableProfileData.department} onChange={handleChange} readOnly={!isEditingProfile} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="studentNumber">Numéro d'étudiant</Label>
              <Input id="studentNumber" value={editableProfileData.studentNumber} readOnly />
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
    </div>
  );
};

export default ProfilePage;
