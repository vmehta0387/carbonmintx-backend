import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async generateCertificate(userId: string, tokenId: string, amount: number, txHash: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const certDir = join(process.cwd(), 'certificates');
    await mkdir(certDir, { recursive: true });

    const filename = `cert-${Date.now()}.pdf`;
    const filepath = join(certDir, filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const stream = createWriteStream(filepath);

      doc.pipe(stream);
      doc.fontSize(25).text('Carbon Credit Retirement Certificate', 100, 100);
      doc.fontSize(15).text(`Wallet: ${user.walletAddress}`, 100, 150);
      doc.text(`Token ID: ${tokenId}`, 100, 180);
      doc.text(`Amount: ${amount} tons CO₂`, 100, 210);
      doc.text(`Transaction: ${txHash}`, 100, 240);
      doc.text(`Date: ${new Date().toISOString()}`, 100, 270);
      doc.end();

      stream.on('finish', async () => {
        const pdfUrl = `/certificates/${filename}`;
        await this.prisma.certificate.create({
          data: { userId, tokenId, amount, pdfUrl, txHash },
        });
        resolve(pdfUrl);
      });

      stream.on('error', reject);
    });
  }
}
