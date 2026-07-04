import { Outlet } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import Footer from './Footer';

export default function PublicLayout() {
  return (
    <div className="app">
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
