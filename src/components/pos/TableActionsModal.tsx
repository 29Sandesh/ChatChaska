'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export interface TableActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable: string;
  onActionComplete: (action: 'move' | 'merge' | 'swap', targetTable: string) => void;
}

const AVAILABLE_TABLES = [
  'Table 01',
  'Table 02',
  'Table 03',
  'Table 04',
  'Table 05',
  'Table 06',
  'Table 07',
  'Table 08',
  'Table 09',
  'Table 10',
  'Table 11',
  'Table 12',
  'Bar 01',
  'Bar 02',
];

export function TableActionsModal({
  isOpen,
  onClose,
  currentTable,
  onActionComplete,
}: TableActionsModalProps) {
  const [tab, setTab] = useState<'move' | 'merge' | 'swap'>('move');
  const [selectedTargetTable, setSelectedTargetTable] = useState<string>('Table 02');

  const filteredTables = AVAILABLE_TABLES.filter((t) => t !== currentTable);

  const handleConfirm = () => {
    onActionComplete(tab, selectedTargetTable);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Table Operations: ${currentTable}`} size="md">
      <div className="space-y-6 py-2">
        {/* Action Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-surface-container-high rounded-xl">
          <button
            type="button"
            onClick={() => setTab('move')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              tab === 'move'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            ↪️ Move Order
          </button>
          <button
            type="button"
            onClick={() => setTab('merge')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              tab === 'merge'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            🔀 Merge Tables
          </button>
          <button
            type="button"
            onClick={() => setTab('swap')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              tab === 'swap'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            🔄 Swap Tables
          </button>
        </div>

        {/* Tab Description */}
        <div className="p-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant leading-relaxed">
          {tab === 'move' && (
            <span>
              Transfer all active items from <strong>{currentTable}</strong> to a new empty table.
            </span>
          )}
          {tab === 'merge' && (
            <span>
              Combine items from <strong>{currentTable}</strong> into another occupied table's bill.
            </span>
          )}
          {tab === 'swap' && (
            <span>
              Exchange active table assignments between <strong>{currentTable}</strong> and target table.
            </span>
          )}
        </div>

        {/* Target Table Selector Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
            Select Destination Table:
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
            {filteredTables.map((t) => {
              const isSelected = selectedTargetTable === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTargetTable(t)}
                  className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-outline-variant/30 hover:border-outline text-on-surface'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirm {tab === 'move' ? 'Move' : tab === 'merge' ? 'Merge' : 'Swap'} to {selectedTargetTable}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
