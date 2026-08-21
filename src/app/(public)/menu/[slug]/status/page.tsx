'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { cloudClient } from '@/lib/cloud-db';
import { generateUPIQRCode, generateUPIIntentUri } from '@/lib/payments/upi-generator';

export default function OrderStatusLiveTrackerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const menuSlug = (params?.slug as string) || 'chatchaska-cafe';
  const orderId = searchParams?.get('order') || searchParams?.get('id') || 'ORD-2847';
  const table = searchParams?.get('table') || 'Table 1';

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [orderStatus, setOrderStatus] = useState<string>('pending');
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [billAmount, setBillAmount] = useState<number>(380);

  // Pay at Table Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [upiQrUrl, setUpiQrUrl] = useState<string>('');
  const [upiIntentUri, setUpiIntentUri] = useState<string>('');
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [settling, setSettling] = useState(false);

  // Status mapping: pending -> 1, confirmed/preparing -> 2, ready -> 3, served -> 4
  const mapStatusToStep = (status: string) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'confirmed':
      case 'preparing':
        return 2;
      case 'ready':
        return 3;
      case 'served':
        return 4;
      default:
        return 2;
    }
  };

  useEffect(() => {
    // 1. Subscribe to Supabase Realtime for this order
    try {
      const channel = cloudClient
        .channel(`order-status-${orderId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'cloud_orders',
            filter: `order_number=eq.${orderId}`,
          },
          (payload: any) => {
            if (payload.new?.status) {
              setOrderStatus(payload.new.status);
              setCurrentStep(mapStatusToStep(payload.new.status));
              if (payload.new.total_amount) {
                setBillAmount(Number(payload.new.total_amount));
              }

              if (payload.new.status === 'ready' && typeof window !== 'undefined' && 'Notification' in window) {
                if (Notification.permission === 'granted') {
                  new Notification('Your order is ready!', { body: 'A waiter is bringing your food to the table.' });
                }
              }
            }
          }
        )
        .subscribe();

      return () => {
        cloudClient.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime subscription fallback:', err);
    }
  }, [orderId]);

  // Generate UPI Payment QR on demand
  const handleOpenPayment = async () => {
    const upiPayload = {
      merchantVpa: 'paytmqr6z1f01@ptys',
      merchantName: 'ChatChaska Signature Cafe',
      amount: billAmount,
      transactionNote: `Order #${orderId} Table ${table}`,
      orderId,
      tableNumber: table,
    };

    const qr = await generateUPIQRCode(upiPayload);
    const intent = generateUPIIntentUri(upiPayload);
    setUpiQrUrl(qr);
    setUpiIntentUri(intent);
    setIsPayModalOpen(true);
  };

  const handleConfirmPaid = async () => {
    setSettling(true);
    try {
      const res = await fetch('/api/public/pay-settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          table_number: table,
          amount: billAmount,
          payment_method: 'upi',
        }),
      });

      if (res.ok) {
        setIsPaidSuccess(true);
        setCurrentStep(4);
        setTimeout(() => {
          setIsPayModalOpen(false);
          setIsPaidSuccess(false);
        }, 2500);
      }
    } catch (err) {
      console.error('Payment settlement error:', err);
    } finally {
      setSettling(false);
    }
  };

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    setTimeout(() => setWaiterCalled(false), 4000);
  };

  return (
    <div className="bg-black text-white font-sans antialiased md:max-w-md md:mx-auto md:shadow-2xl md:min-h-screen relative p-5 flex flex-col justify-between border-x border-slate-900 pb-10">
      <div>
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href={`/menu/${menuSlug}`}
            className="w-9 h-9 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <span className="bg-[#FAF7F2] text-slate-950 border border-[#B2906A] rounded-md font-bold text-xs px-3 py-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {table}
          </span>
        </div>

        {/* Hero Order Status Badge */}
        <div className="text-center mb-6 bg-slate-900 border border-slate-800 p-6 rounded-md shadow-xl">
          <div className="w-16 h-16 rounded-md bg-[#FAF7F2] text-slate-950 border border-[#B2906A] mx-auto flex items-center justify-center mb-3 shadow-md">
            <span className="material-symbols-outlined text-3xl animate-pulse">
              {currentStep === 1 && 'receipt_long'}
              {currentStep === 2 && 'soup_kitchen'}
              {currentStep === 3 && 'room_service'}
              {currentStep === 4 && 'restaurant'}
            </span>
          </div>

          <h1 className="font-black text-xl text-slate-100 leading-tight">
            {currentStep === 1 && 'Order Received'}
            {currentStep === 2 && 'Kitchen Preparing...'}
            {currentStep === 3 && 'Ready for Server'}
            {currentStep === 4 && 'Served at Table'}
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Order #{orderId} • {currentStep < 3 ? 'Est. prep time: 10-15 mins' : 'Served hot at your table'}
          </p>
        </div>

        {/* Real-Time Status Steps */}
        <div className="space-y-6 px-2 bg-slate-900/50 p-5 rounded-md border border-slate-800/80">
          {[
            { step: 1, title: 'Order Received', desc: 'Order sent to counter and kitchen KDS' },
            { step: 2, title: 'Kitchen Preparing', desc: 'Chef has accepted and started cooking' },
            { step: 3, title: 'Ready for Server', desc: 'Dishes ready for server pickup' },
            { step: 4, title: `Served at Table`, desc: 'Enjoy your hot meal!' },
          ].map((item) => {
            const isDone = currentStep > item.step;
            const isCurrent = currentStep === item.step;

            return (
              <div key={item.step} className="flex gap-4 items-start relative">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-[#C3A27C] text-slate-950 ring-2 ring-[#B2906A] animate-pulse'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isDone ? <span className="material-symbols-outlined text-[14px]">check</span> : item.step}
                  </div>
                  {item.step < 4 && (
                    <div className={`w-0.5 h-10 my-1 ${isDone ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                  )}
                </div>

                <div className="pt-0.5">
                  <h4 className={`text-sm font-bold ${isCurrent ? 'text-[#C3A27C]' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-6 space-y-2.5">
        {/* Pay Bill at Table Button */}
        <button
          onClick={handleOpenPayment}
          className="w-full bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] py-3.5 rounded-md text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">bolt</span>
          <span>Pay at Table via UPI (₹{billAmount})</span>
        </button>

        <button
          onClick={handleCallWaiter}
          disabled={waiterCalled}
          className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 py-3 rounded-md text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg text-amber-400">notifications</span>
          <span>{waiterCalled ? 'Waiter Notified! Coming soon...' : 'Call Waiter to Table'}</span>
        </button>

        <Link
          href={`/menu/${menuSlug}`}
          className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 py-3 rounded-md text-xs font-bold text-center flex items-center justify-center gap-2 transition-all"
        >
          <span className="material-symbols-outlined text-lg">restaurant_menu</span>
          <span>Order More Dishes</span>
        </Link>
      </div>

      {/* Dynamic Pay-at-Table UPI Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-black border border-[#B2906A] rounded-md p-6 max-w-sm w-full shadow-2xl text-center space-y-4 text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-[#C3A27C]">Pay at Table via UPI</h3>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="w-8 h-8 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {isPaidSuccess ? (
              <div className="py-6 space-y-2">
                <span className="material-symbols-outlined text-5xl text-emerald-400 animate-bounce">
                  check_circle
                </span>
                <h4 className="font-bold text-emerald-400 text-lg">Payment Confirmed!</h4>
                <p className="text-xs text-slate-300">Your digital receipt is saved. Thank you for dining with us!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#FAF7F2] p-3 rounded-md border border-[#B2906A] inline-block mx-auto shadow-inner">
                  {upiQrUrl ? (
                    <img src={upiQrUrl} alt="UPI Payment QR" className="w-56 h-56 mx-auto rounded-md" />
                  ) : (
                    <div className="w-56 h-56 bg-slate-300 rounded-md animate-pulse" />
                  )}
                </div>

                <div>
                  <div className="text-2xl font-black text-[#C3A27C]">₹{billAmount.toFixed(2)}</div>
                  <p className="text-xs text-slate-400 mt-0.5">Scan with Google Pay, PhonePe, or Paytm</p>
                </div>

                {/* Direct 1-Tap App Deep Link for Mobile Devices */}
                {upiIntentUri && (
                  <a
                    href={upiIntentUri}
                    className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold py-2.5 rounded-md text-xs flex items-center justify-center gap-2 transition-all block"
                  >
                    <span className="material-symbols-outlined text-lg inline-block align-middle mb-0.5">open_in_new</span>
                    <span className="inline-block align-middle">Tap to Open UPI App</span>
                  </a>
                )}

                <button
                  onClick={handleConfirmPaid}
                  disabled={settling}
                  className="w-full bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] font-bold py-3 rounded-md shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {settling ? 'Confirming...' : 'I Have Completed Payment'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
