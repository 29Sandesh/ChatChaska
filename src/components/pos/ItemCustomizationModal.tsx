'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

export interface VariantOption {
  name: string;
  price: number;
}

export interface AddonOption {
  name: string;
  price: number;
}

export interface ItemCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    price: number;
    veg: boolean;
    variants?: VariantOption[];
    addons?: AddonOption[];
  } | null;
  onConfirm: (customizedItem: {
    selectedVariant?: VariantOption;
    selectedAddons: AddonOption[];
    itemNote: string;
    unitPrice: number;
  }) => void;
}

export function ItemCustomizationModal({
  isOpen,
  onClose,
  item,
  onConfirm,
}: ItemCustomizationModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<VariantOption | undefined>(
    item?.variants?.[0]
  );
  const [selectedAddons, setSelectedAddons] = useState<AddonOption[]>([]);
  const [itemNote, setItemNote] = useState<string>('');

  if (!item) return null;

  const basePrice = selectedVariant ? selectedVariant.price : item.price;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const finalUnitPrice = basePrice + addonsTotal;

  const handleToggleAddon = (addon: AddonOption) => {
    if (selectedAddons.some((a) => a.name === addon.name)) {
      setSelectedAddons(selectedAddons.filter((a) => a.name !== addon.name));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleAdd = () => {
    onConfirm({
      selectedVariant,
      selectedAddons,
      itemNote,
      unitPrice: finalUnitPrice,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Customize: ${item.name}`} size="md">
      <div className="space-y-6 py-2">
        {/* Item Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                item.veg ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <span className="font-semibold text-lg text-on-surface">{item.name}</span>
          </div>
          <span className="font-bold text-primary text-xl">{formatCurrency(finalUnitPrice)}</span>
        </div>

        {/* Variants Selection */}
        {item.variants && item.variants.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant block">
              Portion / Variant:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {item.variants.map((v) => {
                const isSelected = selectedVariant?.name === v.name;
                return (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                        : 'border-outline-variant/40 hover:border-outline text-on-surface'
                    }`}
                  >
                    <span>{v.name}</span>
                    <span>{formatCurrency(v.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Addons Selection */}
        {item.addons && item.addons.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant block">
              Optional Add-ons:
            </label>
            <div className="space-y-1.5">
              {item.addons.map((a) => {
                const isChecked = selectedAddons.some((sa) => sa.name === a.name);
                return (
                  <button
                    key={a.name}
                    type="button"
                    onClick={() => handleToggleAddon(a)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                      isChecked
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 font-semibold'
                        : 'border-outline-variant/30 hover:bg-surface-container-low text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">
                        {isChecked ? 'check_box' : 'checkbox_outline_blank'}
                      </span>
                      <span>{a.name}</span>
                    </div>
                    <span>+{formatCurrency(a.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Cooking Notes */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-on-surface-variant block">
            Special Instructions / Kitchen Notes:
          </label>
          <input
            type="text"
            placeholder="e.g. No onion, extra spicy, less salt..."
            value={itemNote}
            onChange={(e) => setItemNote(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAdd}>
            Add to Bill — {formatCurrency(finalUnitPrice)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
