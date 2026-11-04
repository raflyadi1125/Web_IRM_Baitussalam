import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/app-error';

const secret = `${env.JWT_SECRET}:absensi-qr`;

export const generateQr = async (kegiatanId: number) => {
  const token = jwt.sign({ kegiatanId, typ: 'absensi' }, secret, { expiresIn: env.QR_TOKEN_TTL_SECONDS });
  const qrDataUrl = await QRCode.toDataURL(token, { margin: 1, width: 400 });
  return { token, qrDataUrl, expiresInSeconds: env.QR_TOKEN_TTL_SECONDS };
};

export const verifyQrToken = (token: string): number => {
  try {
    const payload = jwt.verify(token, secret) as unknown as { kegiatanId: number; typ: string };
    if (payload.typ !== 'absensi') throw new Error('typ');
    return payload.kegiatanId;
  } catch {
    throw new AppError('QR tidak valid atau sudah kedaluwarsa', 400);
  }
};
