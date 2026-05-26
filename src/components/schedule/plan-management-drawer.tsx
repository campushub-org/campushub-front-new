import React, { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { SchedulePlan } from "@/lib/schedule-data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Calendar, Layers, Save, Trash2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PlanManagementDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: SchedulePlan | null;
  onSave: (plan: Partial<SchedulePlan>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isSaving?: boolean;
}

export const PlanManagementDrawer: React.FC<PlanManagementDrawerProps> = ({
  open,
  onOpenChange,
  plan,
  onSave,
  onDelete,
  isSaving = false
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<SchedulePlan>>({
    name: '',
    academicYear: '2024-2025',
    semester: 1,
    status: 'DRAFT',
    isDefault: false,
    level: 'L1',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +4 mois par défaut
  });

  useEffect(() => {
    if (plan) {
      setFormData(plan);
    } else {
      setFormData({
        name: '',
        academicYear: '2024-2025',
        semester: 1,
        status: 'DRAFT',
        isDefault: false,
        level: 'L1',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
  }, [plan, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[450px] flex flex-col h-full border-l border-border/40 shadow-2xl">
        <SheetHeader className="text-left border-b border-border/40 pb-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <SheetTitle className="text-xl font-black tracking-tight">
                {plan ? t('dean.scheduling.sidebar.plan_management.titles.edit') : t('dean.scheduling.sidebar.plan_management.titles.new')}
              </SheetTitle>
              <SheetDescription className="text-xs font-medium">
                {t('dean.scheduling.sidebar.plan_management.description')}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-8 py-2">
          {/* Section: Identité */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plan-name" className="text-[11px] font-black uppercase tracking-widest text-primary/70">{t('dean.scheduling.sidebar.plan_management.labels.version_name')}</Label>
              <Input
                id="plan-name"
                placeholder={t('dean.scheduling.sidebar.plan_management.placeholders.name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 bg-muted/30 border-border/60 focus:bg-background"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-primary/70">{t('dean.scheduling.sidebar.plan_management.labels.level')}</Label>
                <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                  <SelectTrigger className="h-11 bg-muted/30"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L1">Niveau 1 (L1)</SelectItem>
                    <SelectItem value="L2">Niveau 2 (L2)</SelectItem>
                    <SelectItem value="L3">Niveau 3 (L3)</SelectItem>
                    <SelectItem value="M1">Niveau 4 (M1)</SelectItem>
                    <SelectItem value="M2">Niveau 5 (M2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-primary/70">{t('dean.scheduling.sidebar.plan_management.labels.semester')}</Label>
                <Select value={formData.semester?.toString()} onValueChange={(v) => setFormData({ ...formData, semester: parseInt(v) })}>
                  <SelectTrigger className="h-11 bg-muted/30"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{t('dean.scheduling.sidebar.plan_management.labels.semester')} 1</SelectItem>
                    <SelectItem value="2">{t('dean.scheduling.sidebar.plan_management.labels.semester')} 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator className="bg-border/40" />

          {/* Section: Année & Statut */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-primary/70">{t('dean.scheduling.sidebar.plan_management.labels.academic_year')}</Label>
              <Select value={formData.academicYear} onValueChange={(v) => setFormData({ ...formData, academicYear: v })}>
                <SelectTrigger className="h-11 bg-muted/30"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2025-2026">2025-2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-[11px] font-black uppercase tracking-widest text-primary/70">Date de début</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="h-11 bg-muted/30 border-border/60"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-[11px] font-black uppercase tracking-widest text-primary/70">Date de fin</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="h-11 bg-muted/30 border-border/60"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-widest text-primary/70">{t('dean.scheduling.sidebar.plan_management.labels.version_status')}</Label>
              <div className="grid grid-cols-2 gap-3">
                {['DRAFT', 'ACTIVE'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: status as any })}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      formData.status === status ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 hover:border-primary/20"
                    )}
                  >
                    <Badge variant={formData.status === status ? "default" : "outline"} className="uppercase text-[9px] px-1.5">
                      {status === 'ACTIVE' ? t('dean.scheduling.sidebar.plan_management.status.active') : t('dean.scheduling.sidebar.plan_management.status.draft')}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
                      {status === 'ACTIVE' ? t('dean.scheduling.sidebar.plan_management.status.active_desc') : t('dean.scheduling.sidebar.plan_management.status.draft_desc')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-primary/5 border border-primary/20 rounded-2xl shadow-sm">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold flex items-center gap-2">
                   {t('dean.scheduling.sidebar.plan_management.labels.default_version')}
                </Label>
                <p className="text-[10px] text-muted-foreground italic">{t('dean.scheduling.sidebar.plan_management.labels.default_version_desc')}</p>
              </div>
              <Switch 
                checked={formData.isDefault} 
                onCheckedChange={(v) => setFormData({ ...formData, isDefault: v })} 
              />
            </div>
          </div>

          {plan && onDelete && (
            <div className="pt-6 border-t border-border/40 mt-10">
               <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-4">
                  <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-3">
                     <div className="space-y-1">
                        <p className="text-xs font-black text-rose-800 uppercase">{t('dean.scheduling.sidebar.plan_management.danger_zone.title')}</p>
                        <p className="text-[11px] text-rose-700/80 leading-relaxed font-medium">
                          {t('dean.scheduling.sidebar.plan_management.danger_zone.description')}
                        </p>
                     </div>
                     <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        className="h-8 rounded-lg font-bold text-[10px] uppercase gap-2"
                        onClick={() => onDelete(plan.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> {t('dean.scheduling.sidebar.plan_management.danger_zone.delete_button')}
                     </Button>
                  </div>
               </div>
            </div>
          )}
        </form>

        <SheetFooter className="border-t border-border/40 pt-6 mt-auto">
          <div className="flex w-full gap-3">
            <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => onOpenChange(false)}>
              {t('dean.scheduling.event_drawer.actions.cancel')}
            </Button>
            <Button 
              className="flex-[2] h-12 rounded-xl font-black gap-2 shadow-lg shadow-primary/20" 
              onClick={handleSubmit}
              disabled={isSaving || !formData.name}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t('dean.scheduling.sidebar.plan_management.actions.save_version')}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
