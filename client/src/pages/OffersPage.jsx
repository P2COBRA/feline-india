import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n';

export default function OffersPage() {
  const t = useTranslation();
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    fetch('/api/offers').then((res) => res.json()).then((data) => setOffers(data));
  }, []);

  return (
    <div className="pb-12">
      <h1 className="mb-6 text-3xl font-black text-slate-800">{t.offers}</h1>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {offers.map((offer) => (
          <div key={offer.id} className="card p-5">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">{offer.code}</div>
            <div className="mt-3 text-3xl font-black text-emerald-700">{offer.type === 'PERCENTAGE' ? `${offer.value}%` : `₹${offer.value}`}</div>
            <p className="mt-2 text-sm text-slate-600">{t.applicable} ₹{offer.minOrderValue}.</p>
            <div className="mt-4 text-xs text-slate-500">{t.expires} {new Date(offer.expiryDate).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
