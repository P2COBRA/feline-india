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
  const [categoryDraft, setCategoryDraft] = useState({ id: null, name: '', description: '', imageUrl: '' });
  const [bannerDraft, setBannerDraft] = useState({ id: null, title: '', imageUrl: '', link: '/products', active: true });
  const [offerDraft, setOfferDraft] = useState({ id: null, code: '', type: 'PERCENTAGE', value: 10, minOrderValue: 0, expiryDate: '' });

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

  const saveRecord = async (resource, draft, setDraft) => {
    const { id } = draft;
    const payload = resource === 'categories'
      ? { name: draft.name, description: draft.description || '', imageUrl: draft.imageUrl || '' }
      : resource === 'banners'
        ? { title: draft.title, imageUrl: draft.imageUrl, link: draft.link || '/products', active: draft.active !== false }
        : { code: draft.code, type: draft.type, value: Number(draft.value), minOrderValue: Number(draft.minOrderValue || 0), expiryDate: draft.expiryDate, active: draft.active !== false };
    const response = await fetch(`/api/admin/${resource}${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    if (!response.ok) return window.alert(`Could not save ${resource}.`);
    setDraft(resource === 'categories' ? { id: null, name: '', description: '', imageUrl: '' } : resource === 'banners' ? { id: null, title: '', imageUrl: '', link: '/products', active: true } : { id: null, code: '', type: 'PERCENTAGE', value: 10, minOrderValue: 0, expiryDate: '' });
    loadData();
  };

  const deleteRecord = async (resource, id) => {
    if (!window.confirm(`Delete this ${resource.slice(0, -1)}?`)) return;
    const response = await fetch(`/api/admin/${resource}/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!response.ok) window.alert(`Could not delete ${resource}. It may still be in use.`);
    loadData();
  };

  const updateOrderStatus = async (order, status) => {
    await fetch(`/api/admin/orders/${order.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status })
    });
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

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 text-xl font-bold">Categories</h2>
          <form onSubmit={(event) => { event.preventDefault(); saveRecord('categories', categoryDraft, setCategoryDraft); }} className="mb-4 grid gap-2">
            <input className="input" placeholder="Category name" value={categoryDraft.name} onChange={(event) => setCategoryDraft({ ...categoryDraft, name: event.target.value })} required />
            <input className="input" placeholder="Description" value={categoryDraft.description} onChange={(event) => setCategoryDraft({ ...categoryDraft, description: event.target.value })} />
            <input className="input" placeholder="Image URL" value={categoryDraft.imageUrl} onChange={(event) => setCategoryDraft({ ...categoryDraft, imageUrl: event.target.value })} />
            <button className="primary-btn" type="submit">{categoryDraft.id ? 'Save category' : 'Add category'}</button>
          </form>
          <div className="space-y-2">{categories.map((category) => <div key={category.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3"><span>{category.name}</span><span className="flex gap-2"><button className="secondary-btn" onClick={() => setCategoryDraft(category)}>Edit</button><button className="secondary-btn text-rose-600" onClick={() => deleteRecord('categories', category.id)}>Delete</button></span></div>)}</div>
        </div>
        <div className="card p-5">
          <h2 className="mb-4 text-xl font-bold">Banners</h2>
          <form onSubmit={(event) => { event.preventDefault(); saveRecord('banners', bannerDraft, setBannerDraft); }} className="mb-4 grid gap-2">
            <input className="input" placeholder="Banner title" value={bannerDraft.title} onChange={(event) => setBannerDraft({ ...bannerDraft, title: event.target.value })} required />
            <input className="input" placeholder="Image URL" value={bannerDraft.imageUrl} onChange={(event) => setBannerDraft({ ...bannerDraft, imageUrl: event.target.value })} required />
            <input className="input" placeholder="Link" value={bannerDraft.link} onChange={(event) => setBannerDraft({ ...bannerDraft, link: event.target.value })} />
            <button className="primary-btn" type="submit">{bannerDraft.id ? 'Save banner' : 'Add banner'}</button>
          </form>
          <div className="space-y-2">{banners.map((banner) => <div key={banner.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3"><span>{banner.title}</span><span className="flex gap-2"><button className="secondary-btn" onClick={() => setBannerDraft(banner)}>Edit</button><button className="secondary-btn text-rose-600" onClick={() => deleteRecord('banners', banner.id)}>Delete</button></span></div>)}</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 text-xl font-bold">Coupons</h2>
          <form onSubmit={(event) => { event.preventDefault(); saveRecord('offers', offerDraft, setOfferDraft); }} className="mb-4 grid gap-2 md:grid-cols-2">
            <input className="input" placeholder="Coupon code" value={offerDraft.code} onChange={(event) => setOfferDraft({ ...offerDraft, code: event.target.value })} required />
            <select className="input" value={offerDraft.type} onChange={(event) => setOfferDraft({ ...offerDraft, type: event.target.value })}><option value="PERCENTAGE">Percentage</option><option value="FLAT">Flat amount</option></select>
            <input className="input" type="number" placeholder="Value" value={offerDraft.value} onChange={(event) => setOfferDraft({ ...offerDraft, value: event.target.value })} required />
            <input className="input" type="number" placeholder="Minimum order" value={offerDraft.minOrderValue} onChange={(event) => setOfferDraft({ ...offerDraft, minOrderValue: event.target.value })} />
            <input className="input" type="date" value={offerDraft.expiryDate?.slice(0, 10) || ''} onChange={(event) => setOfferDraft({ ...offerDraft, expiryDate: event.target.value })} required />
            <button className="primary-btn" type="submit">{offerDraft.id ? 'Save coupon' : 'Add coupon'}</button>
          </form>
          <div className="space-y-2">{offers.map((offer) => <div key={offer.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3"><span>{offer.code} - {offer.value}{offer.type === 'PERCENTAGE' ? '%' : '₹'}</span><span className="flex gap-2"><button className="secondary-btn" onClick={() => setOfferDraft(offer)}>Edit</button><button className="secondary-btn text-rose-600" onClick={() => deleteRecord('offers', offer.id)}>Delete</button></span></div>)}</div>
        </div>
        <div className="card p-5">
          <h2 className="mb-4 text-xl font-bold">Orders</h2>
          <div className="space-y-2">{orders.length ? orders.map((order) => <div key={order.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3"><span>Order #{order.id} - ₹{order.total}</span><select className="input max-w-40" value={order.status} onChange={(event) => updateOrderStatus(order, event.target.value)}><option>Placed</option><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option></select></div>) : <p className="text-slate-500">No orders yet.</p>}</div>
        </div>
      </div>

      <div className="card p-5"><h2 className="mb-4 text-xl font-bold">Customer Messages</h2><div className="space-y-2">{messages.length ? messages.map((message) => <div key={message.id} className="rounded-xl bg-slate-50 p-3"><div className="font-semibold">{message.subject}</div><div className="text-sm text-slate-500">{message.name} · {message.email}</div><p className="mt-1 text-sm">{message.message}</p></div>) : <p className="text-slate-500">No messages yet.</p>}</div></div>
    </div>
  );
}
