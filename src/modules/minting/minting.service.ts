import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';

interface CalculationInputs {
  // Renewable Energy
  netGenerationMWh?: number;
  baselineGenerationMWh?: number;
  gridEmissionFactor?: number;
  
  // Energy Efficiency
  energySavedMWh?: number;
  
  // Biomass
  energyGeneratedMWh?: number;
  fossilEmissionFactor?: number;
  ch4ProducedKg?: number;
  ch4CapturedKg?: number;
  
  // Cookstoves
  baselineFuelTonnesPerHH?: number;
  projectFuelTonnesPerHH?: number;
  numberOfHouseholds?: number;
  emissionFactorWood?: number;
  fNRB?: number;
  
  // Forestry
  biomassGrowthTons?: number;
  survivalRate?: number;
  carbonFraction?: number;
  
  // Biochar
  biocharProducedTons?: number;
  carbonContentFraction?: number;
  stabilityFactor?: number;
  
  // Generic
  baselineEmissionsTons?: number;
  projectEmissionsTons?: number;
  
  // Soil Carbon
  soilCarbonSequesteredTons?: number;
  areaHectares?: number;
  sequestrationRate?: number;
  
  // Fuel Switching
  baselineFuelConsumption?: number;
  projectFuelConsumption?: number;
  baselineEmissionFactor?: number;
  projectEmissionFactor?: number;
  
  // Composting
  organicWasteTons?: number;
  ch4AvoidedPerTon?: number;
  
  // Universal
  leakagePct?: number;
  nonPermanenceBufferPct?: number;
}

interface MintRequest {
  projectId: string;
  vintageYear: number;
  projectType: string;
  calculationInputs: CalculationInputs;
  monitoringPeriod: { from: string; to: string };
  evidence: string[];
  methodology: string;
}

