import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useTranslation } from '../i18n';

export default function HomePage({ addToCart }) {
  const t = useTranslation();
  const [banners, setBanners] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/banners').then((res) => res.json()),
      fetch('/api/products').then((res) => res.json()),
      fetch('/api/categories').then((res) => res.json()),
      fetch('/api/offers').then((res) => res.json())
    ]).then(([bannerData, products, categoryData, offersData]) => {
      setBanners(bannerData);
      setFeatured(products.slice(0, 4));
      setCategories(categoryData.slice(0, 6));
      setOffers(offersData);
    });
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-cyan-500 p-6 text-white shadow-soft">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div>
            <div className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">{t.fresh}</div>
            <h1 className="text-3xl font-black md:text-5xl">{t.heroTitle}</h1>
            <p className="mt-4 max-w-lg text-sm text-cyan-50 md:text-base">{t.heroText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/products" className="rounded-xl bg-white px-5 py-3 font-semibold text-brand-700">{t.shop}</Link>
              <Link to="/offers" className="rounded-xl border border-white/40 px-5 py-3 font-semibold text-white">{t.viewOffers}</Link>
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-3 backdrop-blur">
            <div className="grid grid-cols-2 gap-3">
              {banners.length ? banners.slice(0, 4).map((banner) => (
                <div key={banner.id} className="overflow-hidden rounded-2xl bg-white/10">
                  <img src={banner.imageUrl || '/images/banner-1.svg'} alt={banner.title} className="h-28 w-full object-cover" />
                </div>
              )) : (
                <>
                  <div className="h-28 rounded-2xl bg-white/10" />
                  <div className="h-28 rounded-2xl bg-white/10" />
                  <div className="h-28 rounded-2xl bg-white/10" />
                  <div className="h-28 rounded-2xl bg-white/10" />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">{t.categories}</h2>
          <Link to="/products" className="text-sm font-semibold text-brand-700">{t.seeAll}</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {categories.map((category) => (
            <div key={category.id} className="card p-4 text-center">
              <img src={category.imageUrl || '/images/category-pain.svg'} alt={category.name} className="mx-auto h-16 w-16 rounded-2xl object-cover" />
              <div className="mt-3 font-semibold text-slate-700">{category.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">{t.offers}</h2>
          <Link to="/offers" className="text-sm font-semibold text-brand-700">{t.viewOffers}</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {offers.map((offer) => (
            <div key={offer.id} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">{offer.code}</div>
              <div className="mt-2 text-2xl font-black text-emerald-700">{offer.type === 'PERCENTAGE' ? `${offer.value}% OFF` : `₹${offer.value} OFF`}</div>
              <p className="mt-2 text-sm text-slate-600">Min. order ₹{offer.minOrderValue}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">{t.featured}</h2>
          <Link to="/products" className="text-sm font-semibold text-brand-700">{t.explore}</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featured.map((product) => <ProductCard key={product.id} product={product} addToCart={addToCart} />)}
        </div>
      </section>

      <section className="card p-5">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ['✅', '100% Genuine Products'],
            ['🩺', 'Licensed Pharmacy'],
            ['🚚', 'Fast Delivery'],
            ['↩️', 'Easy Returns']
          ].map(([icon, text]) => (
            <div key={text} className="rounded-2xl bg-slate-50 p-4 text-center">
              <div className="text-2xl">{icon}</div>
              <div className="mt-2 text-sm font-semibold text-slate-700">{text}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
