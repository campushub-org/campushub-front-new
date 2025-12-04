import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Save } from 'lucide-react';

const ProfilePage: React.FC = () => {
  // Données de profil simulées
  const profileData = {
    fullName: "Alice Martin",
    username: "amartin",
    email: "alice.martin@campus.com",
    department: "Informatique",
    studentNumber: "2024-123",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mon Profil Étudiant</CardTitle>
          <CardDescription>Consultez et mettez à jour vos informations personnelles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder-user.jpg" alt="Photo de profil" />
              <AvatarFallback className="text-xl">AM</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-bold">{profileData.fullName}</h3>
              <p className="text-md text-muted-foreground">Étudiant(e)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input id="fullName" defaultValue={profileData.fullName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input id="username" defaultValue={profileData.username} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={profileData.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Département</Label>
              <Input id="department" defaultValue={profileData.department} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="studentNumber">Numéro d'étudiant</Label>
              <Input id="studentNumber" defaultValue={profileData.studentNumber} readOnly />
            </div>
          </div>
          <Button disabled>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer les modifications
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
          <CardDescription>Gérez votre mot de passe.</CardDescription>
        </CardHeader>
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
      </Card>
    </div>
  );
};

export default ProfilePage;
