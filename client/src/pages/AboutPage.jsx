import { useTranslation } from '../i18n';

export default function AboutPage() {
  const t = useTranslation();
  return (
    <div className="card p-8">
      <h1 className="text-3xl font-black text-slate-800">{t.aboutTitle}</h1>
      <p className="mt-4 text-slate-600">{t.aboutText}</p>
      <p className="mt-4 text-slate-600">{t.demoText}</p>
    </div>
  );
}
