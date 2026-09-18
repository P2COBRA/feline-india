import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';

export default function CartPage({ cart, updateCartQty, removeFromCart, clearCart }) {
  const t = useTranslation();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = subtotal > 0 ? 49 : 0;

  if (!cart.length) {
    return (
      <div className="card p-10 text-center">
        <h1 className="text-2xl font-black text-slate-800">{t.emptyCart}</h1>
        <p className="mt-3 text-slate-600">{t.browse}</p>
        <Link to="/products" className="primary-btn mt-5 inline-block">{t.continueShopping}</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 pb-12 lg:grid-cols-[1.6fr_0.8fr]">
      <div className="card p-5">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-800">{t.cart}</h1>
          <button onClick={clearCart} className="text-sm font-semibold text-red-600">{t.clearCart}</button>
        </div>
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <img src={item.images?.[0] || '/images/paracetamol-front.svg'} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
                <div>
                  <div className="font-bold text-slate-800">{item.name}</div>
                  <div className="text-sm text-slate-500">{item.saltComposition}</div>
                  <div className="mt-1 text-brand-700 font-bold">₹{item.price}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => updateCartQty(item.id, item.qty - 1)} className="secondary-btn px-3 py-2">-</button>
                <span className="min-w-8 text-center font-semibold">{item.qty}</span>
                <button onClick={() => updateCartQty(item.id, item.qty + 1)} className="secondary-btn px-3 py-2">+</button>
                <button onClick={() => removeFromCart(item.id)} className="text-sm font-semibold text-red-600">{t.remove}</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card h-fit p-5">
        <h2 className="text-xl font-bold text-slate-800">{t.summary}</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div className="flex justify-between"><span>{t.subtotal}</span><span>₹{subtotal}</span></div>
          <div className="flex justify-between"><span>{t.delivery}</span><span>₹{delivery}</span></div>
          <div className="flex justify-between font-bold text-slate-800"><span>{t.total}</span><span>₹{subtotal + delivery}</span></div>
        </div>
        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <input placeholder={t.coupon} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <Link to="/checkout" className="primary-btn mt-5 block text-center">{t.checkout}</Link>
      </div>
    </div>
  );
}
