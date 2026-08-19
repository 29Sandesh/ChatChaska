'use client';

import React, { useState, useEffect } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { DEMO_RESTAURANT } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';

export interface ReceiptConfig {
  paperWidth: '80mm' | '58mm';
  restaurantName: string;
  address: string;
  phone: string;
  gstin: string;
  fssai: string;
  headerNote: string;
  footerNote: string;
  kickDrawer: boolean;
  printLogo: boolean;
}

export default function ReceiptConfigPage() {
  const [config, setConfig] = useState<ReceiptConfig>({
    paperWidth: '80mm',
    restaurantName: DEMO_RESTAURANT.name,
    address: DEMO_RESTAURANT.address,
    phone: DEMO_RESTAURANT.phone,
    gstin: '27AAAAA0000A1Z5',
    fssai: '11521001000482',
    headerNote: 'TAX INVOICE',
    footerNote: 'Thank you for dining with us! Visit again.',
    kickDrawer: true,
    printLogo: true,
  });

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings?key=receipt_config')
      .then((res) => res.json())
      .then((data) => {
        if (data.value) {
          try {
            setConfig(JSON.parse(data.value));
          } catch (e) {
            console.error(e);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSave = async () => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'receipt_config', value: config }),
      });
      setNotification('Thermal receipt configuration saved.');
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestPrint = async () => {
    const sampleBill = {
      id: 'BILL-TEST-001',
      restaurantName: config.restaurantName,
      tableNumber: 'Table 04',
      waiterName: 'Rahul Kumar',
      items: [
        { id: '1', name: 'Paneer Tikka', quantity: 1, unitPrice: 280, lineTotal: 280, veg: true },
        { id: '2', name: 'Butter Naan', quantity: 2, unitPrice: 60, lineTotal: 120, veg: true },
      ],
      subtotal: 400,
      gstPercent: 5,
      cgstAmount: 10,
      sgstAmount: 10,
      gstAmount: 20,
      discountAmount: 0,
      grandTotal: 420,
      paymentMode: 'upi',
      createdAt: new Date().toISOString(),
    };

    if (window.electronAPI?.printThermalBill) {
      await window.electronAPI.printThermalBill(sampleBill);
      setNotification('Test thermal receipt sent to printer!');
    } else {
      window.print();
      setNotification('Thermal print preview generated.');
    }
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background">
      <TopBar
        title="Thermal Receipt Printing Settings"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="text-xs" onClick={handleTestPrint}>
              <span className="material-symbols-outlined text-[18px] mr-1">print</span>
              Test Print Receipt
            </Button>
            <Button variant="primary" className="text-xs" onClick={handleSave}>
              Save Config
            </Button>
          </div>
        }
      />

      <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Controls */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Paper & Drawer Settings</CardTitle>
                <CardDescription>Configure paper width and hardware options.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1">
                    Thermal Paper Width:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, paperWidth: '80mm' })}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        config.paperWidth === '80mm'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      80mm Standard (3 Inch)
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, paperWidth: '58mm' })}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        config.paperWidth === '58mm'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      58mm Compact (2 Inch)
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                  <div>
                    <span className="text-xs font-bold text-on-surface block">
                      Auto-Kick Cash Drawer
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      Send ESC/POS signal to open cash drawer on bill completion
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.kickDrawer}
                    onChange={(e) => setConfig({ ...config, kickDrawer: e.target.checked })}
                    className="w-4 h-4 text-primary rounded"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receipt Header Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1">
                    Restaurant Branding Name:
                  </label>
                  <input
                    type="text"
                    value={config.restaurantName}
                    onChange={(e) => setConfig({ ...config, restaurantName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:border-primary font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1">
                    Address:
                  </label>
                  <input
                    type="text"
                    value={config.address}
                    onChange={(e) => setConfig({ ...config, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant block mb-1">
                      Phone Number:
                    </label>
                    <input
                      type="text"
                      value={config.phone}
                      onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant block mb-1">
                      GSTIN Number:
                    </label>
                    <input
                      type="text"
                      value={config.gstin}
                      onChange={(e) => setConfig({ ...config, gstin: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1">
                    FSSAI License Number:
                  </label>
                  <input
                    type="text"
                    value={config.fssai}
                    onChange={(e) => setConfig({ ...config, fssai: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Footer Message</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="text"
                  value={config.footerNote}
                  onChange={(e) => setConfig({ ...config, footerNote: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:border-primary"
                />
              </CardContent>
            </Card>
          </div>

          {/* Live Receipt Preview */}
          <div>
            <Card className="sticky top-6 border-dashed border-2">
              <CardHeader>
                <CardTitle className="text-xs font-bold text-outline uppercase tracking-wider">
                  Live Thermal Receipt Preview ({config.paperWidth})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`mx-auto bg-amber-50/90 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-6 rounded-lg font-mono text-xs shadow-inner space-y-3 leading-tight ${
                    config.paperWidth === '58mm' ? 'max-w-[240px]' : 'max-w-[320px]'
                  }`}
                >
                  <div className="text-center space-y-1">
                    <h2 className="font-black text-base uppercase">{config.restaurantName}</h2>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{config.address}</p>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">Ph: {config.phone}</p>
                    {config.gstin && (
                      <p className="text-[10px] font-bold">GSTIN: {config.gstin}</p>
                    )}
                    {config.fssai && (
                      <p className="text-[10px]">FSSAI Lic: {config.fssai}</p>
                    )}
                    <div className="border-b border-dashed border-zinc-400 my-2" />
                    <span className="font-bold text-xs uppercase tracking-widest block">
                      {config.headerNote}
                    </span>
                    <div className="border-b border-dashed border-zinc-400 my-2" />
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span>Inv #: BILL-TEST-001</span>
                      <span>Table 04</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Biller: Rahul Kumar</span>
                      <span>UPI</span>
                    </div>
                  </div>

                  <div className="border-b border-dashed border-zinc-400 my-2" />

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between font-bold">
                      <span>1x Paneer Tikka</span>
                      <span>{formatCurrency(280)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>2x Butter Naan</span>
                      <span>{formatCurrency(120)}</span>
                    </div>
                  </div>

                  <div className="border-b border-dashed border-zinc-400 my-2" />

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(400)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST (2.5%):</span>
                      <span>{formatCurrency(10)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (2.5%):</span>
                      <span>{formatCurrency(10)}</span>
                    </div>
                    <div className="border-b border-zinc-900 dark:border-zinc-100 my-1" />
                    <div className="flex justify-between text-sm font-black pt-1">
                      <span>TOTAL:</span>
                      <span>{formatCurrency(420)}</span>
                    </div>
                  </div>

                  <div className="border-b border-dashed border-zinc-400 my-3" />

                  <div className="text-center text-[10px] space-y-1 text-zinc-600 dark:text-zinc-400">
                    <p>{config.footerNote}</p>
                    <p className="font-sans font-bold">Powered by ChatChaska POS</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-surface-container-highest border border-primary/30 text-on-surface rounded-2xl shadow-xl text-xs font-bold">
          {notification}
        </div>
      )}
    </div>
  );
}
