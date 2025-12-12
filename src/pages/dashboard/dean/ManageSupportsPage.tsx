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
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Supports du Département</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p>Chargement des supports...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Enseignant</TableHead>
                <TableHead>Date de Dépôt</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supports.length > 0 ? (
                supports.map((support) => (
                  <TableRow key={support.id}>
                    <TableCell className="font-medium">{support.titre}</TableCell>
                    <TableCell>{users[support.enseignantId]?.username || 'Inconnu'}</TableCell>
                    <TableCell>{new Date(support.dateDepot).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(support.statut)}>
                        {support.statut}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/dean/support/view/${support.id}`)}>
                         <Eye className="mr-2 h-4 w-4" />
                         Voir
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Aucun support soumis ou validé dans votre département.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ManageSupportsPage;
