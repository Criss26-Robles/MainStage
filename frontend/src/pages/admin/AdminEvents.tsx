import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminEvents, deleteAdminEvent, formatPrice, formatShortDate } from '../../services/api';
import DeleteEventModal from '../../components/admin/DeleteEventModal';
import type { EventItem } from '../../types';
import './AdminLayout.css';

export default function AdminEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<EventItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadEvents = () => {
    setLoading(true);
    fetchAdminEvents()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEvents(); }, []);

  const openDeleteModal = (event: EventItem) => {
    setDeleteError('');
    setPendingDelete(event);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setPendingDelete(null);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteAdminEvent(pendingDelete.id);
      setPendingDelete(null);
      loadEvents();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar el evento');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="admin-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Gestión de eventos</h1>
          <p>{events.length} eventos en el catálogo</p>
        </div>
        <Link to="/admin/eventos/nuevo" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.8rem' }}>
          + Nuevo evento
        </Link>
      </div>

      {loading ? (
        <p style={{ color: 'var(--gray-500)' }}>Cargando eventos...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Categoría</th>
                <th>Ciudad</th>
                <th>Fecha</th>
                <th>Precio (COP)</th>
                <th>Boletos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id}>
                  <td>
                    <strong style={{ color: 'var(--white)' }}>{event.title}</strong>
                    <br />
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{event.artist}</span>
                  </td>
                  <td>{event.category}</td>
                  <td>{event.city}</td>
                  <td>{formatShortDate(event.date)}</td>
                  <td>{formatPrice(event.price)}</td>
                  <td>{event.availableTickets}</td>
                  <td>
                    {event.featured && <span className="admin-badge admin-badge--featured">Destacado</span>}
                    {event.popular && <span className="admin-badge" style={{ marginLeft: 4 }}>Popular</span>}
                    {event.discount > 0 && <span className="admin-badge" style={{ marginLeft: 4 }}>-{event.discount}%</span>}
                  </td>
                  <td>
                    <div className="admin-actions">
                      <Link to={`/admin/eventos/${event.id}/editar`} className="admin-btn admin-btn--edit">
                        Editar
                      </Link>
                      <button
                        type="button"
                        className="admin-btn admin-btn--delete"
                        onClick={() => openDeleteModal(event)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DeleteEventModal
        event={pendingDelete}
        open={!!pendingDelete}
        deleting={deleting}
        error={deleteError}
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
