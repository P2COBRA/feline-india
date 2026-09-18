import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n';
import { useParams } from 'react-router-dom';

export default function ProductDetailPage({ addToCart }) {
  const t = useTranslation();
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => setProduct(data));
  }, [productId]);

  if (!product) return <div className="card p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="card p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {product.images?.map((image, idx) => (
              <img key={idx} src={image} alt={product.name} className="h-56 w-full rounded-2xl object-cover" />
            ))}
          </div>
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="badge bg-brand-100 text-brand-700">{product.category?.name || 'General'}</span>
              {product.prescriptionRequired && <span className="badge bg-red-100 text-red-700">{t.prescription}</span>}
            </div>
            <h1 className="text-3xl font-black text-slate-800">{product.name}</h1>
            <div className="mt-2 text-sm text-slate-500">{product.saltComposition}</div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-brand-700">₹{product.price}</span>
              <span className="text-lg text-slate-400 line-through">₹{product.mrp}</span>
              <span className="text-sm font-bold text-emerald-600">{product.discountPercent}% off</span>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button onClick={() => setQty((prev) => Math.max(1, prev - 1))} className="secondary-btn px-3 py-2">-</button>
              <span className="min-w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty((prev) => prev + 1)} className="secondary-btn px-3 py-2">+</button>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => addToCart(product, qty)} className="primary-btn">{t.addToCart}</button>
              <button className="secondary-btn">{t.buyNow}</button>
            </div>
            <div className="mt-5 text-sm text-slate-600">{product.stock > 0 ? `${t.inStock}: ${product.stock}` : t.outOfStock}</div>
            {product.prescriptionRequired && <button className="mt-3 secondary-btn w-full">Upload Prescription</button>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 text-xl font-bold">{t.details}</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <p><strong>{t.manufacturer}:</strong> {product.manufacturer}</p>
            <p><strong>Pack Size:</strong> 15 tablets</p>
            <p><strong>{t.uses}:</strong> {product.uses}</p>
            <p><strong>{t.dosage}:</strong> {product.dosage}</p>
            <p><strong>{t.sideEffects}:</strong> {product.sideEffects}</p>
            <p><strong>{t.storage}:</strong> {product.storage}</p>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="mb-4 text-xl font-bold">{t.reviews}</h2>
          <div className="space-y-3">
            {(product.reviews || []).slice(0, 3).map((review) => (
              <div key={review.id} className="rounded-xl bg-slate-50 p-3">
                <div className="font-semibold">{review.user?.name || 'Customer'}</div>
                <div className="text-yellow-500">{'★'.repeat(review.rating)}</div>
                <p className="text-sm text-slate-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
