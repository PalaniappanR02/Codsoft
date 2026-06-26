import React, { useEffect, useState, useCallback } from 'react';
import { Save, Loader2, AlertTriangle, Search } from 'lucide-react';
import { base44 } from '@/api/apiClient';
import { useSettings } from '@/lib/SettingsContext';
import { formatCurrency } from '@/lib/format';
import toast from 'react-hot-toast';

export default function InventoryAdmin() {
  const { settings } = useSettings();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [stockChanges, setStockChanges] = useState({});

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const prods = await base44.entities.Product.filter({ active: true }, '-created_date', 500);
      setProducts((prods || []).sort((a, b) => (a.stock_qty || 0) - (b.stock_qty || 0)));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase()));
  const hasChanges = Object.keys(stockChanges).length > 0;

  const handleStockChange = (productId, value) => {
    setStockChanges(prev => ({ ...prev, [productId]: value }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(stockChanges).map(([id, qty]) =>
          base44.entities.Product.update(id, { stock_qty: Number(qty) })
        )
      );
      toast.success(`${Object.keys(stockChanges).length} product(s) updated`);
      setStockChanges({});
      refresh();
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand bg-white" />
        </div>
        <button onClick={handleSaveAll} disabled={!hasChanges || saving} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes ({Object.keys(stockChanges).length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">SKU</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Threshold</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stock Qty</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const threshold = p.low_stock_threshold || 5;
                const isLow = p.track_inventory && p.stock_qty <= threshold;
                const isOut = p.track_inventory && p.stock_qty <= 0;
                const changedValue = stockChanges[p.id];
                const currentStock = changedValue !== undefined ? Number(changedValue) : p.stock_qty;
                return (
                  <tr key={p.id} className={`border-t border-border transition ${isOut ? 'bg-red-50' : isLow ? 'bg-amber-50' : 'hover:bg-muted/30'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-lg overflow-hidden shrink-0">
                          {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : null}
                        </div>
                        <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono-price text-xs hidden sm:table-cell">{p.sku || '—'}</td>
                    <td className="px-4 py-3 font-mono-price">{formatCurrency(p.price, settings)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{threshold}</td>
                    <td className="px-4 py-3">
                      <input type="number" value={currentStock} onChange={(e) => handleStockChange(p.id, e.target.value)}
                        className={`w-20 px-2 py-1.5 text-sm border rounded-lg outline-none focus:border-brand font-mono-price ${changedValue !== undefined ? 'border-brand bg-brand/5' : 'border-border'}`} />
                    </td>
                    <td className="px-4 py-3">
                      {!p.track_inventory ? <span className="text-xs text-muted-foreground">Not tracked</span>
                        : isOut ? <span className="flex items-center gap-1 text-xs text-red-600 font-medium"><AlertTriangle className="w-3 h-3" /> Out of stock</span>
                        : isLow ? <span className="flex items-center gap-1 text-xs text-amber-600 font-medium"><AlertTriangle className="w-3 h-3" /> Low stock</span>
                        : <span className="text-xs text-green-600 font-medium">In stock</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}