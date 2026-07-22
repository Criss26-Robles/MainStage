import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAdminEvents, createAdminEvent, updateAdminEvent } from '../../services/api';
import type { AdminEventPayload } from '../../types';
import CalendarDatePicker from '../../components/CalendarDatePicker';
import ImageFocusPicker from '../../components/admin/ImageFocusPicker';
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
  image: string;
  description: string;
  featured: boolean;
  popular: boolean;
  discount: string;
  serviceFeePercent: string;
  salePhase: string;
  source: string;
  externalUrl: string;
  isSellable: boolean;
}

interface TierRow {
  name: string;
  price: string;
  available: string;
  description: string;
}

interface AdminSelectOption {
  value: string;
  label: string;
}

interface AdminSelectProps {
  id: string;
  name: string;
  value: string;
  options: AdminSelectOption[];
  isOpen: boolean;
  onToggle: (name: string) => void;
  onChange: (value: string) => void;
}

const CATEGORIES = ['Concierto', 'Festival', 'Teatro', 'Museo', 'Comedia', 'Electrónica'];
const CATEGORY_OPTIONS = CATEGORIES.map(category => ({ value: category, label: category }));
const SALE_PHASE_OPTIONS = [
  { value: 'general', label: 'Venta general' },
  { value: 'presale', label: 'Preventa (solo miembros)' }
];
const SOURCE_OPTIONS = [
  { value: 'mainstage', label: 'MainStage (venta directa)' },
  { value: 'tuboleta', label: 'TuBoleta (referencia)' },
  { value: 'ticketmaster', label: 'Ticketmaster (referencia)' },
  { value: 'bandsintown', label: 'Bandsintown (referencia)' },
  { value: 'manual', label: 'Manual / otro' }
];

const EMPTY: EventFormState = {
  title: '', artist: '', category: 'Concierto', date: '', time: '',
  venue: '', city: '', department: '', image: '', description: '',
  featured: false, popular: false, discount: '0',
  serviceFeePercent: '10', salePhase: 'general',
  source: 'mainstage', externalUrl: '', isSellable: true
};

const EMPTY_TIER: TierRow = { name: '', price: '', available: '', description: '' };

