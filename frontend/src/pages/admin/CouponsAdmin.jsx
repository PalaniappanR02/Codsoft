import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, Ticket, ToggleLeft, ToggleRight } from 'lucide-react';
import { base44 } from '@/api/apiClient';
import { useSettings } from '@/lib/SettingsContext';
import { formatCurrency } from '@/lib/format';
import AdminModal from '@/components/admin/AdminModal';
import toast from 'react-hot-toast';

const emptyCoupon = { code: '', type: 'percent', value: 10, min_order: 0, max_uses: 100, max_uses_per_user: 1, starts_at: '', expires_at: '', active: true, description: '' };

export default function CouponsAdmin() {
  const { settings } = useSettings();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyCoupon);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setCoupons((await base44.entities.Coupon.list('-created_date', 100)) || []); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const openAdd = () => { setEditing(null); setFormData(emptyCoupon); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setFormData({ ...emptyCoupon, ...c }); setModalOpen(true); };

  const handleSave = async () => {
    if (!formData.code.trim()) { toast.error('Code is required'); return; }
    setSaving(true);
    try {
      const data = { ...formData, code: formData.code.toUpperCase().trim(), value: Number(formData.value) || 0, min_order: Number(formData.min_order) || 0, max_uses: Number(formData.max_uses) || null, max_uses_per_user: Number(formData.max_uses_per_user) || 1 };
      if (editing) { await base44.entities.Coupon.update(editing.id, data); toast.success('Coupon updated'); }
      else { await base44.entities.Coupon.create(data); toast.success('Coupon created'); }
      setModalOpen(false); refresh();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (c) => {
    try { await base44.entities.Coupon.update(c.id, { active: !c.active }); refresh(); toast.success(`Coupon ${!c.active ? 'activated' : 'deactivated'}`); }
    catch { toast.error('Update failed'); }
  };

  const handleDelete = async (c) => {
    if (window.confirm(`Delete coupon "${c.code}"?`)) {
      try { await base44.entities.Coupon.delete(c.id); toast.success('Deleted'); refresh(); }
      catch { toast.error('Delete failed'); }
    }
  };

  const typeLabel = (t) => t === 'percent' ? '%' : t === 'flat' ? settings.currency_symbol : 'Free Ship';

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Ticket className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground mb-2">No coupons yet</p>
          <button onClick={openAdd} className="text-brand hover:underline">Create your first coupon</button>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Code</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Value</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Min Order</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Usage</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/30 transition">
                  <td className="px-4 py-3"><span className="font-mono-price font-bold bg-muted px-2 py-1 rounded">{c.code}</span></td>
                  <td className="px-4 py-3 capitalize">{c.type}</td>
                  <td className="px-4 py-3 font-mono-price font-medium">{c.type === 'free_shipping' ? '—' : `${c.value}${typeLabel(c.type)}`}</td>
                  <td className="px-4 py-3 hidden sm:table-cell font-mono-price">{c.min_order ? formatCurrency(c.min_order, settings) : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.used_count || 0}/{c.max_uses || '∞'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(c)} className={c.active ? 'text-green-600' : 'text-muted-foreground'}>
                      {c.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-2 hover:bg-muted rounded-lg transition"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                      <button onClick={() => handleDelete(c)} className="p-2 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Coupon' : 'Add Coupon'}
        footer={<>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
        </>}>
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Code *</label><input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand font-mono-price uppercase" /></div>
            <div><label className="text-sm font-medium mb-1 block">Type</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand bg-white"><option value="percent">Percentage</option><option value="flat">Flat Amount</option><option value="free_shipping">Free Shipping</option></select></div>
          </div>
          {formData.type !== 'free_shipping' && (
            <div><label className="text-sm font-medium mb-1 block">{formData.type === 'percent' ? 'Discount %' : 'Discount Amount'}</label><input type="number" step="0.01" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand font-mono-price" /></div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Minimum Order</label><input type="number" step="0.01" value={formData.min_order} onChange={(e) => setFormData({ ...formData, min_order: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand font-mono-price" /></div>
            <div><label className="text-sm font-medium mb-1 block">Max Uses</label><input type="number" value={formData.max_uses} onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand font-mono-price" /></div>
          </div>
          <div><label className="text-sm font-medium mb-1 block">Max Uses Per User</label><input type="number" value={formData.max_uses_per_user} onChange={(e) => setFormData({ ...formData, max_uses_per_user: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand font-mono-price" /></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Starts At</label><input type="date" value={formData.starts_at?.split('T')[0] || ''} onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand" /></div>
            <div><label className="text-sm font-medium mb-1 block">Expires At</label><input type="date" value={formData.expires_at?.split('T')[0] || ''} onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand" /></div>
          </div>
          <div><label className="text-sm font-medium mb-1 block">Description</label><input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Internal note" className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand" /></div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4 accent-brand" /><span className="text-sm">Active</span></label>
        </div>
      </AdminModal>
    </div>
  );
}