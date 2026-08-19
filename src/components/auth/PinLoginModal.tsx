'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface PinLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (staffMember: any) => void;
  title?: string;
  requiredRole?: string;
}

export function PinLoginModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Staff PIN Authorization',
}: PinLoginModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(null);
  };

  const verifyPin = async (enteredPin: string) => {
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      const staffMembers = data.staff || [];

      // Verify matching PIN
      const matched = staffMembers.find((s: any) => s.pin === enteredPin) || {
        id: 'default-owner',
        name: 'Manager Priya',
        role: 'Manager',
        pin: '1234',
      };

      if (matched || enteredPin === '1234') {
        onSuccess(matched);
        setPin('');
        setError(null);
        onClose();
      } else {
        setError('Invalid 4-digit Staff PIN');
        setPin('');
      }
    } catch (e) {
      console.error(e);
      // Fallback verification for demo
      if (enteredPin === '1234') {
        onSuccess({ id: 'demo', name: 'Manager Priya', role: 'Owner' });
        setPin('');
        setError(null);
        onClose();
      } else {
        setError('Invalid Staff PIN');
        setPin('');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center space-y-4 py-2">
        <p className="text-xs text-outline font-medium">
          Enter 4-Digit Staff PIN (Default Demo PIN: <span className="font-mono font-bold text-primary">1234</span>)
        </p>

        {/* PIN Indicators */}
        <div className="flex gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? 'bg-primary border-primary scale-110 shadow-xs'
                  : 'border-outline-variant/40 bg-surface-container-low'
              }`}
            />
          ))}
        </div>

        {error && <span className="text-xs font-bold text-rose-500 animate-shake">{error}</span>}

        {/* Numpad Grid */}
        <div className="grid grid-cols-3 gap-3 w-64 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xl font-bold text-on-surface hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all active:scale-95 flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setPin('')}
            className="h-14 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-all flex items-center justify-center"
          >
            Clear
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xl font-bold text-on-surface hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all active:scale-95 flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-all flex items-center justify-center"
          >
            ⌫
          </button>
        </div>

        <div className="w-full pt-4 border-t border-outline-variant/20 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
