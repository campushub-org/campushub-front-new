import React from 'react';
import { 
  Users, 
  Server, 
  Database, 
  ShieldAlert,
  Settings,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Widgets for Admin Dashboard
import UserManagementWidget from '@/components/dashboard/admin/UserManagementWidget';
import RoomResourceWidget from '@/components/dashboard/admin/RoomResourceWidget';
import PlanningOverviewWidget from '@/components/dashboard/admin/PlanningOverviewWidget';
import QuickReportsWidget from '@/components/dashboard/admin/QuickReportsWidget';

const StatsCard = ({ title, value, icon: Icon, status, label }: any) => (
  <Card className="overflow-hidden transition-all hover:shadow-md border-border/50">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        <span className={`h-2 w-2 rounded-full ${status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </CardContent>
  </Card>
);

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Console Admin ⚙️</h1>
          <p className="text-muted-foreground mt-1">
            Gestion des ressources, utilisateurs et santé du système.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 gap-2 shadow-sm">
            <Activity className="h-4 w-4" />
            Logs Système
          </button>
        </div>
      </div>

      {/* System Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Utilisateurs Totaux" 
          value="1,284" 
          icon={Users} 
          status="online"
          label="Système opérationnel"
        />
        <StatsCard 
          title="Charge Serveur" 
          value="24%" 
          icon={Server} 
          status="online"
          label="Latence 12ms"
        />
        <StatsCard 
          title="Santé BD" 
          value="99.9%" 
          icon={Database} 
          status="online"
          label="Sauvegarde OK"
        />
        <StatsCard 
          title="Alertes Sécurité" 
          value="0" 
          icon={ShieldAlert} 
          status="online"
          label="Aucune menace"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Resource Management */}
        <div className="lg:col-span-4 space-y-6">
          <UserManagementWidget />
          <PlanningOverviewWidget />
        </div>

        {/* System Monitoring Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <RoomResourceWidget />
          <QuickReportsWidget />
          
          <Card className="border-border/50 bg-slate-900 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Statut des Microservices
                <ArrowUpRight className="h-4 w-4 opacity-50" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Gateway', status: 'Healthy' },
                { name: 'User Service', status: 'Healthy' },
                { name: 'Salle Service', status: 'Healthy' },
                { name: 'Notification', status: 'Healthy' }
              ].map((svc) => (
                <div key={svc.name} className="flex items-center justify-between text-sm">
                  <span className="opacity-70">{svc.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                    {svc.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
