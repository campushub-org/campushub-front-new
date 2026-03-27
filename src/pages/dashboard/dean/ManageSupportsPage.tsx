import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { decodeToken } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

// Interfaces
interface User {
  id: number;
  username: string;
  department: string;
  role: string;
}

interface Support {
  id: number;
  titre: string;
  matiere: string;
  niveau: string;
  enseignantId: number;
  statut: 'BROUILLON' | 'SOUMIS' | 'VALIDÉ' | 'REJETÉ';
  dateDepot: string;
}

const ManageSupportsPage: React.FC = () => {
  const [supports, setSupports] = useState<Support[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<number, User>>({});
  const navigate = useNavigate();

  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = decodeToken(token);
    return decoded ? decoded.id : null;
  };

  useEffect(() => {
    const fetchAndFilterSupports = async () => {
      setLoading(true);
      const deanId = getUserId();
      if (!deanId) {
        setError("Authentification requise.");
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch all users to create a map and find the dean's department
        const usersResponse = await api.get<User[]>('/campushub-user-service/api/users');
        const usersData = usersResponse.data;
        const userMap: Record<number, User> = {};
        usersData.forEach(user => {
            userMap[user.id] = user;
        });
        setUsers(userMap);

        const deanUser = userMap[deanId];
        if (!deanUser || !deanUser.department) {
          setError("Impossible de trouver le département du doyen.");
          setLoading(false);
          return;
        }
        const deanDepartment = deanUser.department;

        // 2. Get IDs of teachers in the same department
        const teacherIds = Object.values(userMap)
          .filter(user => user.department === deanDepartment && user.role === 'TEACHER')
          .map(teacher => teacher.id);
          
        if (teacherIds.length === 0) {
            setLoading(false);
            return;
        }

        // 3. Fetch all supports
        const supportsResponse = await api.get<Support[]>('/campushub-support-service/api/supports');
        
        // 4. Filter supports
        const filteredSupports = supportsResponse.data.filter(support =>
          teacherIds.includes(support.enseignantId) &&
          (support.statut === 'SOUMIS' || support.statut === 'VALIDÉ'))
        .sort((a, b) => new Date(b.dateDepot).getTime() - new Date(a.dateDepot).getTime());

        setSupports(filteredSupports);

      } catch (err) {
        console.error("Erreur lors du chargement des données :", err);
        setError("Une erreur est survenue lors de la récupération des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterSupports();
  }, []);

  const getStatusBadgeVariant = (status: Support['statut']) => {
    switch (status) {
      case 'VALIDÉ': return 'default';
      case 'SOUMIS': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Supports</h1>
          <p className="text-muted-foreground">
            Validez les ressources pédagogiques déposées par les enseignants de votre département.
          </p>
        </div>
      </div>

      <Card className="rounded-xl border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">Supports du département</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="p-12 text-center text-muted-foreground">
              <div className="h-8 w-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
              Chargement des supports...
            </div>
          )}
          {error && <div className="p-12 text-center text-rose-500 font-medium">{error}</div>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="font-bold">Titre</TableHead>
                    <TableHead className="font-bold">Enseignant</TableHead>
                    <TableHead className="font-bold">Date de Dépôt</TableHead>
                    <TableHead className="font-bold">Statut</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supports.length > 0 ? (
                    supports.map((support) => (
                      <TableRow key={support.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="font-semibold">{support.titre}</TableCell>
                        <TableCell>{users[support.enseignantId]?.username || 'Inconnu'}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(support.dateDepot).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(support.statut)} className="rounded-lg px-2.5 py-0.5 font-medium">
                            {support.statut}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-lg hover:bg-primary/10 hover:text-primary gap-2 h-9"
                            onClick={() => navigate(`/dashboard/dean/support/view/${support.id}`)}
                          >
                            <Eye size={16} /> Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-medium">
                        Aucun support soumis ou validé dans votre département.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageSupportsPage;
