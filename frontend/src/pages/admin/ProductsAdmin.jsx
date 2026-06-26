import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, Upload, X, Loader2, Package } from 'lucide-react';
import { base44 } from '@/api/apiClient';
import { useSettings } from '@/lib/SettingsContext';
import { formatCurrency, slugify } from '@/lib/format';
import AdminModal from '@/components/admin/AdminModal';
import toast from 'react-hot-toast';

const emptyProduct = {
  name: '', slug: '', description: '', short_description: '',
  sku: '', category_id: '', category_name: '',
  price: 0, compare_price: 0, cost_price: 0,
  stock_qty: 0, low_stock_threshold: 5, track_inventory: true,
  images: [], tags: [], attributes: {},
  active: true, featured: false,
  seo_title: '', seo_description: '',
};

export default function ProductsAdmin() {
  const { settings } = useSettings();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        base44.entities.Product.list('-created_date', 500),
        base44.entities.Category.filter({ active: true }, 'sort_order', 50).catch(() => []),
      ]);
      setProducts(prods || []);
      setCategories(cats || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setFormData(emptyProduct);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setFormData({ ...emptyProduct, ...product });
    setModalOpen(true);
  };

  const handleNameChange = (e) => {
    setFormData({ ...formData, name: e.target.value, slug: formData.slug || slugify(e.target.value) });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(files.map(f => base44.integrations.Core.UploadFile({ file: f })));
      setFormData(prev => ({ ...prev, images: [...prev.images, ...results.map(r => r.file_url)] }));
      toast.success(`${files.length} image(s) uploaded`);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const removeImage = (idx) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Product name is required'); return; }
    if (!formData.slug.trim()) { toast.error('Slug is required'); return; }
    if (!formData.price || formData.price <= 0) { toast.error('Valid price is required'); return; }

    setSaving(true);
    try {
      const cat = categories.find(c => c.id === formData.category_id);
      const data = { ...formData, category_name: cat?.name || '', price: Number(formData.price), compare_price: Number(formData.compare_price) || 0, cost_price: Number(formData.cost_price) || 0, stock_qty: Number(formData.stock_qty) || 0 };

      if (editing) {
        await base44.entities.Product.update(editing.id, data);
        toast.success('Product updated');
      } else {
        await base44.entities.Product.create(data);
        toast.success('Product created');
      }
      setModalOpen(false);
      refresh();
    } catch (err) { toast.error('Failed to save product'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      try {
        await base44.entities.Product.delete(product.id);
        toast.success('Product deleted');
        refresh();
      } catch { toast.error('Delete failed'); }
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or SKU..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand bg-white" />
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground mb-2">No products found</p>
          <button onClick={openAdd} className="text-brand hover:underline">Add your first product</button>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">SKU</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden shrink-0">
                        {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">📦</div>}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[200px]">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.category_name || 'Uncategorized'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono-price text-xs hidden md:table-cell">{p.sku || '—'}</td>
                  <td className="px-4 py-3 font-mono-price font-medium">{formatCurrency(p.price, settings)}</td>
                  <td className="px-4 py-3">
                    <span className={p.track_inventory && p.stock_qty <= (p.low_stock_threshold || 5) ? 'text-amber-600 font-medium' : ''}>
                      {p.track_inventory ? p.stock_qty : '∞'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex gap-1">
                      {p.active ? <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded">Active</span> : <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">Draft</span>}
                      {p.featured && <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-600 rounded">Featured</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-2 hover:bg-muted rounded-lg transition" title="Edit"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                      <button onClick={() => handleDelete(p)} className="p-2 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} size="lg"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {editing ? 'Update' : 'Create'}
            </button>
          </>
        }>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Name *</label>
              <input type="text" value={formData.name} onChange={handleNameChange} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Slug *</label>
              <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand font-mono-price" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Short Description</label>
            <input type="text" value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand resize-none" />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">SKU</label>
              <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand font-mono-price" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand bg-white">
                <option value="">Select...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Price *</label>
              <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand font-mono-price" />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Compare Price</label>
              <input type="number" step="0.01" value={formData.compare_price} onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand font-mono-price" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Cost Price</label>
              <input type="number" step="0.01" value={formData.cost_price} onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand font-mono-price" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Stock Qty</label>
              <input type="number" value={formData.stock_qty} onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand font-mono-price" />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="text-sm font-medium mb-1 block">Product Images</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 group">
                  <img src={img} alt="" className="w-full h-full object-cover rounded-lg border border-border" />
                  <button onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-brand transition">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin text-brand" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium mb-1 block">Tags</label>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add tag..." className="flex-1 px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand" />
              <button onClick={addTag} className="px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted transition">Add</button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-xs rounded">
                    {tag} <button onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4 accent-brand" />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-4 h-4 accent-brand" />
              <span className="text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.track_inventory} onChange={(e) => setFormData({ ...formData, track_inventory: e.target.checked })} className="w-4 h-4 accent-brand" />
              <span className="text-sm">Track Inventory</span>
            </label>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}