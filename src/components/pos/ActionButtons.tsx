'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import styles from './ActionButtons.module.css';

interface ActionButtonsProps {
  isDisabled: boolean;
  heldCount: number;
  onHold: () => void;
  onOpenHeld: () => void;
  onSendKOT: () => void;
  onSaveBill: () => void;
}

/**
 * ActionButtons component renders:
 * - Square 2-in-1 Hold & Recall button (with count badge & tooltip)
 * - Send KOT button
 * - Save & Print button
 */
export function ActionButtons({
  isDisabled,
  heldCount,
  onHold,
  onOpenHeld,
  onSendKOT,
  onSaveBill,
}: ActionButtonsProps) {
  // Handle 2-in-1 Hold / Recall click:
  // If cart has items, park/hold the bill.
  // If cart is empty or user clicks badge/icon, open recall drawer.
  const handleHoldRecallClick = () => {
    if (!isDisabled) {
      onHold();
    } else {
      onOpenHeld();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.actionRow}>
        {/* SQUARE 2-IN-1 HOLD / RECALL BUTTON */}
        <button
          className={cn(
            styles.squareHoldBtn,
            heldCount > 0 && styles.hasHeld
          )}
          onClick={handleHoldRecallClick}
          title={
            !isDisabled
              ? 'Hold current bill (F3) / Click badge to view parked'
              : 'View parked bills (F4)'
          }
        >
          <span className="material-symbols-outlined text-[20px]">pause_circle</span>
          {heldCount > 0 && (
            <span
              className={styles.recallBadge}
              onClick={(e) => {
                e.stopPropagation();
                onOpenHeld();
              }}
              title="Open parked bills"
            >
              {heldCount}
            </span>
          )}
        </button>

        {/* SEND KOT BUTTON */}
        <button
          className={cn(styles.btn, styles.kotBtn)}
          onClick={onSendKOT}
          disabled={isDisabled}
          title="Send order to Kitchen display (F9)"
        >
          <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
          <span>Send KOT</span>
        </button>

        {/* SAVE & PRINT BUTTON */}
        <button
          className={cn(styles.btn, styles.saveBtn)}
          onClick={onSaveBill}
          disabled={isDisabled}
          title="Save & Print receipt (F12)"
        >
          <span className="material-symbols-outlined text-[18px]">receipt</span>
          <span>Save & Print</span>
        </button>
      </div>
    </div>
  );
}
