import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';

export default function Footer() {
  const t = useTranslation();
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4 md:px-6">
        <div>
          <div className="mb-4 text-xl font-black tracking-wide text-brand-700">FELINE INDIA</div>
          <p className="text-sm text-slate-600">{t.heroTitle}</p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">{t.company}</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link to="/about">{t.about}</Link></li>
            <li><Link to="/contact">{t.contact}</Link></li>
            <li><Link to="/terms">{t.terms}</Link></li>
            <li><Link to="/privacy">{t.privacy}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">{t.policies}</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link to="/returns">{t.returns}</Link></li>
            <li><Link to="/offers">{t.offers}</Link></li>
            <li><a href="mailto:support@felineindia.com">support@felineindia.com</a></li>
            <li><a href="tel:+919999999999">+91 99999 99999</a></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">{t.follow}</h3>
          <div className="flex gap-3 text-sm text-slate-600">
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
            <a href="#">X</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
