import { Controller, Get } from '@nestjs/common';
import { PROJECT_CATEGORIES, METHODOLOGY_CODES } from '../minting/methodology-codes';

@Controller('methodologies')
export class MethodologyController {
  
  @Get('categories')
  getProjectCategories() {
    return PROJECT_CATEGORIES;
  }

  @Get('codes')
  getMethodologyCodes() {
    return METHODOLOGY_CODES;
  }

  @Get('types')
  getProjectTypes() {
    return Object.entries(PROJECT_CATEGORIES).map(([category, types]) => ({
      category,
      types: types.map(type => ({
        value: type,
        label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        codes: METHODOLOGY_CODES[type] || []
      }))
    }));
  }
}