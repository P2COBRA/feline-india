import { useState } from 'react';
import { useTranslation } from '../i18n';

export default function ContactPage() {
  const t = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setStatus(data.message || t.sent);
    if (res.ok) setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="card p-8">
      <h1 className="text-3xl font-black text-slate-800">{t.contact}</h1>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.yourName} className="rounded-xl border border-slate-200 px-3 py-2.5" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="Email" className="rounded-xl border border-slate-200 px-3 py-2.5" />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t.phone} className="rounded-xl border border-slate-200 px-3 py-2.5" />
        <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder={t.subject} className="rounded-xl border border-slate-200 px-3 py-2.5" />
        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t.message} className="md:col-span-2 min-h-36 rounded-xl border border-slate-200 px-3 py-2.5" />
        <div className="md:col-span-2">
          <button className="primary-btn" type="submit">{t.sendMessage}</button>
          {status && <div className="mt-3 text-sm text-slate-600">{status}</div>}
        </div>
      </form>
    </div>
  );
}
