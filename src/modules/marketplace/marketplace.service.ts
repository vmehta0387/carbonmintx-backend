import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ListingStatus } from '@prisma/client';

@Injectable()
export class MarketplaceService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
  ) {}

  async createListing(sellerId: string, data: { tokenId: string; amount: number; pricePerToken: number }) {
    // For now, create listing in database only (blockchain integration later)
    return this.prisma.listing.create({
      data: { ...data, sellerId, txHash: 'pending' },
    });
  }

  async getListings() {
    return this.prisma.listing.findMany({
      where: { status: ListingStatus.ACTIVE },
      include: { seller: true },
    });
  }

  async buyCredits(buyerId: string, listingId: string, amount: number) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    const totalPrice = listing.pricePerToken * amount;

    // For now, record purchase in database only
    const purchase = await this.prisma.purchase.create({
      data: { listingId, buyerId, amount, totalPrice, txHash: 'pending' },
    });

    // Update listing
    await this.prisma.listing.update({
      where: { id: listingId },
      data: { 
        amount: listing.amount - amount,
        status: listing.amount === amount ? ListingStatus.SOLD : ListingStatus.ACTIVE 
      },
    });

    return purchase;
  }
}
