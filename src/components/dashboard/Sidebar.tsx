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
} from '@/components/ui/dropdown-menu';

export interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

interface SidebarProps {
  navItems: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ navItems }) => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const profileImage = localStorage.getItem('userProfileImage');
  const userRole = localStorage.getItem('userRole') || 'Utilisateur';

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    localStorage.removeItem('userProfileImage');
    window.location.href = '/';
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
          {!isCollapsed && <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Menu Principal</SidebarGroupLabel>}
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

      <SidebarFooter className="p-4 border-t border-border/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg border border-border/50 shadow-sm">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt="User" />
                ) : (
                  <AvatarFallback className="bg-primary/5 text-primary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                )}
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col items-start ml-3 overflow-hidden">
                  <span className="text-sm font-semibold text-foreground truncate w-full">Mon Compte</span>
                  <span className="text-xs text-muted-foreground capitalize">{userRole.toLowerCase()}</span>
                </div>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="end"
            className="w-56 mb-2 animate-in fade-in-0 zoom-in-95"
          >
            <DropdownMenuItem asChild>
              <NavLink to="./profile" className="flex items-center cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </SidebarUI>
  );
};

export default Sidebar;
