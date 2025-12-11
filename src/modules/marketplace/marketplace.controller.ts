import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';

@Controller('marketplace')
@UseGuards(JwtAuthGuard)
export class MarketplaceController {
  constructor(private marketplaceService: MarketplaceService) {}

  @Post('list')
  createListing(@Request() req, @Body() body: { tokenId: string; amount: number; pricePerToken: number }) {
    return this.marketplaceService.createListing(req.user.id, body);
  }

  @Get('listings')
  getListings() {
    return this.marketplaceService.getListings();
  }

  @Post('buy')
  buyCredits(@Request() req, @Body() body: { listingId: string; amount: number }) {
    return this.marketplaceService.buyCredits(req.user.id, body.listingId, body.amount);
  }
}
