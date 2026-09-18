import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OffersPage from './pages/OffersPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ReturnPolicyPage from './pages/ReturnPolicyPage';
import AccountPage from './pages/AccountPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import { getTranslation, LanguageContext } from './i18n';

function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [language, setLanguage] = useState(localStorage.getItem('feline-language') || 'en');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const t = getTranslation(language);

  useEffect(() => {
    const bootstrap = async () => {
      setCart(JSON.parse(localStorage.getItem('feline-cart') || '[]'));
      const session = await fetch('/api/me', { credentials: 'include' }).then((res) => res.json());
      let currentUser = session.user;

      if (!currentUser && window.location.pathname.startsWith('/admin')) {
        const autoLogin = await fetch('/api/admin/auto-login', { method: 'POST', credentials: 'include' });
        if (autoLogin.ok) currentUser = (await autoLogin.json()).user;
      }

      const siteSettings = await fetch('/api/settings').then((res) => res.json());
      setUser(currentUser);
      setSettings(siteSettings);
      setLoading(false);
    };

    bootstrap();
  }, []);

  useEffect(() => {
    localStorage.setItem('feline-language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('feline-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => item.id === product.id ? { ...item, qty: item.qty + qty } : item);
      }
      return [...current, { ...product, qty }];
    });
  };

  const updateCartQty = (id, qty) => {
    setCart((current) => current.map((item) => (item.id === id ? { ...item, qty: Math.max(1, qty) } : item)).filter((item) => item.qty > 0));
  };

  const removeFromCart = (id) => setCart((current) => current.filter((item) => item.id !== id));
  const clearCart = () => setCart([]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-lg font-semibold text-slate-700">Loading FELINE INDIA...</div>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="bg-slate-900 px-4 py-2 text-center text-sm text-slate-200">
        FELINE INDIA is a demo pharmaceutical platform. {t.disclaimer} Prescription medicines will only be dispensed against a valid prescription.
      </div>
      <Navbar user={user} setUser={setUser} cartCount={cart.reduce((sum, item) => sum + item.qty, 0)} logoUrl={settings.logoUrl} brandName={settings.brandName} brandTagline={settings.brandTagline} />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Routes>
          <Route path="/" element={<HomePage addToCart={addToCart} />} />
          <Route path="/products" element={<ProductsPage addToCart={addToCart} />} />
          <Route path="/products/:productId" element={<ProductDetailPage addToCart={addToCart} />} />
          <Route path="/cart" element={<CartPage cart={cart} updateCartQty={updateCartQty} removeFromCart={removeFromCart} clearCart={clearCart} />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} clearCart={clearCart} user={user} />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/returns" element={<ReturnPolicyPage />} />
          <Route path="/account" element={<AccountPage user={user} />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/admin/*" element={<AdminPage user={user} />} />
        </Routes>
      </main>
      <Footer />
    </div>
    </LanguageContext.Provider>
  );
}

export default App;
