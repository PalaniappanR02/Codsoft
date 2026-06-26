import React, { useEffect, useState, useCallback } from 'react';
import { Check, X, Star, Loader2, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/apiClient';
import StarRating from '@/components/StarRating';
import { formatDate } from '@/lib/format';
import toast from 'react-hot-toast';

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setReviews((await base44.entities.Review.list('-created_date', 200)) || []); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = reviews.filter(r => r.status === tab);

  const handleApprove = async (r) => {
    try { await base44.entities.Review.update(r.id, { status: 'approved' }); toast.success('Review approved'); refresh(); }
    catch { toast.error('Update failed'); }
  };

  const handleReject = async (r) => {
    try { await base44.entities.Review.update(r.id, { status: 'rejected' }); toast.success('Review rejected'); refresh(); }
    catch { toast.error('Update failed'); }
  };

  const handleDelete = async (r) => {
    if (window.confirm('Delete this review permanently?')) {
      try { await base44.entities.Review.delete(r.id); toast.success('Deleted'); refresh(); }
      catch { toast.error('Delete failed'); }
    }
  };

  const tabs = [
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-4">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-medium transition border-b-2 ${tab === t.id ? 'border-brand text-brand' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {t.label} <span className="text-xs text-muted-foreground">({reviews.filter(r => r.status === t.id).length})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground">No {tab} reviews</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <StarRating rating={r.rating} size="sm" />
                    <span className="text-sm font-medium">{r.customer_name}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(r.created_date)}</span>
                  </div>
                  <p className="text-sm font-semibold mb-1">{r.title || 'No title'}</p>
                  <p className="text-sm text-muted-foreground mb-2">{r.body}</p>
                  <p className="text-xs text-muted-foreground">Product: {r.product_name}</p>
                  {r.customer_email && <p className="text-xs text-muted-foreground">{r.customer_email}</p>}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {tab === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(r)} className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition">
                        <Check className="w-3 h-3" /> Approve
                      </button>
                      <button onClick={() => handleReject(r)} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition">
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </>
                  )}
                  {tab === 'approved' && (
                    <button onClick={() => handleReject(r)} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition">
                      <X className="w-3 h-3" /> Unapprove
                    </button>
                  )}
                  {tab === 'rejected' && (
                    <button onClick={() => handleApprove(r)} className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition">
                      <Check className="w-3 h-3" /> Approve
                    </button>
                  )}
                  <button onClick={() => handleDelete(r)} className="flex items-center gap-1 px-3 py-1.5 border border-border text-muted-foreground rounded-lg text-xs font-medium hover:bg-muted transition">
                    <Star className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}