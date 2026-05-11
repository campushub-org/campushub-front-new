import React, { useEffect, useState } from "react";
import {
  Calendar,
  User,
  BookOpen,
  LayoutDashboard,
  Moon,
  Sun,
  LogOut,
  Search,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslation } from "react-i18next";

export function CommandMenu() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const userRole = localStorage.getItem('userRole')?.toLowerCase() || 'student';

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative inline-flex items-center justify-start h-9 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground md:w-40 lg:w-64"
      >
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <span className="inline-flex">{t("dashboard.search_placeholder")}</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("dashboard.command_input")} />
        <CommandList>
          <CommandEmpty>{t("dashboard.no_results")}</CommandEmpty>
          <CommandGroup heading={t("dashboard.suggestions")}>
            <CommandItem onSelect={() => runCommand(() => navigate(`/dashboard/${userRole}`))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>{t("common.dashboard")}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate(`/dashboard/${userRole}/support`))}>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>{t("academic.materials")}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate(`/dashboard/${userRole}/schedule-courses`))}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>{t("academic.schedule")}</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={t("dashboard.settings")}>
            <CommandItem onSelect={() => runCommand(() => navigate(`/dashboard/${userRole}/profile`))}>
              <User className="mr-2 h-4 w-4" />
              <span>{t("common.profile")}</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun className="mr-2 h-4 w-4" />
              <span>{t("dashboard.light_mode")}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="mr-2 h-4 w-4" />
              <span>{t("dashboard.dark_mode")}</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={t("dashboard.system")}>
            <CommandItem onSelect={() => runCommand(() => { localStorage.clear(); navigate('/'); })}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t("common.logout")}</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
