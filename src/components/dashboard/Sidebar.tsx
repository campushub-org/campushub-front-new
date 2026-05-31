import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { GraduationCap, ChevronRight, LogOut, User } from 'lucide-react';
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import { logout } from '@/lib/auth';

export interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

interface SidebarProps {
  navItems: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ navItems }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const profileImage = localStorage.getItem('userProfileImage');
  const userRole = localStorage.getItem('userRole') || 'Utilisateur';

  const handleLogout = () => {
    logout();
  };

  const getTranslatedRole = (role: string) => {
    const roles: Record<string, string> = {
      'student': t('roles.student'),
      'teacher': t('roles.teacher'),
      'dean': t('roles.dean'),
      'admin': t('roles.admin'),
    };
    return roles[role.toLowerCase()] || role;
  };

  return (
    <SidebarUI collapsible="icon" className="border-r border-border/50 bg-card">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-border/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-semibold tracking-tight text-foreground truncate">
              CampusHub
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{t("sidebar.main_menu")}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
                
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "h-10 transition-all duration-200",
                        isActive 
                          ? "bg-primary/10 text-primary hover:bg-primary/15" 
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <NavLink to={item.to} className="flex items-center w-full">
                        <span className={cn("flex-shrink-0 transition-transform duration-200", isActive && "scale-110")}>
                          {item.icon}
                        </span>
                        {!isCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
                        {isActive && !isCollapsed && (
                          <ChevronRight className="ml-auto h-4 w-4 opacity-70" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50 bg-muted/30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="hover:bg-accent rounded-xl px-2 transition-all duration-200">
              <Avatar className="h-9 w-9 border border-border/50 shadow-sm transition-transform group-hover:scale-105">
                <AvatarImage src={profileImage || ""} />
                <AvatarFallback className="bg-primary/5 text-primary">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 ml-2 text-left overflow-hidden">
                <span className="text-sm font-bold text-foreground truncate">Mon Compte</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{getTranslatedRole(userRole)}</span>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56 rounded-xl shadow-xl border-border/50 p-1.5 animate-in fade-in zoom-in duration-200">
            <DropdownMenuItem asChild>
              <NavLink to={`/dashboard/${userRole.toLowerCase()}/profile`} className="flex items-center w-full rounded-lg font-medium cursor-pointer py-2.5">
                <User className="mr-2 h-4 w-4" />
                <span>{t("sidebar.profile")}</span>
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 opacity-50" />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/5 rounded-lg font-medium cursor-pointer py-2.5">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t("sidebar.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </SidebarUI>
  );
};

export default Sidebar;
