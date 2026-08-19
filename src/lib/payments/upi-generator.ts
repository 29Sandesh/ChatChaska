import QRCode from 'qrcode';

export interface UPIPaymentRequest {
  merchantVpa: string;
  merchantName: string;
  amount: number;
  transactionNote: string;
  orderId?: string;
  tableNumber?: string;
}

/**
 * Builds standard NPCI UPI Intent URI
 * Example: upi://pay?pa=merchant@upi&pn=Cafe&am=450.00&cu=INR&tn=Table%204%20Bill
 */
export function generateUPIIntentUri(opts: UPIPaymentRequest): string {
  const { merchantVpa, merchantName, amount, transactionNote, orderId } = opts;
  const params = new URLSearchParams();
  params.set('pa', merchantVpa || 'paytmqr6z1f01@ptys');
  params.set('pn', merchantName || 'ChatChaska Cafe');
  params.set('am', amount.toFixed(2));
  params.set('cu', 'INR');
  params.set('tn', transactionNote || `Bill Payment #${orderId || 'Order'}`);

  return `upi://pay?${params.toString()}`;
}

/**
 * Generates a dynamic QR Code Data URL with exact pre-filled amount
 */
export async function generateUPIQRCode(opts: UPIPaymentRequest): Promise<string> {
  const uri = generateUPIIntentUri(opts);
  return await QRCode.toDataURL(uri, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 280,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });
}
