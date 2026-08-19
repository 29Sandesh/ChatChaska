'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { OTPVerificationSheet } from '@/components/customer/OTPVerificationSheet';

export default function CafeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews' | 'info'>('menu');
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    async function loadCafe() {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/public/cafes/${slug}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Error loading cafe profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCafe();
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: data?.cafe?.name || 'ChatChaska Cafe',
        text: `Check out ${data?.cafe?.name} on ChatChaska!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      const res = await fetch(`/api/public/cafes/${slug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      if (res.ok) {
        setIsReviewModalOpen(false);
        setReviewComment('');
        // Reload reviews
        const refresh = await fetch(`/api/public/cafes/${slug}`);
        const refreshedJson = await refresh.json();
        setData(refreshedJson);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-orange-400 animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  const cafe = data?.cafe || {};
  const menuItems = data?.menuItems || [];
  const reviews = data?.reviews || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Hero Banner with Dark Gradient */}
      <div className="relative h-64 md:h-80 w-full bg-slate-900">
        <img
          src={cafe.banner_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80'}
          alt={cafe.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/60" />

        {/* Back & Share Buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>

          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">share</span>
          </button>
        </div>

        {/* Cafe Meta Overlay */}
        <div className="absolute bottom-4 left-4 right-4 max-w-5xl mx-auto">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-white">{cafe.name}</h1>
                {cafe.is_pure_veg && (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    PURE VEG
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-slate-300">
                {cafe.cuisine_tags?.join(' • ') || 'Artisan Cafe & Gourmet Street Bites'}
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span>{cafe.address ? `${cafe.address}, ${cafe.city}` : cafe.city || 'India'}</span>
              </p>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-2xl text-center shadow-lg">
              <div className="text-base font-black text-amber-300 flex items-center justify-center gap-1">
                <span>⭐</span>
                <span>{cafe.avg_rating || '4.8'}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{cafe.total_reviews || 120} reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons Bar */}
      <div className="max-w-5xl mx-auto px-4 pt-4 flex items-center gap-3 overflow-x-auto no-scrollbar">
        {cafe.google_maps_url ? (
          <a
            href={cafe.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-orange-400 text-base">directions</span>
            <span>Directions</span>
          </a>
        ) : null}

        {cafe.phone && (
          <a
            href={`tel:${cafe.phone}`}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-emerald-400 text-base">call</span>
            <span>Call Cafe</span>
          </a>
        )}

        {cafe.whatsapp && (
          <a
            href={`https://wa.me/${cafe.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 whitespace-nowrap"
          >
            <span className="text-emerald-400 text-base font-bold">💬</span>
            <span>WhatsApp</span>
          </a>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-5xl mx-auto px-4 mt-6 border-b border-slate-800 flex gap-6 text-sm font-bold">
        {[
          { id: 'menu', label: 'Digital Menu', icon: 'restaurant_menu' },
          { id: 'reviews', label: `Reviews (${reviews.length})`, icon: 'star' },
          { id: 'info', label: 'About & Hours', icon: 'info' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                isActive ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        {/* Tab 1: Menu */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-orange-400">qr_code_scanner</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Ordering at the table?</h4>
                  <p className="text-xs text-slate-400">Scan the QR code on your table to unlock self-service ordering.</p>
                </div>
              </div>

              <Link
                href={`/menu/${slug}`}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md whitespace-nowrap"
              >
                Open Order Portal
              </Link>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.length === 0 ? (
                // Fallback preview items
                [
                  { name: 'Special Masala Chai', price: 40, desc: 'Aromatic blend of fresh ginger, cardamom & premium Assam leaves.', veg: true },
                  { name: 'Crispy Paneer Tikka', price: 220, desc: 'Charcoal grilled cottage cheese marinated in spiced yogurt.', veg: true },
                  { name: 'Butter Pav Bhaji', price: 160, desc: 'Mumbai street style spiced mashed veg served with hot buttered buns.', veg: true },
                  { name: 'Artisan Cold Coffee with Ice Cream', price: 120, desc: 'Creamy double-shot espresso blended with rich vanilla bean.', veg: true },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <h4 className="font-bold text-sm text-slate-100">{item.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{item.desc}</p>
                      <p className="text-sm font-black text-orange-400 pt-1">₹{item.price}</p>
                    </div>
                  </div>
                ))
              ) : (
                menuItems.map((item: any) => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.veg ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                        <h4 className="font-bold text-sm text-slate-100">{item.name}</h4>
                      </div>
                      {item.description && <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>}
                      <p className="text-sm font-black text-orange-400 pt-1">₹{item.price}</p>
                    </div>

                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-slate-800" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div>
                <h3 className="font-black text-xl text-slate-100 flex items-center gap-2">
                  <span>⭐</span>
                  <span>{cafe.avg_rating || '4.8'} out of 5</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Based on {reviews.length} customer ratings</p>
              </div>

              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer"
              >
                Write a Review
              </button>
            </div>

            {/* Review Cards */}
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No reviews yet. Be the first to leave a review!
                </div>
              ) : (
                reviews.map((rev: any) => (
                  <div key={rev.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-orange-400 font-bold text-xs flex items-center justify-center">
                          {rev.customer_name?.[0] || 'G'}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-slate-200">{rev.customer_name}</h5>
                          <div className="text-amber-400 text-xs">{'★'.repeat(rev.rating)}</div>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {rev.comment && <p className="text-xs text-slate-300">{rev.comment}</p>}

                    {rev.owner_reply && (
                      <div className="bg-slate-800/80 border-l-2 border-orange-500 p-3 rounded-r-xl text-xs space-y-1 mt-2">
                        <span className="font-bold text-orange-400 text-[11px]">Cafe Owner Reply:</span>
                        <p className="text-slate-300">{rev.owner_reply}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: About & Info */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-200">About {cafe.name}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {cafe.description || 'Welcome to our cafe. We serve delicious freshly brewed beverages and mouth-watering bites in a relaxing ambiance.'}
                </p>
              </div>

              <div className="border-t border-slate-800 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">OPERATING HOURS</span>
                  <p className="text-slate-200 font-medium">{cafe.opening_time || '08:00 AM'} - {cafe.closing_time || '11:00 PM'}</p>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold block mb-1">AVERAGE COST</span>
                  <p className="text-slate-200 font-medium">₹{cafe.avg_cost_for_two || 350} for two people (approx)</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Write a Review</h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Rating (1 to 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-2xl cursor-pointer transition-transform hover:scale-110 ${
                        star <= reviewRating ? 'text-amber-400' : 'text-slate-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Your Feedback</label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us what you liked about the food, ambiance, or service..."
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {reviewSubmitting ? 'Posting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
