import { Link } from 'react-router-dom';

export default function ProductCard({ product, addToCart }) {
  return (
    <div className="card overflow-hidden p-3">
      <Link to={`/products/${product.id}`} className="block overflow-hidden rounded-xl bg-slate-100">
        <img src={product.images?.[0] || '/images/paracetamol-front.svg'} alt={product.name} className="h-48 w-full object-cover" />
      </Link>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{product.category?.name || 'General'}</span>
          {product.prescriptionRequired ? <span className="badge bg-red-100 text-red-700">Prescription</span> : <span className="badge bg-emerald-100 text-emerald-700">In stock</span>}
        </div>
        <Link to={`/products/${product.id}`} className="block text-lg font-bold text-slate-800 hover:text-brand-700">{product.name}</Link>
        <p className="text-sm text-slate-500">{product.saltComposition}</p>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-700">₹{product.price}</span>
          <span className="text-sm text-slate-400 line-through">₹{product.mrp}</span>
          <span className="text-xs font-semibold text-emerald-600">{product.discountPercent}% off</span>
        </div>
        <button onClick={() => addToCart(product, 1)} className="primary-btn w-full">Add to Cart</button>
      </div>
    </div>
  );
}
