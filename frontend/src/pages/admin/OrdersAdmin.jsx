import React, { useEffect, useState, useCallback } from 'react';
import { Search, Loader2, Truck, Save, Eye } from 'lucide-react';
import { base44 } from '@/api/apiClient';
import { useSettings } from '@/lib/SettingsContext';
import { formatCurrency, formatDate, statusColors } from '@/lib/format';
import AdminModal from '@/components/admin/AdminModal';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function OrdersAdmin() {
  const { settings } = useSettings();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({ status: '', tracking_number: '' });
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Order.list('-created_date', 500);
      setOrders(data || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openOrder = (order) => {
    setSelectedOrder(order);
    setUpdateData({ status: order.status, tracking_number: order.tracking_number || '' });
    setModalOpen(true);
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await base44.entities.Order.update(selectedOrder.id, {
        status: updateData.status,
        tracking_number: updateData.tracking_number || null,
      });
      toast.success('Order updated');
      setModalOpen(false);
      refresh();
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order #, name, email..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand bg-white" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand bg-white">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order #</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Payment</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/30 transition cursor-pointer" onClick={() => openOrder(o)}>
                  <td className="px-4 py-3 font-mono-price font-medium text-xs">{o.order_number}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{formatDate(o.created_date)}</td>
                  <td className="px-4 py-3 font-mono-price font-medium">{formatCurrency(o.total, settings)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors(o.status)}`}>{o.status}</span></td>
                  <td className="px-4 py-3 hidden lg:table-cell"><span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors(o.payment_status)}`}>{o.payment_status}</span></td>
                  <td className="px-4 py-3 text-right"><button className="p-2 hover:bg-muted rounded-lg transition inline-flex"><Eye className="w-4 h-4 text-muted-foreground" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={`Order ${selectedOrder?.order_number || ''}`} size="lg"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition">Close</button>
            <button onClick={handleUpdate} disabled={saving} className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
            </button>
          </>
        }>
        {selectedOrder && (
          <div className="space-y-4">
            {/* Customer info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-3">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Customer</h4>
                <p className="font-medium text-sm">{selectedOrder.customer_name}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.customer_email}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.customer_phone}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Shipping Address</h4>
                <div className="text-sm text-muted-foreground">
                  <p>{selectedOrder.shipping_address?.line1}</p>
                  {selectedOrder.shipping_address?.line2 && <p>{selectedOrder.shipping_address.line2}</p>}
                  <p>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.pincode}</p>
                  <p>{selectedOrder.shipping_address?.country}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Order Items</h4>
              <div className="border border-border rounded-lg overflow-hidden">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 ${i % 2 === 0 ? 'bg-muted/20' : ''}`}>
                    <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden shrink-0">
                      {item.image_url && <img src={item.image_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product_name}</p>
                      {item.variant_label && <p className="text-xs text-muted-foreground">{item.variant_label}</p>}
                    </div>
                    <span className="text-sm text-muted-foreground">{item.quantity}×</span>
                    <span className="font-mono-price text-sm font-medium">{formatCurrency(item.total_price, settings)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-muted/30 rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-mono-price">{formatCurrency(selectedOrder.subtotal, settings)}</span></div>
              {selectedOrder.discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-600">Discount</span><span className="font-mono-price text-green-600">−{formatCurrency(selectedOrder.discount, settings)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span className="font-mono-price">{formatCurrency(selectedOrder.shipping_fee, settings)}</span></div>
              {selectedOrder.tax > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span className="font-mono-price">{formatCurrency(selectedOrder.tax, settings)}</span></div>}
              <div className="flex justify-between font-semibold pt-1 border-t border-border"><span>Total</span><span className="font-mono-price">{formatCurrency(selectedOrder.total, settings)}</span></div>
            </div>

            {/* Status update */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Order Status</label>
                <select value={updateData.status} onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand bg-white">
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tracking Number</label>
                <div className="relative">
                  <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={updateData.tracking_number} onChange={(e) => setUpdateData({ ...updateData, tracking_number: e.target.value })} placeholder="Add tracking number..." className="w-full pl-10 pr-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand" />
                </div>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-amber-700 mb-1">Customer Notes</p>
                <p className="text-sm text-amber-800">{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </div>
  );
}