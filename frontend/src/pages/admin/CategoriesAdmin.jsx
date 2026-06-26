import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, Upload, Loader2, FolderTree } from 'lucide-react';
import { base44 } from '@/api/apiClient';
import { slugify } from '@/lib/format';
import AdminModal from '@/components/admin/AdminModal';
import toast from 'react-hot-toast';

const emptyCat = { name: '', slug: '', description: '', image_url: '', sort_order: 0, active: true };

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyCat);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setCategories((await base44.entities.Category.list('sort_order', 100)) || []); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setFormData(emptyCat); setModalOpen(true); };
  const openEdit = (cat) => { setEditing(cat); setFormData({ ...emptyCat, ...cat }); setModalOpen(true); };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
      toast.success('Image uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const data = { ...formData, slug: formData.slug || slugify(formData.name) };
      if (editing) { await base44.entities.Category.update(editing.id, data); toast.success('Category updated'); }
      else { await base44.entities.Category.create(data); toast.success('Category created'); }
      setModalOpen(false); refresh();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (cat) => {
    if (window.confirm(`Delete "${cat.name}"?`)) {
      try { await base44.entities.Category.delete(cat.id); toast.success('Deleted'); refresh(); }
      catch { toast.error('Delete failed'); }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..." className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand bg-white" />
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderTree className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground mb-2">No categories found</p>
          <button onClick={openAdd} className="text-brand hover:underline">Add your first category</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(cat => (
            <div key={cat.id} className="bg-white border border-border rounded-xl overflow-hidden card-hover-lift">
              <div className="aspect-[3/2] bg-muted">
                {cat.image_url ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground/20"><FolderTree className="w-10 h-10" /></div>}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold">{cat.name}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded ${cat.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{cat.active ? 'Active' : 'Inactive'}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{cat.description || 'No description'}</p>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="flex-1 py-2 border border-border rounded-lg text-sm hover:bg-muted transition flex items-center justify-center gap-1"><Pencil className="w-3 h-3" /> Edit</button>
                  <button onClick={() => handleDelete(cat)} className="p-2 border border-border rounded-lg hover:bg-red-50 transition"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}
        footer={<>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
        </>}>
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: formData.slug || slugify(e.target.value) })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand" /></div>
            <div><label className="text-sm font-medium mb-1 block">Slug</label><input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand font-mono-price" /></div>
          </div>
          <div><label className="text-sm font-medium mb-1 block">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="2" className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand resize-none" /></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Sort Order</label><input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand font-mono-price" /></div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2"><input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4 accent-brand" /><span className="text-sm">Active</span></label>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Category Image</label>
            {formData.image_url && <img src={formData.image_url} alt="" className="w-full h-32 object-cover rounded-lg border border-border mb-2" />}
            <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-brand transition">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin text-brand" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
              <span className="text-sm text-muted-foreground">Upload image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}