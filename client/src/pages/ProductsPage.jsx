import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { useTranslation } from '../i18n';

export default function ProductsPage({ addToCart }) {
  const [products, setProducts] = useState([]);
  const t = useTranslation();
  const [filters, setFilters] = useState({ search: '', category: '', sortBy: 'popularity' });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, [filters]);

  return (
    <div className="space-y-6 pb-12">
      <div className="card p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <input
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder={t.search}
            className="rounded-xl border border-slate-200 px-3 py-2.5"
          />
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5">
            <option value="">{t.allCategories}</option>
            <option value="pain-relief">Pain Relief</option>
          </select>
          <select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5">
            <option value="popularity">{t.popularity}</option>
            <option value="price-asc">{t.lowHigh}</option>
            <option value="price-desc">{t.highLow}</option>
            <option value="discount">{t.discount}</option>
          </select>
          <button className="primary-btn">{t.apply}</button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {products.length ? products.map((product) => <ProductCard key={product.id} product={product} addToCart={addToCart} />) : <div className="col-span-full card p-8 text-center text-slate-500">{t.noMedicines}</div>}
      </div>
    </div>
  );
}
