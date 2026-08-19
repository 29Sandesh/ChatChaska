'use client';

import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRouter } from 'next/navigation';

interface QRScannerSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QRScannerSheet({ isOpen, onClose }: QRScannerSheetProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader-container',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onClose();
        // Parse target URL or direct slug
        if (decodedText.includes('/menu/')) {
          const url = new URL(decodedText, window.location.origin);
          router.push(`${url.pathname}${url.search}`);
        } else if (decodedText.startsWith('http')) {
          window.location.href = decodedText;
        } else {
          router.push(`/menu/${decodedText}`);
        }
      },
      (errorMessage) => {
        // Ignore frame read errors
      }
    );

    return () => {
      try {
        scanner.clear();
      } catch {}
    };
  }, [isOpen, onClose, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-white text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer z-10"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        <div>
          <h3 className="text-lg font-bold">Scan Table QR Standee</h3>
          <p className="text-xs text-slate-400 mt-1">Point your camera at the tabletop QR code to open the menu</p>
        </div>

        <div id="qr-reader-container" className="rounded-2xl overflow-hidden bg-black min-h-[280px]" />
      </div>
    </div>
  );
}
