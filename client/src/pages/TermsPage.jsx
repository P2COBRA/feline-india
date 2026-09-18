import { useTranslation } from '../i18n';

export default function TermsPage() {
  const t = useTranslation();
  return (
    <div className="card p-8">
      <h1 className="text-3xl font-black text-slate-800">{t.termsTitle}</h1>
      <p className="mt-4 text-slate-600">{t.termsText}</p>
    </div>
  );
}
