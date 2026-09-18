import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';

export default function CheckoutPage({ cart, clearCart, user }) {
  const t = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'Cash on Delivery'
  });
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = subtotal > 0 ? 49 : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cart.length) return;

    const payload = {
      items: cart,
      shippingAddress: { ...form },
      paymentMethod: form.paymentMethod,
      total: subtotal + delivery
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      clearCart();
      navigate('/account');
    }
  };

  return (
    <div className="grid gap-6 pb-12 lg:grid-cols-[1.3fr_0.7fr]">
      <form onSubmit={handleSubmit} className="card p-5">
        <h1 className="mb-5 text-2xl font-black text-slate-800">{t.checkout}</h1>
        <div className="grid gap-4 md:grid-cols-2">
          <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder={t.fullName} className="rounded-xl border border-slate-200 px-3 py-2.5" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t.phone} className="rounded-xl border border-slate-200 px-3 py-2.5" />
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="md:col-span-2 rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Street address, house, apartment" />
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="rounded-xl border border-slate-200 px-3 py-2.5" />
          <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className="rounded-xl border border-slate-200 px-3 py-2.5" />
          <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="Pincode" className="rounded-xl border border-slate-200 px-3 py-2.5" />
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-bold text-slate-800">{t.payment}</h2>
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2"><input type="radio" name="payment" checked={form.paymentMethod === 'Cash on Delivery'} onChange={() => setForm({ ...form, paymentMethod: 'Cash on Delivery' })} /> {t.cash}</label>
            <label className="flex items-center gap-2"><input type="radio" name="payment" checked={form.paymentMethod === 'UPI'} onChange={() => setForm({ ...form, paymentMethod: 'UPI' })} /> {t.upi}</label>
          </div>
        </div>

        <button type="submit" className="primary-btn mt-6 w-full">{t.placeOrder}</button>
      </form>

      <div className="card h-fit p-5">
        <h2 className="text-xl font-bold text-slate-800">{t.orderSummary}</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between gap-3">
              <span>{item.name} × {item.qty}</span>
              <span>₹{item.price * item.qty}</span>
            </div>
          ))}
          <div className="border-t border-slate-200 pt-3 flex justify-between"><span>{t.subtotal}</span><span>₹{subtotal}</span></div>
          <div className="flex justify-between"><span>{t.delivery}</span><span>₹{delivery}</span></div>
          <div className="flex justify-between font-bold text-slate-800"><span>{t.total}</span><span>₹{subtotal + delivery}</span></div>
        </div>
      </div>
    </div>
  );
}
