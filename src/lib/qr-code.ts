import QRCode from 'qrcode';

const QR_RENDER_OPTIONS = {
  errorCorrectionLevel: 'H' as const,
  margin: 2,
  width: 1024,
  color: { dark: '#000000', light: '#ffffff' },
};

export async function generateQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, QR_RENDER_OPTIONS);
}

export async function generateQrPngBuffer(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    ...QR_RENDER_OPTIONS,
    type: 'png',
  });
}
