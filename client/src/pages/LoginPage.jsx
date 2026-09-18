import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';

export default function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const t = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = mode === 'login' ? '/api/login' : '/api/register';
    const payload = mode === 'login' ? { email: form.email, password: form.password } : form;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message || 'Unable to complete request.');
      return;
    }

    setUser(data.user);
    navigate(mode === 'login' && data.user.role === 'ADMIN' ? '/admin' : '/account');
  };

  return (
    <div className="mx-auto max-w-lg pb-12">
      <div className="card p-8">
        <div className="mb-6 flex gap-3">
          <button type="button" onClick={() => setMode('login')} className={`flex-1 rounded-xl px-4 py-2 font-semibold ${mode === 'login' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{t.login}</button>
          <button type="button" onClick={() => setMode('register')} className={`flex-1 rounded-xl px-4 py-2 font-semibold ${mode === 'register' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{t.createAccount}</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.fullName} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" />
          )}
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" />
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={t.password} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button type="submit" className="primary-btn w-full">{mode === 'login' ? t.login : t.createAccount}</button>
        </form>
      </div>
    </div>
  );
}
