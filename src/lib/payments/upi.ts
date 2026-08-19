import QRCode from 'qrcode';

export interface UPIPaymentDetails {
  upiId: string; // e.g. spicegarden@okicici
  merchantName: string;
  amount: number;
  billId: string;
  note?: string;
}

export function generateUPIString(details: UPIPaymentDetails): string {
  const note = encodeURIComponent(details.note || `Bill ${details.billId}`);
  const merchant = encodeURIComponent(details.merchantName);
  return `upi://pay?pa=${details.upiId}&pn=${merchant}&am=${details.amount}&cu=INR&tn=${note}`;
}

export async function generateUPIQRCodeDataUrl(details: UPIPaymentDetails): Promise<string> {
  const upiString = generateUPIString(details);
  try {
    const dataUrl = await QRCode.toDataURL(upiString, { width: 250, margin: 2 });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate UPI QR code', err);
    return '';
  }
}
