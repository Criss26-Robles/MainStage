import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAdminEvents, createAdminEvent, updateAdminEvent } from '../../services/api';
import './AdminLayout.css';

interface EventFormState {
  title: string;
  artist: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  department: string;
  price: string;
  image: string;
  description: string;
  availableTickets: string;
  featured: boolean;
  popular: boolean;
  discount: string;
}

const CATEGORIES = ['Concierto', 'Festival', 'Teatro', 'Museo', 'Comedia', 'Electrónica'];
const EMPTY: EventFormState = {
  title: '', artist: '', category: 'Concierto', date: '', time: '',
  venue: '', city: '', department: '', price: '', image: '',
  description: '', availableTickets: '100', featured: false, popular: false, discount: '0'
};

export default function AdminEventForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState<EventFormState>(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!id) return;
    fetchAdminEvents()
      .then(events => {
        const event = events.find(e => e.id === parseInt(id));
        if (!event) { navigate('/admin/eventos'); return; }
        setForm({
          title: event.title,
          artist: event.artist,
          category: event.category,
          date: event.date,
          time: event.time,
          venue: event.venue,
          city: event.city,
          department: event.department,
          price: String(event.price),
          image: event.image,
          description: event.description,
          availableTickets: String(event.availableTickets),
          featured: event.featured,
          popular: event.popular,
          discount: String(event.discount || 0)
        });
      })
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [id, isEdit, navigate]);

  const handleChange = (field: keyof EventFormState, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value } as EventFormState));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      ...form,
      price: parseInt(form.price),
      availableTickets: parseInt(form.availableTickets),
      discount: parseInt(form.discount)
    };

    try {
      if (isEdit && id) {
        await updateAdminEvent(id, payload);
      } else {
        await createAdminEvent(payload);
      }
      navigate('/admin/eventos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el evento');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="admin-loading">Cargando evento...</div>;

  return (
    <div>
      <div className="admin-page__header">
        <h1>{isEdit ? 'Editar evento' : 'Nuevo evento'}</h1>
        <p>{isEdit ? 'Modifica los datos del evento' : 'Completa la información para publicar'}</p>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        {error && <div className="admin-form__error">{error}</div>}

        <div className="admin-form__field">
          <label>Título del evento</label>
          <input required value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="Nombre del evento" />
        </div>

        <div className="admin-form__row">
          <div className="admin-form__field">
            <label>Artista / Organizador</label>
            <input required value={form.artist} onChange={e => handleChange('artist', e.target.value)} />
          </div>
          <div className="admin-form__field">
            <label>Categoría</label>
            <select value={form.category} onChange={e => handleChange('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="admin-form__row">
          <div className="admin-form__field">
            <label>Fecha</label>
            <input type="date" required value={form.date} onChange={e => handleChange('date', e.target.value)} />
          </div>
          <div className="admin-form__field">
            <label>Hora</label>
            <input type="time" required value={form.time} onChange={e => handleChange('time', e.target.value)} />
          </div>
        </div>

        <div className="admin-form__field">
          <label>Lugar / Venue</label>
          <input required value={form.venue} onChange={e => handleChange('venue', e.target.value)} placeholder="Ej: Movistar Arena" />
        </div>

        <div className="admin-form__row">
          <div className="admin-form__field">
            <label>Ciudad</label>
            <input required value={form.city} onChange={e => handleChange('city', e.target.value)} />
          </div>
          <div className="admin-form__field">
            <label>Departamento</label>
            <input required value={form.department} onChange={e => handleChange('department', e.target.value)} />
          </div>
        </div>

        <div className="admin-form__row">
          <div className="admin-form__field">
            <label>Precio (COP)</label>
            <input type="number" required min="0" value={form.price} onChange={e => handleChange('price', e.target.value)} />
          </div>
          <div className="admin-form__field">
            <label>Descuento (%)</label>
            <input type="number" min="0" max="100" value={form.discount} onChange={e => handleChange('discount', e.target.value)} />
          </div>
        </div>

        <div className="admin-form__row">
          <div className="admin-form__field">
            <label>Boletos disponibles</label>
            <input type="number" required min="0" value={form.availableTickets} onChange={e => handleChange('availableTickets', e.target.value)} />
          </div>
          <div className="admin-form__field">
            <label>URL de imagen</label>
            <input value={form.image} onChange={e => handleChange('image', e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <div className="admin-form__field">
          <label>Descripción</label>
          <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Descripción del evento..." />
        </div>

        <div className="admin-form__checks">
          <label className="admin-form__check">
            <input type="checkbox" checked={form.featured} onChange={e => handleChange('featured', e.target.checked)} />
            Destacado
          </label>
          <label className="admin-form__check">
            <input type="checkbox" checked={form.popular} onChange={e => handleChange('popular', e.target.checked)} />
            Popular
          </label>
        </div>

        <div className="admin-form__actions">
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '14px 28px' }}>
            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear evento'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/eventos')} style={{ padding: '14px 28px' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
