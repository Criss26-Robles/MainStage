import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminStats, formatPrice } from '../../services/api';
import type { AdminStats } from '../../services/api';
import './AdminLayout.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Cargando estadísticas...</div>;
  if (!stats) return null;

  return (
    <div>
      <div className="admin-page__header">
        <h1>Dashboard</h1>
        <p>Resumen de ventas y actividad</p>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <p className="admin-stat__label">Ingresos totales</p>
          <p className="admin-stat__value">{formatPrice(stats.totalRevenue)}</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat__label">Boletos vendidos</p>
          <p className="admin-stat__value">{stats.totalTickets}</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat__label">Órdenes</p>
          <p className="admin-stat__value">{stats.totalOrders}</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat__label">Eventos activos</p>
          <p className="admin-stat__value">{stats.totalEvents}</p>
        </div>
      </div>

      {stats.topEvents.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 16 }}>
            Eventos con más ventas
          </h2>
          <div className="admin-table-wrap" style={{ marginBottom: 32 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Boletos</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {stats.topEvents.map((e, i) => (
                  <tr key={i}>
                    <td>{e.eventTitle}</td>
                    <td>{e.tickets}</td>
                    <td>{formatPrice(e.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Ventas recientes</h2>
        <Link to="/admin/ventas" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
          Ver todas
        </Link>
      </div>

      {stats.recentOrders.length === 0 ? (
        <p style={{ color: 'var(--gray-500)' }}>Aún no hay ventas registradas.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Evento</th>
                <th>Comprador</th>
                <th>Boletos</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.confirmationCode}</td>
                  <td>{order.eventTitle}</td>
                  <td>{order.buyerName}</td>
                  <td>{order.quantity}</td>
                  <td>{formatPrice(order.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
