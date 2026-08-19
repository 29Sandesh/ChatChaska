'use client';

import React, { useState, useEffect } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export interface GSTConfig {
  gstin: string;
  fssaiNumber: string;
  defaultGstPercent: number;
  taxType: 'exclusive' | 'inclusive';
  enableServiceCharge: boolean;
  serviceChargePercent: number;
  financialYearPrefix: string;
  enableEInvoicing: boolean;
  irpUsername?: string;
  irpPassword?: string;
}

export default function GSTConfigurationPage() {
  const [config, setConfig] = useState<GSTConfig>({
    gstin: '27AAAAA0000A1Z5',
    fssaiNumber: '11521001000482',
    defaultGstPercent: 5,
    taxType: 'exclusive',
    enableServiceCharge: false,
    serviceChargePercent: 5,
    financialYearPrefix: 'MC-2026-27',
    enableEInvoicing: true,
  });

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings?key=gst_config')
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
        body: JSON.stringify({ key: 'gst_config', value: config }),
      });
      setNotification('GST & Tax Configuration saved successfully.');
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background">
      <TopBar
        title="GST Compliance & E-Invoicing Settings"
        actions={
          <Button variant="primary" className="text-xs" onClick={handleSave}>
            Save GST Settings
          </Button>
        }
      />

      <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GST Identity */}
          <Card>
            <CardHeader>
              <CardTitle>GST & License Identification</CardTitle>
              <CardDescription>Government tax registration & compliance info.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1">
                  GSTIN (15-Digit GST Identification Number):
                </label>
                <input
                  type="text"
                  value={config.gstin}
                  onChange={(e) => setConfig({ ...config, gstin: e.target.value.toUpperCase() })}
                  maxLength={15}
                  placeholder="27AAAAA0000A1Z5"
                  className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl font-mono text-on-surface font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1">
                  FSSAI License Number (14-Digit):
                </label>
                <input
                  type="text"
                  value={config.fssaiNumber}
                  onChange={(e) => setConfig({ ...config, fssaiNumber: e.target.value })}
                  maxLength={14}
                  placeholder="11521001000482"
                  className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl font-mono text-on-surface font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1">
                  Invoice Number Prefix (Financial Year Format):
                </label>
                <input
                  type="text"
                  value={config.financialYearPrefix}
                  onChange={(e) => setConfig({ ...config, financialYearPrefix: e.target.value })}
                  placeholder="MC-2026-27"
                  className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl font-mono text-on-surface font-bold focus:outline-none focus:border-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tax Slabs & Calculation */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Slabs & Calculation Rules</CardTitle>
              <CardDescription>Default tax rates and pricing rules.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1">
                  Default Restaurant GST Rate:
                </label>
                <select
                  value={config.defaultGstPercent}
                  onChange={(e) => setConfig({ ...config, defaultGstPercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl font-bold text-on-surface"
                >
                  <option value={5}>5% (Standard Non-AC / AC Restaurant - CGST 2.5% + SGST 2.5%)</option>
                  <option value={18}>18% (Outdoor Catering / Premium Bar - CGST 9% + SGST 9%)</option>
                  <option value={0}>0% (Tax Exempt)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1">
                  Price Tax Mode:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, taxType: 'exclusive' })}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      config.taxType === 'exclusive'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    Tax Exclusive (Added at checkout)
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, taxType: 'inclusive' })}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      config.taxType === 'inclusive'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    Tax Inclusive (Menu price includes GST)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <div>
                  <span className="text-xs font-bold text-on-surface block">Enable Service Charge</span>
                  <span className="text-[11px] text-on-surface-variant">
                    Optional 5-10% staff service charge line
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableServiceCharge}
                  onChange={(e) => setConfig({ ...config, enableServiceCharge: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* E-Invoicing Section */}
        <Card>
          <CardHeader>
            <CardTitle>Government E-Invoicing (IRN) Integration</CardTitle>
            <CardDescription>
              Generate Invoice Reference Number (IRN) & QR codes directly with GST Invoice Registration Portal (IRP).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary-container/10 border border-primary/20">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[28px]">verified</span>
                <div>
                  <span className="text-sm font-bold text-on-surface block">
                    Enable Real-Time E-Invoicing (B2B & B2C IRN)
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    Compliant with GST Portal e-invoice schema v1.03
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.enableEInvoicing}
                onChange={(e) => setConfig({ ...config, enableEInvoicing: e.target.checked })}
                className="w-5 h-5 text-primary rounded"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-surface-container-highest border border-primary/30 text-on-surface rounded-2xl shadow-xl text-xs font-bold">
          {notification}
        </div>
      )}
    </div>
  );
}
