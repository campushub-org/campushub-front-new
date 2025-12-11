import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User as UserIcon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/lib/api'; // Import your API utility
import { decodeToken } from '@/lib/auth'; // Import decodeToken

interface Notification {
  id: number;
  isRead: boolean;
  // Other notification properties are not needed for unread count
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Charger l'image au montage du composant
  useEffect(() => {
    const storedImage = localStorage.getItem('userProfileImage');
    if (storedImage) {
      setProfileImage(storedImage);
    }

    // Fonction pour mettre à jour l'image lors d'un événement personnalisé
    const handleProfileImageUpdate = () => {
      const updatedImage = localStorage.getItem('userProfileImage');
      setProfileImage(updatedImage);
    };

    // Écouter l'événement personnalisé
    window.addEventListener('profileImageUpdated', handleProfileImageUpdate);

    // Nettoyage de l'écouteur d'événement
    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
    };
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUnreadCount(0);
        return;
      }

      const decoded = decodeToken(token);
      if (!decoded || !decoded.id) {
        setUnreadCount(0);
        return;
      }
      const userId = decoded.id;

      try {
        // Assuming there's a /user endpoint or the existing teacher one can be adapted
        const response = await api.get<Notification[]>(`/campushub-notification-service/api/notifications/teacher/${userId}`);
        const count = response.data.filter(notif => !notif.isRead).length;
        setUnreadCount(count);
      } catch (err) {
        console.error('Error fetching unread notification count:', err);
        setUnreadCount(0);
      }
    };

    fetchUnreadCount(); // Fetch on component mount
    const interval = setInterval(fetchUnreadCount, 60000); // Refresh every minute

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const handleLogout = () => {
    // Simulate logout
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token'); // Also remove token on logout
    localStorage.removeItem('userProfileImage'); // Clean up profile image on logout
    navigate('/signin');
  };

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-end px-6 bg-white border-b">
      {/* Search bar removed */}
      <div className="flex items-center space-x-4">
        <Link to="./notifications" className="relative">
          <Button variant="ghost" size="icon">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-3 w-3 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                {/* Optional: display count if it fits, otherwise just a dot */}
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt="User avatar" />
                ) : (
                  <AvatarFallback>U</AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Utilisateur</p>
                <p className="text-xs leading-none text-muted-foreground">
                  user@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link to="./profile">
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