function AdminSelect({
  id,
  name,
  value,
  options,
  isOpen,
  onToggle,
  onChange
}: AdminSelectProps) {
  const selectedLabel = options.find(option => option.value === value)?.label || options[0]?.label || '';

  return (
    <div className={`admin-form__select ${isOpen ? 'admin-form__select--open' : ''}`}>
      <button
        id={id}
        type="button"
        className="admin-form__select-trigger"
        onClick={() => onToggle(name)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectedLabel}</span>
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="admin-form__select-menu" role="listbox" aria-labelledby={id}>
          {options.map(option => {
            const active = option.value === value;
            return (
              <button
                key={`${name}-${option.value}`}
                type="button"
                className={`admin-form__select-option ${
                  active ? 'admin-form__select-option--active' : ''
                }`}
                onClick={() => onChange(option.value)}
                role="option"
                aria-selected={active}
              >
                <span>{option.label}</span>
                {active && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminEventForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<EventFormState>(EMPTY);
  const [tiers, setTiers] = useState<TierRow[]>([{ name: 'General', price: '', available: '', description: '' }]);
  const [imageFocusX, setImageFocusX] = useState(50);
  const [imageFocusY, setImageFocusY] = useState(50);
  const [priceChangeReason, setPriceChangeReason] = useState('');
  const [originalMinPrice, setOriginalMinPrice] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [openSelect, setOpenSelect] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setOpenSelect(null);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenSelect(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchAdminEvents()
      .then(events => {
        const event = events.find(e => e.id === parseInt(id, 10));
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
          image: event.image,
          description: event.description,
          featured: event.featured,
          popular: event.popular,
          discount: String(event.discount || 0),
          serviceFeePercent: String(event.serviceFeePercent ?? 10),
          salePhase: event.salePhase ?? 'general',
          source: event.source ?? 'mainstage',
          externalUrl: event.externalUrl ?? '',
          isSellable: event.isSellable ?? true
        });
        setImageFocusX(event.imageFocusX ?? 50);
        setImageFocusY(event.imageFocusY ?? 50);
        if (event.tiers && event.tiers.length > 0) {
          setTiers(
            event.tiers.map(t => ({
              name: t.name,
              price: String(t.price),
              available: String(t.available),
              description: t.description || ''
            }))
          );
          setOriginalMinPrice(Math.min(...event.tiers.map(t => t.price)));
        } else {
          setOriginalMinPrice(event.price);
        }
      })
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [id, navigate]);

  const handleChange = (field: keyof EventFormState, value: string | boolean) => {
    setForm(prev => {
      const next = { ...prev, [field]: value } as EventFormState;
      if (field === 'image' && typeof value === 'string' && value !== prev.image) {
        setImageFocusX(50);
        setImageFocusY(50);
      }
      return next;
    });
  };

  const handleSelectChange = (field: keyof EventFormState, value: string) => {
    handleChange(field, value);
    setOpenSelect(null);
  };

  const updateTier = (index: number, field: keyof TierRow, value: string) => {
    setTiers(prev => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  };

  const addTier = () => setTiers(prev => [...prev, { ...EMPTY_TIER }]);

  const removeTier = (index: number) =>
    setTiers(prev => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanedTiers = tiers
      .filter(t => t.name.trim())
      .map(t => ({
        name: t.name.trim(),
        price: parseInt(t.price, 10) || 0,
        available: parseInt(t.available, 10) || 0,
        description: t.description.trim()
      }));

    if (cleanedTiers.length === 0) {
      setError('Agrega al menos un tipo de boleta con nombre');
      return;
    }

    if (!form.date) {
      setError('Selecciona la fecha del evento');
      return;
    }

    const newMinPrice = Math.min(...cleanedTiers.map(t => t.price));
    if (isEdit && originalMinPrice !== null && newMinPrice !== originalMinPrice && !priceChangeReason.trim()) {
      setError('Indica el motivo del cambio de precio');
      return;
    }

    setLoading(true);

    const payload: AdminEventPayload = {
      title: form.title,
      artist: form.artist,
      category: form.category,
      date: form.date,
      time: form.time,
      venue: form.venue,
      city: form.city,
      department: form.department,
      image: form.image,
      imageFocusX,
      imageFocusY,
      description: form.description,
      featured: form.featured,
      popular: form.popular,
      discount: parseInt(form.discount, 10) || 0,
      serviceFeePercent: parseInt(form.serviceFeePercent, 10) || 10,
      salePhase: form.salePhase,
      source: form.source,
      externalUrl: form.externalUrl.trim(),
      isSellable: form.isSellable,
      tiers: cleanedTiers,
      ...(isEdit && priceChangeReason.trim() ? { priceChangeReason: priceChangeReason.trim() } : {})
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

      <form ref={formRef} className="admin-form" onSubmit={handleSubmit}>
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
            <AdminSelect
              id="admin-event-category"
              name="category"
              value={form.category}
              options={CATEGORY_OPTIONS}
              isOpen={openSelect === 'category'}
              onToggle={(name) => setOpenSelect(current => (current === name ? null : name))}
              onChange={(value) => handleSelectChange('category', value)}
            />
          </div>
        </div>

        <div className="admin-form__row">
          <div className="admin-form__field">
            <label>Fecha</label>
            <CalendarDatePicker
              id="admin-event-date"
              value={form.date}
              variant="field"
              placeholder="Seleccionar fecha"
              onOpen={() => setOpenSelect(null)}
              onChange={(value) => handleChange('date', value)}
            />
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
            <label>Descuento (%)</label>
            <input type="number" min="0" max="100" value={form.discount} onChange={e => handleChange('discount', e.target.value)} />
          </div>
          <div className="admin-form__field">
            <label>Comisión de servicio (%)</label>
            <input type="number" min="0" max="50" value={form.serviceFeePercent} onChange={e => handleChange('serviceFeePercent', e.target.value)} />
          </div>
          <div className="admin-form__field">
            <label>Fase de venta</label>
            <AdminSelect
              id="admin-event-sale-phase"
              name="salePhase"
              value={form.salePhase}
              options={SALE_PHASE_OPTIONS}
              isOpen={openSelect === 'salePhase'}
              onToggle={(name) => setOpenSelect(current => (current === name ? null : name))}
              onChange={(value) => handleSelectChange('salePhase', value)}
            />
          </div>
        </div>

        {isEdit && originalMinPrice !== null && (
          <div className="admin-form__field">
            <label>Motivo del cambio de precio</label>
            <input
              value={priceChangeReason}
              onChange={e => setPriceChangeReason(e.target.value)}
              placeholder="Obligatorio si modificas el precio base de las boletas"
            />
          </div>
        )}

        <div className="admin-form__row">
          <div className="admin-form__field">
            <label>Fuente del evento</label>
            <AdminSelect
              id="admin-event-source"
              name="source"
              value={form.source}
              options={SOURCE_OPTIONS}
              isOpen={openSelect === 'source'}
              onToggle={(name) => setOpenSelect(current => (current === name ? null : name))}
              onChange={(value) => handleSelectChange('source', value)}
            />
          </div>
          <div className="admin-form__field">
            <label>URL oficial de boletas</label>
            <input
              value={form.externalUrl}
              onChange={e => handleChange('externalUrl', e.target.value)}
              placeholder="https://..."
              disabled={form.isSellable}
            />
          </div>
        </div>

        <div className="admin-form__checks">
          <label className="admin-form__check">
            <input
              type="checkbox"
              checked={form.isSellable}
              onChange={e => handleChange('isSellable', e.target.checked)}
            />
            Venta directa en MainStage
          </label>
        </div>

        <div className="admin-form__field">
          <label>URL de imagen</label>
          <input value={form.image} onChange={e => handleChange('image', e.target.value)} placeholder="https://... enlace directo a la imagen (.jpg, .png, etc.)" />
          <span className="admin-form__hint">Pega un enlace directo a la imagen (Unsplash, Imgur, tu web, etc.). Debe terminar en .jpg/.png o ser un CDN de imagen. No hay subida desde el PC todavía.</span>
          {form.image.trim() && (
            <ImageFocusPicker
              imageUrl={form.image}
              title={form.title}
              artist={form.artist}
              focusX={imageFocusX}
              focusY={imageFocusY}
              onChange={(x, y) => {
                setImageFocusX(x);
                setImageFocusY(y);
              }}
            />
          )}
        </div>

        <div className="admin-form__field">
          <label>Tipos de boleta</label>
          <div className="admin-tiers">
            {tiers.map((tier, i) => (
              <div className="admin-tier" key={i}>
                <input
                  className="admin-tier__name"
                  placeholder="Nombre (General, VIP...)"
                  value={tier.name}
                  onChange={e => updateTier(i, 'name', e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Precio (COP)"
                  value={tier.price}
                  onChange={e => updateTier(i, 'price', e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Cupos"
                  value={tier.available}
                  onChange={e => updateTier(i, 'available', e.target.value)}
                />
                <input
                  className="admin-tier__desc"
                  placeholder="Descripción (opcional)"
                  value={tier.description}
                  onChange={e => updateTier(i, 'description', e.target.value)}
                />
                <button
                  type="button"
                  className="admin-tier__remove"
                  onClick={() => removeTier(i)}
                  disabled={tiers.length <= 1}
                  aria-label="Eliminar tipo"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-outline admin-tier__add" onClick={addTier}>
            + Agregar tipo
          </button>
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
