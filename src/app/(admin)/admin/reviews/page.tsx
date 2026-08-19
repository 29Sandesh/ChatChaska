'use client';

import React, { useState, useEffect } from 'react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [cafeSlug, setCafeSlug] = useState('');

  useEffect(() => {
    async function loadReviews() {
      setLoading(true);
      try {
        const configRes = await fetch('/api/cafe-config');
        const configData = await configRes.json();
        const slug = configData.slug || 'chatchaska-cafe';
        setCafeSlug(slug);
        const res = await fetch(`/api/public/cafes/${slug}/reviews`);
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error('Error loading reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  const handleSendReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await fetch('/api/admin/reviews/reply', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_id: reviewId,
          reply_text: replyText.trim(),
        }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, owner_reply: replyText.trim(), owner_replied_at: new Date().toISOString() } : r
          )
        );
        setReplyingId(null);
        setReplyText('');
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 text-slate-900">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-3xl text-amber-500">rate_review</span>
            <h1 className="text-2xl font-black">Customer Reviews & Ratings</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitor feedback from verified table orders and post official responses.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-center">
          <span className="text-xl font-black text-amber-500">⭐ {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}</span>
          <span className="text-[11px] text-slate-500 block font-semibold">{reviews.length} total reviews</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 h-32 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center space-y-2">
            <span className="material-symbols-outlined text-4xl text-slate-600">reviews</span>
            <h3 className="font-bold text-slate-700 text-sm">No customer reviews yet</h3>
            <p className="text-xs text-slate-500">Reviews submitted via QR menus and the explore portal will show up here.</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 hover:border-slate-200 transition-all"
            >
              {/* Top Row: User & Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-blue-600 font-bold text-sm flex items-center justify-center">
                    {rev.customer_name?.[0] || 'G'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{rev.customer_name || 'Guest Customer'}</h4>
                    <span className="text-[11px] text-slate-500">📱 {rev.customer_phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-amber-500 text-sm font-bold">{'★'.repeat(rev.rating)}</div>
                  <span className="text-xs text-slate-500">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Comment */}
              {rev.comment && <p className="text-xs text-slate-700 leading-relaxed pl-12">{rev.comment}</p>}

              {/* Existing Owner Reply */}
              {rev.owner_reply && (
                <div className="ml-12 bg-slate-50 border-l-2 border-blue-600 p-3.5 rounded-r-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600">Your Official Response:</span>
                    <span className="text-[10px] text-slate-500">
                      {rev.owner_replied_at ? new Date(rev.owner_replied_at).toLocaleDateString() : 'Replied'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">{rev.owner_reply}</p>
                </div>
              )}

              {/* Reply Button / Inline Input */}
              <div className="ml-12 pt-1 flex justify-end">
                {replyingId === rev.id ? (
                  <div className="w-full space-y-2 pt-2">
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a polite response to this customer..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-500 focus:outline-hidden focus:border-blue-600"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setReplyingId(null); setReplyText(''); }}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-500 hover:text-slate-800 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSendReply(rev.id)}
                        disabled={submittingReply || !replyText.trim()}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-slate-900 text-xs font-bold shadow-md disabled:opacity-50"
                      >
                        {submittingReply ? 'Posting...' : 'Post Reply'}
                      </button>
                    </div>
                  </div>
                ) : (
                  !rev.owner_reply && (
                    <button
                      onClick={() => { setReplyingId(rev.id); setReplyText(''); }}
                      className="text-xs font-bold text-blue-600 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">reply</span>
                      <span>Reply to Customer</span>
                    </button>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
