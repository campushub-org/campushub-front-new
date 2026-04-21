import React, { useState, useEffect, useCallback } from 'react';
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
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: number;
  isRead: boolean;
}

const Header: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  const fetchUnreadCount = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    const handleNewNotification = () => {
      setUnreadCount(prev => prev + 1);
    };

    window.addEventListener('notification_received', handleNewNotification);
    const interval = setInterval(fetchUnreadCount, 120000);
    
    return () => {
      window.removeEventListener('notification_received', handleNewNotification);
      clearInterval(interval);
    };
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (location.pathname.includes('notifications')) {
      setUnreadCount(0);
    }
  }, [location.pathname]);

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
        <Link to="./notifications" className="relative group">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-11 w-11 rounded-full hover:bg-primary/5 transition-all duration-300"
          >
            <Bell className={cn(
              "h-[1.4rem] w-[1.4rem] transition-all duration-300",
              unreadCount > 0 ? "text-primary fill-primary/5" : "text-muted-foreground group-hover:text-primary"
            )} />
            
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-background bg-primary px-1.5 text-[9px] font-black text-primary-foreground shadow-sm"
                >
                  <span className="relative z-10">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse" />
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
