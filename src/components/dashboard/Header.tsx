import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import api from '@/lib/api';
import { decodeToken } from '@/lib/auth';
import { CommandMenu } from './CommandMenu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Notification {
  id: number;
  isRead: boolean;
}

const Header: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const decoded = decodeToken(token);
      if (!decoded || !decoded.id) return;
      const userId = decoded.id;

      try {
        const response = await api.get<Notification[]>(`/campushub-notification-service/api/notifications/user/${userId}`);
        const count = response.data.filter(notif => !notif.isRead).length;
        setUnreadCount(count);
      } catch (err) {
        console.error('Error fetching unread notification count:', err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // Generate Breadcrumbs from URL
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  const getBreadcrumbLabel = (name: string) => {
    const labels: Record<string, string> = {
      'dashboard': 'Tableau de bord',
      'teacher': 'Enseignant',
      'student': 'Étudiant',
      'dean': 'Doyen',
      'admin': 'Admin',
      'support': 'Supports',
      'profile': 'Profil',
      'notifications': 'Notifications',
      'schedule-courses': 'Planning Cours',
      'schedule-exams': 'Planning Examens',
      'availabilities': 'Disponibilités',
      'view': 'Vue'
    };
    return labels[name] || name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b border-border/50 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumb className="hidden md:flex ml-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">CampusHub</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {pathnames.slice(0, 2).map((name, index) => {
              const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
              const isLast = index === 1 || index === pathnames.length - 1;
              
              return (
                <React.Fragment key={name}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="font-semibold text-foreground">
                        {getBreadcrumbLabel(name)}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={routeTo} className="text-muted-foreground hover:text-foreground transition-colors">
                          {getBreadcrumbLabel(name)}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="flex flex-1 items-center justify-center px-4 md:px-20">
        <CommandMenu />
      </div>

      <div className="flex items-center gap-2">
        <Link to="./notifications" className="relative">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted transition-all">
            <Bell className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm animate-in zoom-in">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
