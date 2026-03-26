import React from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Users, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Widgets for Dean Dashboard
import MaterialsToValidateWidget from '@/components/dashboard/dean/MaterialsToValidateWidget';
import GlobalPlanningOverviewWidget from '@/components/dashboard/dean/GlobalPlanningOverviewWidget';
import KeyStatisticsWidget from '@/components/dashboard/dean/KeyStatisticsWidget';
import DeanReportsWidget from '@/components/dashboard/dean/DeanReportsWidget';

const StatsCard = ({ title, value, icon: Icon, description, trend, trendValue }: any) => (
  <Card className="overflow-hidden transition-all hover:shadow-md border-border/50">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center gap-1 mt-1">
        {trend === 'up' ? (
          <span className="text-xs text-emerald-600 font-medium flex items-center">+{trendValue}%</span>
        ) : (
          <span className="text-xs text-rose-600 font-medium flex items-center">-{trendValue}%</span>
        )}
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </CardContent>
  </Card>
);

const DeanDashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Espace Doyen 🏛️</h1>
          <p className="text-muted-foreground mt-1">
            Supervision académique et validation des supports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-2">
            <BarChart3 className="h-4 w-4" />
            Rapport mensuel
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 gap-2">
            <CheckCircle className="h-4 w-4" />
            Valider tout
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Supports en attente" 
          value="24" 
          icon={AlertTriangle} 
          description="depuis hier"
          trend="up"
          trendValue="12"
        />
        <StatsCard 
          title="Taux de validation" 
          value="88%" 
          icon={ShieldCheck} 
          description="ce mois"
          trend="up"
          trendValue="4"
        />
        <StatsCard 
          title="Enseignants actifs" 
          value="45" 
          icon={Users} 
          description="cette semaine"
          trend="down"
          trendValue="2"
        />
        <StatsCard 
          title="Examens prévus" 
          value="18" 
          icon={Calendar} 
          description="prochains 15 jours"
          trend="up"
          trendValue="8"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Main Focus: Validations */}
        <div className="lg:col-span-4 space-y-6">
          <MaterialsToValidateWidget />
          <DeanReportsWidget />
        </div>

        {/* Supervision Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <GlobalPlanningOverviewWidget />
          <KeyStatisticsWidget />
        </div>
      </div>
    </div>
  );
};

export default DeanDashboard;
