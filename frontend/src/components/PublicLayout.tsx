import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import Footer from './Footer';

export default function PublicLayout() {
  const location = useLocation();
  const isEventDetail = /^\/evento\/[^/]+$/.test(location.pathname);

  return (
    <div className="app">
      {!isEventDetail && <SiteHeader />}
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
