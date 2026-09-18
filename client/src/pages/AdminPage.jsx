import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const emptyForm = {
  name: '', manufacturer: '', saltComposition: '', categoryName: '', mrp: '', price: '',
  discountPercent: 0, stock: 0, prescriptionRequired: false, description: '', uses: '',
  dosage: '', sideEffects: '', storage: '', featured: false
};

export default function AdminPage({ user }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [brandLogo, setBrandLogo] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandTagline, setBrandTagline] = useState('');

  const loadData = async () => {
    const response = await Promise.all([
      fetch('/api/admin/products', { credentials: 'include' }).then((res) => res.json()),
      fetch('/api/admin/categories', { credentials: 'include' }).then((res) => res.json()),
      fetch('/api/admin/banners', { credentials: 'include' }).then((res) => res.json()),
      fetch('/api/admin/offers', { credentials: 'include' }).then((res) => res.json()),
      fetch('/api/admin/orders', { credentials: 'include' }).then((res) => res.json()),
      fetch('/api/admin/messages', { credentials: 'include' }).then((res) => res.json())
    ]);
    setProducts(response[0]);
    setCategories(response[1]);
    setBanners(response[2]);
    setOffers(response[3]);
    setOrders(response[4]);
    setMessages(response[5]);
    const settings = await fetch('/api/settings').then((res) => res.json());
    setBrandLogo(settings.logoUrl || '');
    setBrandName(settings.brandName || '');
    setBrandTagline(settings.brandTagline || '');
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') loadData();
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <div className="card p-8 text-center">Admin access required.</div>;

  const startEdit = (product) => {
    setEditing(product.id);
    setForm({ ...emptyForm, ...product, images: product.images || [], categoryName: product.category?.name || '' });
  };

  const uploadFile = async (file) => {
    const body = new FormData();
    body.append('file', file);
    const response = await fetch('/api/upload', { method: 'POST', body, credentials: 'include' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Upload failed.');
    return data.url;
  };

  const uploadProductImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      setForm((current) => ({ ...current, images: [...(current.images || []), url] }));
    } catch (error) {
      window.alert(error.message);
    }
  };

  const uploadBrandLogo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      const response = await fetch('/api/admin/settings/logoUrl', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ value: url })
      });
      if (!response.ok) throw new Error('Could not save the logo.');
      setBrandLogo(url);
      window.alert('Logo updated. Refresh the storefront to see it.');
    } catch (error) {
      window.alert(error.message);
    }
  };

  const saveHeaderText = async (event) => {
    event.preventDefault();
    await Promise.all([
      fetch('/api/admin/settings/brandName', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ value: brandName }) }),
      fetch('/api/admin/settings/brandTagline', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ value: brandTagline }) })
    ]);
    window.alert('Header text updated. Refresh the storefront to see it.');
  };

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    const product = products.find((item) => item.id === editing);
    const editableFields = {
      name: form.name,
      manufacturer: form.manufacturer,
      saltComposition: form.saltComposition,
      categoryName: form.categoryName,
      mrp: form.mrp,
      price: form.price,
      discountPercent: form.discountPercent,
      stock: form.stock,
      prescriptionRequired: form.prescriptionRequired,
      description: form.description,
      uses: form.uses,
      dosage: form.dosage,
      sideEffects: form.sideEffects,
      storage: form.storage,
      featured: form.featured,
      images: form.images || product?.images || []
    };
    const response = await fetch(`/api/admin/products/${editing}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(editableFields)
    });
    if (!response.ok) return window.alert('Could not save this medicine.');
    setEditing(null);
    setForm(emptyForm);
    loadData();
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE', credentials: 'include' });
    loadData();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="card p-6">
        <h1 className="text-3xl font-black text-slate-800">Admin Dashboard</h1>
        <p className="mt-2 text-slate-500">Manage your medicine catalog and review store activity.</p>
      </div>

      <div className="card flex flex-wrap items-center gap-4 p-5">
        <img src={brandLogo || '/images/feline-logo.svg'} alt="Current logo" className="h-16 w-16 rounded-full object-cover" />
        <div><h2 className="font-bold">Brand logo</h2><p className="text-sm text-slate-500">Upload the logo shown in the storefront header.</p></div>
        <label className="primary-btn cursor-pointer md:ml-auto">Upload logo<input type="file" accept="image/*" onChange={uploadBrandLogo} className="hidden" /></label>
      </div>

      <form onSubmit={saveHeaderText} className="card grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="text-sm font-semibold text-slate-600">Header text<input value={brandName} onChange={(event) => setBrandName(event.target.value)} className="input mt-1 w-full" placeholder="FELINE INDIA" /></label>
        <label className="text-sm font-semibold text-slate-600">Header tagline<input value={brandTagline} onChange={(event) => setBrandTagline(event.target.value)} className="input mt-1 w-full" placeholder="Trusted Medicines" /></label>
        <button className="primary-btn" type="submit">Save header</button>
      </form>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="card p-5"><div className="text-sm text-slate-500">Products</div><div className="mt-3 text-3xl font-black">{products.length}</div></div>
        <div className="card p-5"><div className="text-sm text-slate-500">Orders</div><div className="mt-3 text-3xl font-black">{orders.length}</div></div>
        <div className="card p-5"><div className="text-sm text-slate-500">Messages</div><div className="mt-3 text-3xl font-black">{messages.length}</div></div>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-xl font-bold">Medicines</h2>
        {editing && <form onSubmit={saveProduct} className="mb-6 grid gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-2">
          <h3 className="text-lg font-bold md:col-span-2">Edit medicine</h3>
          {['name', 'manufacturer', 'saltComposition', 'mrp', 'price', 'discountPercent', 'stock', 'description', 'uses', 'dosage', 'sideEffects', 'storage'].map((field) => (
            <label key={field} className="text-sm font-semibold capitalize text-slate-600">
              {field.replace(/([A-Z])/g, ' $1')}
              <input name={field} value={form[field] ?? ''} onChange={updateField} type={['mrp', 'price', 'discountPercent', 'stock'].includes(field) ? 'number' : 'text'} className="input mt-1 w-full" required={['name', 'mrp', 'price'].includes(field)} />
            </label>
          ))}
          <label className="text-sm font-semibold text-slate-600">Category<select name="categoryName" value={form.categoryName} onChange={updateField} className="input mt-1 w-full">{categories.map((category) => <option key={category.id}>{category.name}</option>)}</select></label>
          <label className="flex items-center gap-2 pt-7 text-sm font-semibold"><input name="prescriptionRequired" type="checkbox" checked={form.prescriptionRequired} onChange={updateField} /> Prescription required</label>
          <label className="flex items-center gap-2 text-sm font-semibold"><input name="featured" type="checkbox" checked={form.featured} onChange={updateField} /> Featured medicine</label>
          <label className="text-sm font-semibold text-slate-600 md:col-span-2">Medicine image<input type="file" accept="image/*" onChange={uploadProductImage} className="input mt-1 block w-full" /><span className="mt-1 block text-xs font-normal text-slate-500">Uploaded images: {(form.images || []).length}</span></label>
          <div className="flex gap-2 md:col-span-2"><button className="primary-btn" type="submit">Save changes</button><button className="secondary-btn" type="button" onClick={() => setEditing(null)}>Cancel</button></div>
        </form>}
        <div className="space-y-3">{products.map((product) => <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"><div><span className="font-semibold">{product.name}</span><span className="ml-3 text-sm text-slate-500">Stock: {product.stock}</span></div><div className="flex items-center gap-2"><span className="badge bg-emerald-100 text-emerald-700">₹{product.price}</span><button className="secondary-btn" onClick={() => startEdit(product)}>Edit</button><button className="secondary-btn text-rose-600" onClick={() => deleteProduct(product)}>Delete</button></div></div>)}</div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2"><div className="card p-5"><h2 className="mb-4 text-xl font-bold">Categories</h2><div className="space-y-2">{categories.map((category) => <div key={category.id} className="rounded-xl bg-slate-50 p-3">{category.name}</div>)}</div></div><div className="card p-5"><h2 className="mb-4 text-xl font-bold">Banners</h2><div className="space-y-2">{banners.map((banner) => <div key={banner.id} className="rounded-xl bg-slate-50 p-3">{banner.title}</div>)}</div></div></div>
      <div className="grid gap-6 xl:grid-cols-2"><div className="card p-5"><h2 className="mb-4 text-xl font-bold">Coupons</h2><div className="space-y-2">{offers.map((offer) => <div key={offer.id} className="rounded-xl bg-slate-50 p-3">{offer.code} - {offer.value}%</div>)}</div></div><div className="card p-5"><h2 className="mb-4 text-xl font-bold">Customer Messages</h2><div className="space-y-2">{messages.map((message) => <div key={message.id} className="rounded-xl bg-slate-50 p-3">{message.subject}</div>)}</div></div></div>
    </div>
  );
}
