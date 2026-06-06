import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Eye,
  ArrowRight,
} from 'lucide-react';
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
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const PublicSidebar: React.FC<{ navItems: NavItem[] }> = ({ navItems }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarUI collapsible="icon" className="border-r border-border/50 bg-card">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-border/50">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-semibold tracking-tight text-foreground truncate">
              CampusHub
            </span>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              {t('explore.menu_label')}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-1">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.to ||
                  location.pathname.startsWith(`${item.to}/`);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        'h-10 transition-all duration-200',
                        isActive
                          ? 'bg-primary/10 text-primary hover:bg-primary/15'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <NavLink to={item.to} className="flex items-center w-full">
                        <span
                          className={cn(
                            'flex-shrink-0 transition-transform duration-200',
                            isActive && 'scale-110'
                          )}
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <span className="ml-3 font-medium">{item.label}</span>
                        )}
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

      <SidebarFooter className="p-3 border-t border-border/50">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2 px-2 py-1.5">
            <div className="flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground">
                {t('explore.guest_badge')}
              </span>
            </div>
            <NavLink
              to="/signin"
              className="text-xs font-semibold text-primary hover:underline underline-offset-4"
            >
              {t('navbar.signin')}
            </NavLink>
          </div>
        ) : (
          <div className="flex justify-center py-1.5">
            <Eye className="h-4 w-4 text-primary" />
          </div>
        )}
      </SidebarFooter>
    </SidebarUI>
  );
};

const GuestBanner: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full bg-primary/5 border-b border-primary/15">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p className="text-sm text-foreground/80">
          <span className="font-semibold text-primary">{t('explore.banner_prefix')}</span>
          {' — '}
          <span className="text-muted-foreground">{t('explore.banner_message')}</span>
        </p>
        <Button asChild size="sm" variant="default" className="h-8 px-4 text-xs font-semibold shrink-0">
          <NavLink to="/signup">
            {t('explore.banner_cta')}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </NavLink>
        </Button>
      </div>
    </div>
  );
};

const PublicHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center gap-4 border-b border-border/50 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center justify-end gap-2">
        <LanguageSwitcher />
      </div>
    </header>
  );
};

const PublicStudentLayout: React.FC = () => {
  const { t } = useTranslation();

  const navItems: NavItem[] = [
    {
      to: '/explore/courses',
      icon: <BookOpen size={20} />,
      label: t('academic.materials'),
    },
    {
      to: '/explore/planning',
      icon: <CalendarDays size={20} />,
      label: t('planning.menu_label'),
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <PublicSidebar navItems={navItems} />
        <SidebarInset className="flex flex-col">
          <GuestBanner />
          <PublicHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default PublicStudentLayout;
