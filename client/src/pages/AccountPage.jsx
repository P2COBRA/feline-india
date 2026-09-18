import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n';

export default function AccountPage({ user }) {
  const t = useTranslation();
  const [orders, setOrders] = useState([]);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');

  useEffect(() => {
    if (!user) return;
    fetch('/api/orders/my', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, [user]);

  const uploadProfileImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    const upload = await fetch('/api/upload', { method: 'POST', body, credentials: 'include' });
    const uploaded = await upload.json();
    if (!upload.ok) return window.alert(uploaded.message || 'Upload failed.');
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ profileImage: uploaded.url })
    });
    const data = await response.json();
    if (response.ok) setProfileImage(data.user.profileImage);
  };

  if (!user) {
    return <div className="card p-8 text-center">{t.login} to view your account.</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <label className="cursor-pointer">
            <img src={profileImage || '/images/profile-placeholder.svg'} alt="Profile" className="h-20 w-20 rounded-full object-cover ring-4 ring-brand-100" />
            <input type="file" accept="image/*" onChange={uploadProfileImage} className="hidden" />
          </label>
          <div><h1 className="text-3xl font-black text-slate-800">{t.account}</h1>
        <p className="mt-2 text-slate-600">{t.welcome}, {user.name}</p>
          <p className="mt-1 text-xs text-slate-500">{t.profileHint}</p></div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-xl font-bold">{t.orderHistory}</h2>
        <div className="space-y-3">
          {orders.length ? orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Order #{order.id}</span>
                <span className="badge bg-brand-100 text-brand-700">{order.status}</span>
              </div>
              <div className="mt-2 text-sm text-slate-600">Total: ₹{order.total}</div>
            </div>
          )) : <div className="text-slate-500">{t.noOrders}</div>}
        </div>
      </div>
    </div>
  );
}
