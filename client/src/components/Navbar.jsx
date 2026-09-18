import { Link } from 'react-router-dom';
import { languages, useLanguage, useTranslation } from '../i18n';

const locations = [
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Kochi',
  'Chandigarh',
  'Patna',
  'Bhopal',
  'Nagpur'
];

export default function Navbar({ user, setUser, cartCount, logoUrl, brandName, brandTagline }) {
  const { language, setLanguage } = useLanguage();
  const labels = useTranslation();
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoUrl || '/images/feline-mark.svg'} alt="FELINE INDIA cat logo" className="h-14 w-11 object-contain" />
          <div className="min-w-0">
            {brandName ? <div className="text-lg font-black tracking-tight text-[#062b45]">{brandName}</div> : <img src="/images/feline-wordmark.svg" alt="FELINE INDIA" className="h-12 w-40 object-contain object-left" />}
            {brandTagline && <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{brandTagline}</div>}
          </div>
        </Link>

        <div className="hidden flex-1 md:block">
          <div className="mx-auto max-w-xl">
            <input
              type="text"
              placeholder={labels.search}
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none ring-0 transition focus:border-brand-500"
            />
          </div>
        </div>

        <div className="hidden items-center gap-3 text-sm text-slate-700 md:flex">
          <select className="rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none">
            <option>Delhi</option>
            {locations.filter((city) => city !== 'Delhi').map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <select aria-label={labels.language} value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none">{languages.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select>
          <Link to="/cart" className="relative flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 hover:bg-slate-50">
            <span>🛒</span>
            <span>{labels.cart}</span>
            {cartCount > 0 && <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-xs text-white">{cartCount}</span>}
          </Link>
          <Link to="/products" className="secondary-btn">{labels.guest}</Link>
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/account" className="rounded-full border border-slate-200 px-3 py-2 hover:bg-slate-50">{labels.account}</Link>
              <button onClick={handleLogout} className="secondary-btn">{labels.logout}</button>
            </div>
          ) : (
            <Link to="/login" className="primary-btn">{labels.login}</Link>
          )}
        </div>
      </div>
      <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2 md:hidden">
        <div className="flex items-center gap-2">
          <select className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-sm">
            <option>Delhi</option>
            {locations.filter((city) => city !== 'Delhi').map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