@Injectable()
export class MintingService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
  ) {}

  async mintCredits(validatorId: string, request: MintRequest) {
    // Validation Rules
    await this.validateMintingRules(request.projectId, request.vintageYear, validatorId);
    
    // Calculate verified tonnes using industry formulas
    const { rawTonnes, verifiedTonnes, calculationSummary } = this.calculateCredits(
      request.projectType, 
      request.calculationInputs
    );
    
    if (verifiedTonnes <= 0) {
      throw new Error('400_BAD_INPUT: Verified tonnes must be > 0');
    }
    
    // Create metadata and upload to IPFS
    const metadata = await this.createMetadata(request, verifiedTonnes, calculationSummary, validatorId);
    const metadataUri = await this.uploadToIPFS(metadata);
    
    // Get project owner address
    const project = await this.prisma.project.findUnique({
      where: { id: request.projectId },
      include: { owner: true }
    });
    
    // Mint on blockchain
    const tokenId = await this.blockchainService.mintCreditsAdvanced(
      request.projectId,
      verifiedTonnes,
      metadataUri,
      project.owner.walletAddress
    );
    
    // Save to database
    await this.saveMintRecord(request, verifiedTonnes, tokenId, metadataUri, calculationSummary);
    
    return {
      verifiedTonnes,
      tokenId,
      metadataUri,
      status: 'MINTED',
      calculationSummary
    };
  }

  private calculateCredits(projectType: string, inputs: CalculationInputs) {
    let rawTonnes = 0;
    
    switch (projectType.toUpperCase()) {
      // Renewable Energy
      case 'SOLAR_POWER':
      case 'WIND_POWER':
      case 'HYDRO_POWER':
      case 'BIOMASS_POWER':
      case 'GEOTHERMAL':
      case 'RENEWABLE_ENERGY':
        rawTonnes = this.calculateRenewableEnergy(inputs);
        break;
        
      // Energy Efficiency
      case 'EFFICIENT_LIGHTING':
      case 'EFFICIENT_APPLIANCES':
      case 'INDUSTRIAL_HEAT_RECOVERY':
      case 'EFFICIENT_MOTORS':
      case 'ENERGY_EFFICIENCY':
        rawTonnes = this.calculateEnergyEfficiency(inputs);
        break;
        
      // Waste to Energy & Biomass
      case 'WASTE_TO_ENERGY':
      case 'ANAEROBIC_DIGESTION':
        rawTonnes = this.calculateBiomass(inputs);
        break;
        
      // Cookstoves
      case 'BIOMASS_COOKSTOVES':
      case 'LPG_ADOPTION':
      case 'COMMUNITY_KITCHENS':
      case 'COOKSTOVES':
        rawTonnes = this.calculateCookstoves(inputs);
        break;
        
      // Forestry & Land Use
      case 'REFORESTATION':
      case 'AFFORESTATION':
      case 'AVOIDED_DEFORESTATION':
      case 'FORESTRY_MANAGEMENT':
      case 'MANGROVE_RESTORATION':
      case 'MANGROVES_RESTORATION':
      case 'SEAGRASS_RESTORATION':
      case 'SALT_MARSH_PROJECTS':
        rawTonnes = this.calculateForestry(inputs);
        break;
        
      // Biochar
      case 'BIOCHAR_PRODUCTION':
      case 'BIOCHAR':
        rawTonnes = this.calculateBiochar(inputs);
        break;
        
      // Methane Capture
      case 'LANDFILL_METHANE_CAPTURE':
      case 'WASTEWATER_METHANE':
      case 'DAIRY_MANURE_MANAGEMENT':
      case 'CATTLE_ENTERIC_FERMENTATION':
      case 'METHANE_CAPTURE':
        rawTonnes = this.calculateMethaneCapture(inputs);
        break;
        
      // Soil Carbon
      case 'NO_TILL_FARMING':
      case 'COVER_CROPPING':
      case 'SOIL_ENRICHMENT':
      case 'SOIL_CARBON_SEQUESTRATION':
      case 'SOIL_CARBON':
        rawTonnes = this.calculateSoilCarbon(inputs);
        break;
        
      // Fuel Switching
      case 'COAL_TO_GAS':
      case 'DIESEL_TO_ELECTRIC':
        rawTonnes = this.calculateFuelSwitching(inputs);
        break;
        
      // Composting
      case 'COMPOSTING':
        rawTonnes = this.calculateComposting(inputs);
        break;
        
      default:
        rawTonnes = this.calculateGeneric(inputs);
    }
    
    // Apply universal formula
    const leakagePct = inputs.leakagePct || 0;
    const nonPermanenceBufferPct = inputs.nonPermanenceBufferPct || 10;
    
    const leakageTons = rawTonnes * (leakagePct / 100);
    const nonPermBuffer = rawTonnes * (nonPermanenceBufferPct / 100);
    
    const verifiedTonnes = Math.floor(rawTonnes - leakageTons - nonPermBuffer);
    
    return {
      rawTonnes,
      verifiedTonnes,
      calculationSummary: {
        rawTonnes,
        leakageTons,
        nonPermanenceBuffer: nonPermBuffer,
        leakagePct,
        nonPermanenceBufferPct
      }
    };
  }

  private calculateRenewableEnergy(inputs: CalculationInputs): number {
    const { netGenerationMWh, baselineGenerationMWh = 0, gridEmissionFactor } = inputs;
    
    if (!netGenerationMWh || !gridEmissionFactor) {
      throw new Error('400_BAD_INPUT: Missing netGenerationMWh or gridEmissionFactor');
    }
    
    const netMWh = netGenerationMWh - baselineGenerationMWh;
    return netMWh * gridEmissionFactor;
  }

  private calculateEnergyEfficiency(inputs: CalculationInputs): number {
    const { energySavedMWh, gridEmissionFactor } = inputs;
    
    if (!energySavedMWh || !gridEmissionFactor) {
      throw new Error('400_BAD_INPUT: Missing energySavedMWh or gridEmissionFactor');
    }
    
    return energySavedMWh * gridEmissionFactor;
  }

  private calculateBiomass(inputs: CalculationInputs): number {
    const { 
      energyGeneratedMWh, 
      fossilEmissionFactor, 
      ch4ProducedKg = 0, 
      ch4CapturedKg = 0 
    } = inputs;
    
    if (!energyGeneratedMWh || !fossilEmissionFactor) {
      throw new Error('400_BAD_INPUT: Missing energyGeneratedMWh or fossilEmissionFactor');
    }
    
    const GWP_CH4 = 28;
    const fuelDisplacement = energyGeneratedMWh * fossilEmissionFactor;
    const methaneAvoidance = (ch4ProducedKg - ch4CapturedKg) / 1000 * GWP_CH4;
    
    return fuelDisplacement + methaneAvoidance;
  }

  private calculateCookstoves(inputs: CalculationInputs): number {
    const {
      baselineFuelTonnesPerHH,
      projectFuelTonnesPerHH,
      numberOfHouseholds,
      emissionFactorWood = 1.747,
      fNRB = 0.5
    } = inputs;
    
    if (!baselineFuelTonnesPerHH || !projectFuelTonnesPerHH || !numberOfHouseholds) {
      throw new Error('400_BAD_INPUT: Missing cookstove calculation inputs');
    }
    
    const fuelSaved = (baselineFuelTonnesPerHH - projectFuelTonnesPerHH) * numberOfHouseholds;
    return fuelSaved * emissionFactorWood * fNRB;
  }

  private calculateForestry(inputs: CalculationInputs): number {
    const {
      biomassGrowthTons,
      survivalRate = 1,
      carbonFraction = 0.47,
      nonPermanenceBufferPct = 10
    } = inputs;
    
    if (!biomassGrowthTons) {
      throw new Error('400_BAD_INPUT: Missing biomassGrowthTons');
    }
    
    const carbonStored = biomassGrowthTons * carbonFraction * survivalRate;
    const co2 = carbonStored * 3.67;
    const buffer = co2 * (nonPermanenceBufferPct / 100);
    
    return co2 - buffer;
  }

  private calculateBiochar(inputs: CalculationInputs): number {
    const { biocharProducedTons, carbonContentFraction, stabilityFactor } = inputs;
    
    if (!biocharProducedTons || !carbonContentFraction || !stabilityFactor) {
      throw new Error('400_BAD_INPUT: Missing biochar calculation inputs');
    }
    
    return biocharProducedTons * carbonContentFraction * stabilityFactor * 3.67;
  }

  private calculateGeneric(inputs: CalculationInputs): number {
    const { baselineEmissionsTons, projectEmissionsTons } = inputs;
    
    if (!baselineEmissionsTons || !projectEmissionsTons) {
      throw new Error('400_BAD_INPUT: Missing baseline or project emissions');
    }
    
    return baselineEmissionsTons - projectEmissionsTons;
  }

  private calculateMethaneCapture(inputs: CalculationInputs): number {
    const { ch4CapturedKg, ch4ProducedKg = 0 } = inputs;
    
    if (!ch4CapturedKg) {
      throw new Error('400_BAD_INPUT: Missing methane capture data');
    }
    
    const GWP_CH4 = 28;
    return (ch4CapturedKg - ch4ProducedKg) / 1000 * GWP_CH4;
  }

  private calculateSoilCarbon(inputs: CalculationInputs): number {
    const { soilCarbonSequesteredTons, areaHectares, sequestrationRate } = inputs;
    
    if (soilCarbonSequesteredTons) {
      return soilCarbonSequesteredTons * 3.67; // Convert C to CO2
    }
    
    if (areaHectares && sequestrationRate) {
      return areaHectares * sequestrationRate * 3.67;
    }
    
    throw new Error('400_BAD_INPUT: Missing soil carbon sequestration data');
  }

  private calculateFuelSwitching(inputs: CalculationInputs): number {
    const { 
      baselineFuelConsumption, 
      projectFuelConsumption, 
      baselineEmissionFactor, 
      projectEmissionFactor 
    } = inputs;
    
    if (!baselineFuelConsumption || !projectFuelConsumption || 
        !baselineEmissionFactor || !projectEmissionFactor) {
      throw new Error('400_BAD_INPUT: Missing fuel switching parameters');
    }
    
    const baselineEmissions = baselineFuelConsumption * baselineEmissionFactor;
    const projectEmissions = projectFuelConsumption * projectEmissionFactor;
    
    return baselineEmissions - projectEmissions;
  }

  private calculateComposting(inputs: CalculationInputs): number {
    const { organicWasteTons, ch4AvoidedPerTon = 0.5 } = inputs;
    
    if (!organicWasteTons) {
      throw new Error('400_BAD_INPUT: Missing organic waste tonnage');
    }
    
    const GWP_CH4 = 28;
    return organicWasteTons * ch4AvoidedPerTon * GWP_CH4;
  }

  private async validateMintingRules(projectId: string, vintageYear: number, validatorId: string) {
    // Check if validator is authorized
    const validator = await this.prisma.user.findUnique({
      where: { id: validatorId }
    });
    
    if (!validator || !['VALIDATOR', 'ADMIN'].includes(validator.role)) {
      throw new Error('401_UNAUTHORIZED: Not a validator');
    }
    
    // Check project status and approval
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { 
        owner: true, 
        documents: true,
        validations: true
      }
    });
    
    if (!project) {
      throw new Error('400_BAD_INPUT: Project not found');
    }
    
    if (project.status !== 'APPROVED') {
      throw new Error('403_PROJECT_NOT_APPROVED: Project must be approved');
    }
    
    // Check owner KYC status
    const kyc = await this.prisma.kYC.findUnique({
      where: { userId: project.ownerId }
    });
    
    if (!kyc || kyc.status !== 'VERIFIED') {
      throw new Error('403_KYC_FAILED: Owner KYC not verified');
    }
    
    // Check mandatory documents
    const requiredDocTypes = ['PROJECT_DESIGN', 'BASELINE_STUDY', 'MONITORING_PLAN'];
    const uploadedDocTypes = project.documents.map(d => d.type.toString());
    const missingDocs = requiredDocTypes.filter(type => !uploadedDocTypes.includes(type));
    
    if (missingDocs.length > 0) {
      throw new Error(`422_DOCS_INCOMPLETE: Missing documents: ${missingDocs.join(', ')}`);
    }
    
    // Check for duplicate vintage
    const existingMint = await this.prisma.creditBatch.findFirst({
      where: { 
        projectId, 
        vintageYear 
      }
    });
    
    if (existingMint) {
      throw new Error('409_DUPLICATE_VINTAGE: Credits already minted for this vintage year');
    }
  }

  private async createMetadata(request: MintRequest, verifiedTonnes: number, calculationSummary: any, validatorId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: request.projectId },
      include: { owner: true }
    });
    
    const validator = await this.prisma.user.findUnique({
      where: { id: validatorId }
    });
    
    return {
      projectId: request.projectId,
      projectName: project.name,
      projectType: request.projectType,
      vintageYear: request.vintageYear,
      verifiedTonnes,
      methodology: request.methodology,
      monitoringPeriod: request.monitoringPeriod,
      validator: {
        id: validator.id,
        name: validator.fullName || validator.walletAddress
      },
      evidence: request.evidence,
      calculationSummary,
      issuedAt: new Date().toISOString()
    };
  }

  private async uploadToIPFS(metadata: any): Promise<string> {
    // Mock IPFS upload - replace with actual IPFS service
    try {
      const hash = `Qm${Math.random().toString(36).substring(2, 15)}`;
      return `ipfs://${hash}`;
    } catch (error) {
      throw new Error('500_IPFS_ERROR: Failed to upload metadata to IPFS');
    }
  }

  private async saveMintRecord(request: MintRequest, verifiedTonnes: number, tokenId: string, metadataUri: string, calculationSummary: any) {
    return this.prisma.creditBatch.create({
      data: {
        projectId: request.projectId,
        tokenId,
        verifiedTonnes,
        vintageYear: request.vintageYear,
        methodology: request.methodology,
        metadataUri,
        calculationInputs: request.calculationInputs as any,
        calculationSummary: calculationSummary as any,
        monitoringPeriod: request.monitoringPeriod as any,
        evidence: request.evidence,
        status: 'MINTED'
      }
    });
  }
}