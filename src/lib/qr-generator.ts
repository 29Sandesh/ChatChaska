import QRCode from 'qrcode';

export interface QRRenderOptions {
  cafeName: string;
  tableLabel: string;
  tableNumber: string;
  cafeSlug: string;
  templateId?: string;
  domain?: string;
}

/**
 * Builds the customer-facing QR target URL
 */
export function buildQRUrl(cafeSlug: string, tableNumber: string, domain?: string): string {
  const base = domain || (typeof window !== 'undefined' ? window.location.origin : 'https://chatchaska.vercel.app');
  return `${base}/menu/${cafeSlug}?table=${encodeURIComponent(tableNumber)}`;
}

/**
 * Generates a full branded standee card (Canvas -> Data URL)
 */
export async function generateBrandedQRCard(opts: QRRenderOptions): Promise<string> {
  const { cafeName, tableLabel, tableNumber, cafeSlug, templateId = 'classic', domain } = opts;
  const targetUrl = buildQRUrl(cafeSlug, tableNumber, domain);

  // 1. Generate core QR code matrix
  const qrDataUrl = await QRCode.toDataURL(targetUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 320,
    color: {
      dark: templateId === 'premium' ? '#0f172a' : '#1e293b',
      light: '#ffffff',
    },
  });

  if (typeof document === 'undefined') {
    return qrDataUrl; // SSR fallback
  }

  // 2. Render branded template on HTML5 Canvas
  const canvas = document.createElement('canvas');
  const width = 600;
  const height = 800;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return qrDataUrl;

  // Background Styles
  if (templateId === 'premium') {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Gold decorative border
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, width - 48, height - 48);

    ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(32, 32, width - 64, height - 64);
  } else if (templateId === 'vibrant') {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#ea580c');
    gradient.addColorStop(1, '#c2410c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, width - 48, height - 48);
  } else if (templateId === 'festive') {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#581c87');
    gradient.addColorStop(1, '#3b0764');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, width - 48, height - 48);
  } else if (templateId === 'modern') {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Accent header strip
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(0, 0, width, 16);
  } else {
    // Classic Gold
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#d4a03c';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, width - 48, height - 48);
  }

  // Header: Cafe Name
  ctx.textAlign = 'center';
  const textColor = templateId === 'premium' || templateId === 'vibrant' || templateId === 'festive' ? '#ffffff' : '#0f172a';
  ctx.fillStyle = textColor;
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(cafeName.toUpperCase(), width / 2, 100);

  // Subtitle: Table Badge
  ctx.fillStyle = templateId === 'premium' ? '#eab308' : templateId === 'modern' ? '#ff6b6b' : '#f97316';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`📍 ${tableLabel || `Table ${tableNumber}`}`, width / 2, 145);

  // Instruction
  ctx.fillStyle = templateId === 'premium' || templateId === 'vibrant' || templateId === 'festive' ? '#cbd5e1' : '#64748b';
  ctx.font = '16px sans-serif';
  ctx.fillText('Scan with Phone Camera to View Menu & Order', width / 2, 185);

  // QR Code Image Container Card
  const qrX = (width - 340) / 2;
  const qrY = 220;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(qrX - 10, qrY - 10, 360, 360, 24);
  ctx.fill();

  // Draw QR Image
  const qrImg = new Image();
  await new Promise((resolve) => {
    qrImg.onload = resolve;
    qrImg.src = qrDataUrl;
  });
  ctx.drawImage(qrImg, qrX + 10, qrY + 10, 320, 320);

  // Center "C" logo inside QR
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.arc(width / 2, qrY + 170, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('C', width / 2, qrY + 177);

  // Footer: Brand Watermark
  ctx.fillStyle = textColor;
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('POWERED BY CHATCHASKA', width / 2, 650);

  ctx.fillStyle = templateId === 'premium' || templateId === 'vibrant' || templateId === 'festive' ? '#94a3b8' : '#94a3b8';
  ctx.font = '13px sans-serif';
  ctx.fillText('Instant Digital Ordering • 0 App Download Needed', width / 2, 680);

  return canvas.toDataURL('image/png');
}
