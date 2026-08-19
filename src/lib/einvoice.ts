import { Bill } from '@/types';

export interface EInvoicePayload {
  version: string;
  tranDetails: {
    taxSch: string;
    supplyType: string;
  };
  docDetails: {
    typ: string;
    no: string;
    dt: string;
  };
  sellerDetails: {
    gstin: string;
    lglNm: string;
    addr1: string;
    loc: string;
    pin: number;
    stcd: string;
  };
  buyerDetails: {
    gstin?: string;
    lglNm: string;
    pos: string;
  };
  itemList: Array<{
    slNo: string;
    prdDesc: string;
    isServc: string;
    hsnCd: string;
    unitPrice: number;
    totAmt: number;
    gstRt: number;
    igstAmt: number;
    cgstAmt: number;
    sgstAmt: number;
  }>;
  valDetails: {
    assVal: number;
    cgstVal: number;
    sgstVal: number;
    totInvVal: number;
  };
}

export function generateEInvoicePayload(bill: Bill, gstin = '27AAAAA0000A1Z5'): EInvoicePayload {
  const dateStr = new Date(bill.createdAt || Date.now()).toISOString().split('T')[0];

  return {
    version: '1.03',
    tranDetails: {
      taxSch: 'GST',
      supplyType: 'B2C',
    },
    docDetails: {
      typ: 'INV',
      no: bill.id,
      dt: dateStr,
    },
    sellerDetails: {
      gstin,
      lglNm: bill.restaurantName || 'Spice Garden',
      addr1: '42 Linking Road, Bandra West',
      loc: 'Mumbai',
      pin: 400050,
      stcd: '27',
    },
    buyerDetails: {
      lglNm: bill.tableNumber || 'Walk-in Guest',
      pos: '27',
    },
    itemList: bill.items.map((item, idx) => ({
      slNo: String(idx + 1),
      prdDesc: item.name,
      isServc: 'Y',
      hsnCd: '996331', // SAC code for restaurant services
      unitPrice: item.unitPrice,
      totAmt: item.lineTotal,
      gstRt: bill.gstPercent || 5,
      igstAmt: 0,
      cgstAmt: Number((item.lineTotal * 0.025).toFixed(2)),
      sgstAmt: Number((item.lineTotal * 0.025).toFixed(2)),
    })),
    valDetails: {
      assVal: bill.subtotal - bill.discountAmount,
      cgstVal: bill.cgstAmount || 0,
      sgstVal: bill.sgstAmount || 0,
      totInvVal: bill.grandTotal,
    },
  };
}

export function generateIRNHash(billId: string, date: string): string {
  // Hash simulation for IRN (64-character hex String)
  return `IRN${Date.now()}A8F9C1E2D3B4A5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7`;
}
