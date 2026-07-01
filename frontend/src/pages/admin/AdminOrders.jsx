import { useEffect, useState } from 'react';
import { fetchAdminOrders, formatPrice, formatDate } from '../../services/api';
import './AdminLayout.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalTickets = orders.reduce((sum, o) => sum + o.quantity, 0);

  return (
    <div>
      <div className="admin-page__header">
        <h1>Ventas de boletos</h1>
        <p>{orders.length} órdenes · {totalTickets} boletos · {formatPrice(totalRevenue)} en ingresos</p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--gray-500)' }}>Cargando ventas...</p>
      ) : orders.length === 0 ? (
        <p style={{ color: 'var(--gray-500)' }}>No hay ventas registradas aún.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Fecha compra</th>
                <th>Evento</th>
                <th>Ciudad</th>
                <th>Fecha evento</th>
                <th>Comprador</th>
                <th>Email</th>
                <th>Boletos</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td><strong style={{ color: 'var(--white)' }}>{order.confirmationCode}</strong></td>
                  <td>{new Date(order.createdAt).toLocaleDateString('es-CO')}</td>
                  <td>{order.eventTitle}</td>
                  <td>{order.eventCity}</td>
                  <td>{formatDate(order.eventDate)}</td>
                  <td>{order.buyerName}</td>
                  <td>{order.buyerEmail}</td>
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
