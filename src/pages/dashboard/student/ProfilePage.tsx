import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Save, 
  PencilLine, 
  X, 
  Camera, 
  Loader2, 
  Info, 
  Trash2, 
  LogOut, 
  KeyRound,
  User,
  Settings,
  ShieldCheck,
  Moon,
  Sun,
  Monitor,
  GraduationCap,
  Eye,
  EyeOff
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import api from '@/lib/api';
import axios from 'axios';
import { decodeToken } from '@/lib/auth';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  email: string;
  department: string;
  profilePictureUrl?: string;
  studentNumber?: string;
  role: string;
}

const StudentProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
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
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [deleteConfirmationPassword, setDeleteConfirmationPassword] = useState('');
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

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
        setError("Token invalide.");
        setLoading(false);
        return;
      }
      const userId = decoded.id;

      try {
        const response = await api.get<UserProfile>(`/campushub-user-service/api/users/${userId}`);
        const fetchedData = response.data;
        setProfileData(fetchedData);
        setEditableProfileData(fetchedData);
        if (fetchedData.profilePictureUrl) {
          setProfileImage(fetchedData.profilePictureUrl);
        }
      } catch (err) {
        console.error(err);
        setError("Impossible de charger le profil.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    if (isEditingProfile) {
      setEditableProfileData(profileData);
    }
    setIsEditingProfile(!isEditingProfile);
  };

  const handleSaveProfile = async () => {
    if (!editableProfileData || !profileData) return;
    setLoading(true);
    try {
      const response = await api.put<UserProfile>(`/campushub-user-service/api/users/${profileData.id}`, editableProfileData);
      setProfileData(response.data);
      setEditableProfileData(response.data);
      toast.success("Profil mis à jour !");
      setIsEditingProfile(false);
    } catch (err) {
      toast.error("Échec de la mise à jour.");
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
      setPendingImageFile(e.target.files[0]);
      setIsImageUploadConfirmDialogOpen(true);
    }
  };

  const confirmImageChange = async () => {
    if (!pendingImageFile || !profileData) return;
    setIsUploadingImage(true);
    try {
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', pendingImageFile);
      cloudinaryFormData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_profile_pictures');
      
      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
        cloudinaryFormData
      );

      const newProfilePictureUrl = cloudinaryResponse.data.secure_url;
      await api.put(`/campushub-user-service/api/users/${profileData.id}`, { profilePictureUrl: newProfilePictureUrl });

      setProfileImage(newProfilePictureUrl);
      setProfileData(prev => prev ? { ...prev, profilePictureUrl: newProfilePictureUrl } : null);
      localStorage.setItem('userProfileImage', newProfilePictureUrl);
      window.dispatchEvent(new Event('profileImageUpdated'));
      toast.success("Photo mise à jour !");
    } catch (err) {
      toast.error("Erreur de téléversement.");
    } finally {
      setIsImageUploadConfirmDialogOpen(false);
      setPendingImageFile(null);
      setIsUploadingImage(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError("Les mots de passe ne correspondent pas.");
      return;
    }
    setIsChangingPassword(true);
    try {
      await api.put(`/campushub-user-service/api/users/${profileData?.id}/change-password`, { currentPassword, newPassword });
      toast.success("Mot de passe mis à jour !");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPasswordChangeError(err.response?.data?.message || "Erreur.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading && !profileData) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error) return <Alert variant="destructive"><AlertTitle>Erreur</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
  if (!profileData) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header avec Avatar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-border/50 p-8">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl ring-1 ring-border/50">
              <AvatarImage src={profileImage || ''} className="object-cover" />
              <AvatarFallback className="text-4xl bg-primary/5 text-primary font-bold">
                {profileData.fullName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 h-10 w-10 bg-primary text-primary-foreground rounded-full border-4 border-background shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Camera size={18} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
          </div>

          <div className="text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{profileData.fullName}</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">
                Étudiant
              </Badge>
            </div>
            <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {profileData.email}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-sm bg-background/50 px-3 py-1 rounded-full border border-border/50">
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">{profileData.department}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm bg-background/50 px-3 py-1 rounded-full border border-border/50">
                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">N° {profileData.studentNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full justify-start bg-transparent h-auto p-0 border-b border-border/50 rounded-none mb-8 gap-8">
          <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 text-sm font-semibold transition-all">
            Mon Profil
          </TabsTrigger>
          <TabsTrigger value="preferences" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 text-sm font-semibold transition-all">
            Préférences
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 text-sm font-semibold transition-all">
            Sécurité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
              <div>
                <CardTitle className="text-xl">Informations personnelles</CardTitle>
                <CardDescription>Gérez vos informations de scolarité.</CardDescription>
              </div>
              <Button 
                variant={isEditingProfile ? "default" : "outline"} 
                onClick={isEditingProfile ? handleSaveProfile : handleEditToggle}
                className="gap-2"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditingProfile ? <Save size={16} /> : <PencilLine size={16} />}
                {isEditingProfile ? "Enregistrer" : "Modifier"}
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold">Nom complet</Label>
                  <Input 
                    id="fullName" 
                    value={editableProfileData?.fullName} 
                    onChange={handleChange} 
                    readOnly={!isEditingProfile} 
                    className={cn("h-11 border-border/50", !isEditingProfile && "bg-muted/30 focus-visible:ring-0")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-semibold">Nom d'utilisateur</Label>
                  <Input id="username" value={profileData.username} readOnly className="h-11 bg-muted/30 border-border/50 focus-visible:ring-0 opacity-70" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email institutionnel</Label>
                  <Input id="email" type="email" value={editableProfileData?.email} onChange={handleChange} readOnly={!isEditingProfile} className={cn("h-11 border-border/50", !isEditingProfile && "bg-muted/30 focus-visible:ring-0")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-semibold">Filière / Département</Label>
                  <Input id="department" value={editableProfileData?.department} onChange={handleChange} readOnly={!isEditingProfile} className={cn("h-11 border-border/50", !isEditingProfile && "bg-muted/30 focus-visible:ring-0")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentNumber" className="text-sm font-semibold">Numéro d'étudiant</Label>
                  <Input id="studentNumber" value={profileData.studentNumber} readOnly className="h-11 bg-muted/30 border-border/50 focus-visible:ring-0 opacity-70" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-0 space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/10">
              <CardTitle className="text-xl">Apparence & Affichage</CardTitle>
              <CardDescription>Personnalisez votre interface CampusHub.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <div className="space-y-4">
                <Label className="text-base font-bold">Thème de l'application</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: 'Clair', icon: Sun },
                    { id: 'dark', label: 'Sombre', icon: Moon },
                    { id: 'system', label: 'Système', icon: Monitor }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as any)}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all group",
                        theme === t.id 
                          ? "border-primary bg-primary/5 text-primary shadow-sm" 
                          : "border-border/50 hover:border-border hover:bg-muted/30"
                      )}
                    >
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                        theme === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                      )}>
                        <t.icon size={20} />
                      </div>
                      <span className="font-semibold text-sm">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <ShieldCheck className="text-primary h-5 w-5" />
                    Changer le mot de passe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                      <div className="relative group">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          className="h-11 border-border/50 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                        <div className="relative group">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="h-11 border-border/50 pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmNewPassword">Confirmation</Label>
                        <div className="relative group">
                          <Input
                            id="confirmNewPassword"
                            type={showConfirmNewPassword ? "text" : "password"}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                            className="h-11 border-border/50 pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    {passwordChangeError && <p className="text-destructive text-xs font-medium">{passwordChangeError}</p>}
                    <Button type="submit" disabled={isChangingPassword} className="w-full md:w-auto mt-2">
                      {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Mettre à jour le mot de passe
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
                <CardHeader className="bg-destructive/10">
                  <CardTitle className="text-lg text-destructive flex items-center gap-2">
                    <Trash2 size={18} />
                    Zone de danger
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <p className="text-sm text-destructive/80 leading-relaxed font-medium">
                    La suppression de votre compte est définitive.
                  </p>
                  <Button variant="destructive" className="w-full" onClick={() => setIsDeleteAccountDialogOpen(true)}>
                    Supprimer le compte
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-4">
                  <Button variant="outline" className="w-full justify-between" onClick={() => { localStorage.clear(); navigate('/signin'); }}>
                    Se déconnecter
                    <LogOut size={16} />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={isImageUploadConfirmDialogOpen} onOpenChange={setIsImageUploadConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nouvelle photo de profil</DialogTitle>
            <DialogDescription>
              Ajustez le cadrage si nécessaire avant de confirmer votre nouvelle photo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            {pendingImageFile && <img src={URL.createObjectURL(pendingImageFile)} alt="Preview" className="h-48 w-48 rounded-2xl object-cover shadow-2xl border-4 border-background" />}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsImageUploadConfirmDialogOpen(false)}>Annuler</Button>
            <Button onClick={confirmImageChange} disabled={isUploadingImage}>
              {isUploadingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Supprimer mon compte</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes vos données seront définitivement supprimées.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label htmlFor="deletePass">Confirmez votre mot de passe</Label>
            <Input id="deletePass" type="password" value={deleteConfirmationPassword} onChange={(e) => setDeleteConfirmationPassword(e.target.value)} />
            {deleteAccountError && <p className="text-destructive text-xs">{deleteAccountError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAccountDialogOpen(false)} disabled={isDeletingAccount}>Annuler</Button>
            <Button variant="destructive" onClick={async () => {
              if (!profileData) return;
              setIsDeletingAccount(true);
              try {
                await api.post(`/campushub-user-service/api/users/${profileData.id}/delete-account-confirm`, { password: deleteConfirmationPassword });
                localStorage.clear(); 
                navigate('/signin');
              } catch(e:any) { 
                setDeleteAccountError(e.response?.data?.message || "Erreur lors de la suppression du compte."); 
              } finally { 
                setIsDeletingAccount(false); 
              }
            }} disabled={!deleteConfirmationPassword || isDeletingAccount}>
              {isDeletingAccount ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Supprimer mon compte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Badge = ({ children, variant = "default", className }: any) => {
  const variants: any = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    outline: "border border-border text-foreground bg-transparent"
  };
  return <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors", variants[variant], className)}>{children}</span>
};

export default StudentProfilePage;
