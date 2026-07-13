import { useEffect, useState } from 'react';
import { fetchAdminUsers, toggleUserPresaleAccess } from '../../services/api';
import type { User } from '../../types';
import './AdminLayout.css';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = () => {
    setLoading(true);
    fetchAdminUsers()
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar usuarios'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggle = async (user: User) => {
    try {
      const updated = await toggleUserPresaleAccess(user.id, !user.presaleAccess);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el usuario');
    }
  };

  if (loading) return <div className="admin-loading">Cargando usuarios...</div>;

  return (
    <div>
      <div className="admin-page__header">
        <h1>Usuarios</h1>
        <p>Gestiona el acceso a preventa por usuario</p>
      </div>

      {error && <div className="admin-form__error">{error}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Preventa</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.presaleAccess ? 'Sí' : 'No'}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => handleToggle(user)}
                    disabled={user.role === 'admin'}
                  >
                    {user.presaleAccess ? 'Quitar acceso' : 'Dar acceso'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
