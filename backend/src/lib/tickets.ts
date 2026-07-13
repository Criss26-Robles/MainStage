import QRCode from 'qrcode';

export async function generateQrDataUrl(code: string): Promise<string> {
  return QRCode.toDataURL(code, {
    margin: 1,
    width: 280,
    color: { dark: '#0a0a0a', light: '#ffffff' }
  });
}
