'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function OrderStatusLiveTrackerPage() {
  const params = useParams();
  const menuSlug = (params?.slug as string) || 'spice-garden';
  const [currentStep, setCurrentStep] = useState<number>(2);
  const [waiterCalled, setWaiterCalled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < 4 ? prev + 1 : 4));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    setTimeout(() => setWaiterCalled(false), 4000);
  };

  return (
    <div className="bg-white text-gray-900 font-sans antialiased md:max-w-md md:mx-auto md:shadow-xl md:min-h-screen relative p-5 flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href={`/menu/${menuSlug}`}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
          >
            ←
          </Link>
          <span className="font-bold text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
            📍 Table 12
          </span>
        </div>

        {/* Hero Order Status Badge */}
        <div className="text-center mb-6 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
          <div className="w-14 h-14 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center mb-2.5 shadow-md">
            <span className="text-2xl animate-pulse">
              {currentStep === 1 && '📑'}
              {currentStep === 2 && '👨‍🍳'}
              {currentStep === 3 && '🔔'}
              {currentStep === 4 && '🍽️'}
            </span>
          </div>

          <h1 className="font-bold text-lg text-gray-900 leading-tight">
            {currentStep === 1 && 'Order Placed'}
            {currentStep === 2 && 'Kitchen is Preparing...'}
            {currentStep === 3 && 'Order Ready!'}
            {currentStep === 4 && 'Served to Your Table'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Order #SPG-2847 • Est. time: {currentStep < 3 ? '12-15 mins' : 'Now'}
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 mb-6 text-xs space-y-1.5">
          <div className="flex justify-between items-center font-bold text-gray-800 pb-1 border-b border-gray-200/60">
            <span>Ordered Items (3)</span>
            <span className="text-emerald-700">Total: ₹907</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>1x Paneer Tikka (Full)</span>
            <span>₹280</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>1x Dal Makhani (Full)</span>
            <span>₹260</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>2x Garlic Naan</span>
            <span>₹160</span>
          </div>
        </div>

        {/* Swiggy-style Timeline Stepper */}
        <div className="space-y-6 px-2">
          {[
            { step: 1, title: 'Order Placed', desc: 'Received & sent to kitchen KDS' },
            { step: 2, title: 'Preparing Food', desc: 'Head Chef Rajesh is preparing your order' },
            { step: 3, title: 'Plated & Ready', desc: 'Dishes ready for waiter pickup' },
            { step: 4, title: 'Served at Table 12', desc: 'Enjoy your delicious meal!' },
          ].map((item) => {
            const isDone = currentStep > item.step;
            const isCurrent = currentStep === item.step;

            return (
              <div key={item.step} className="flex gap-4 items-start relative">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 animate-pulse'
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}
                  >
                    {isDone ? '✓' : item.step}
                  </div>
                  {item.step < 4 && (
                    <div
                      className={`w-0.5 h-10 my-1 transition-colors ${
                        isDone ? 'bg-emerald-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>

                <div className="pt-0.5">
                  <h3
                    className={`font-bold text-xs ${
                      isCurrent || isDone ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Quick Action */}
      <div className="pt-6 space-y-2">
        <button
          onClick={handleCallWaiter}
          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors"
        >
          🔔 {waiterCalled ? 'Waiter Notified!' : 'Call Waiter to Table'}
        </button>
        <Link href={`/menu/${menuSlug}`}>
          <Button variant="secondary" fullWidth>
            Back to Digital Menu
          </Button>
        </Link>
      </div>
    </div>
  );
}
