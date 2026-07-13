import { useState } from 'react';
import { verifyTicket, markTicketUsed } from '../../services/api';
import type { TicketVerification } from '../../types';
import './AdminLayout.css';

export default function AdminTicketVerify() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<(TicketVerification & { message?: string }) | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setError('');
    setResult(null);
    if (!code.trim()) {
      setError('Ingresa un código QR');
      return;
    }
    setLoading(true);
    try {
      const data = await verifyTicket(code.trim());
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo verificar el boleto');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkUsed = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await markTicketUsed(code.trim());
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo marcar el boleto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-page__header">
        <h1>Verificar boletos</h1>
        <p>Escanea o pega el código QR para validar entradas en la puerta</p>
      </div>

      <div className="admin-form" style={{ maxWidth: 520 }}>
        <div className="admin-form__field">
          <label>Código del boleto</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="UUID del QR"
          />
        </div>

        {error && <div className="admin-form__error">{error}</div>}

        <div className="admin-form__actions">
          <button type="button" className="btn btn-primary" onClick={handleVerify} disabled={loading}>
            Verificar
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleMarkUsed}
            disabled={loading || !code.trim()}
          >
            Marcar como usado
          </button>
        </div>

        {result && (
          <div className="admin-verify-result">
            <p>
              <strong>{result.order.eventTitle}</strong>
            </p>
            <p>Comprador: {result.order.buyerName}</p>
            <p>Estado: {result.used ? 'Ya utilizado' : 'Válido'}</p>
            {result.message && <p>{result.message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
