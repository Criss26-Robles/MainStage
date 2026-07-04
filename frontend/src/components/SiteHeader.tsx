import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import EventSearch from './EventSearch';
import LiveSearch from './LiveSearch';
import './SiteHeader.css';

const AUTH_ROUTES = ['/login', '/registro'];

export default function SiteHeader() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const hideSearch = AUTH_ROUTES.includes(location.pathname);

  const filters = {
    artist: searchParams.get('artist') || '',
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    date: searchParams.get('date') || ''
  };

  const handleSearch = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams();
    if (newFilters.artist) params.set('artist', newFilters.artist);
    if (newFilters.city) params.set('city', newFilters.city);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.date) params.set('date', newFilters.date);

    if (location.pathname === '/eventos') {
      setSearchParams(params);
    } else {
      const query = params.toString();
      navigate(`/eventos${query ? `?${query}` : ''}`);
    }
  };

  return (
    <header className={`site-header ${hideSearch ? 'site-header--compact' : ''}`}>
      <Navbar />
      {!hideSearch && (
        <div className="site-header__search">
          <div className="container">
            <LiveSearch />
            <EventSearch
              variant="bar"
              initialFilters={location.pathname === '/eventos' ? filters : {}}
              onSearch={handleSearch}
            />
          </div>
        </div>
      )}
    </header>
  );
}
