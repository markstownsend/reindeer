// Raw Data Interfaces (migrated from src/types.ts)

export interface Seller {
  name: string;
  role: string;
  country?: string; // ISO 3166-1 alpha-2 code (e.g., "US", "GB", "DE")
}

export interface Customer {
  name: string;
  role: string;
  country?: string; // ISO 3166-1 alpha-2 code (e.g., "US", "GB", "DE")
}

export interface Opportunity {
  id: string;
  name?: string; // Human-readable opportunity name
  closeDate: string; // ISO 8601 date YYYY-MM-DD
  stage: string;
  revenue: number;
  stageAdjustedRevenue: number;
}

export interface Partner {
  name: string;
  role: string;
  country?: string; // ISO 3166-1 alpha-2 code (e.g., "US", "GB", "DE")
}

export interface Activity {
  id: string;
  timestamp: string; // ISO 8601 UTC format
  type?: string; // Activity type: "meeting", "call", "email", "demo", "workshop" (defaults to "meeting")
  sellers: Seller[];
  customers: Customer[];
  partners?: Partner[];
  description: string;
  linkedOpportunities: Opportunity[];
}

// Internal Visualization Model Interfaces

/**
 * Represents a vertical timeline (beam) in the Antler component.
 * Each beam contains activities plotted chronologically and connects
 * to an opportunity via the burr.
 */
export interface Beam {
  activities: Activity[];
  ordinalPosition: number;
  verticalExtent: { min: Date; max: Date };
  burrConnection: { x: number; y: number };
  type: "bound" | "free";
  linkedOpportunityId?: string;
}

/**
 * Represents a time-bucketed grouping of opportunities in the Face component.
 * Opportunities are grouped by time period (monthly or quarterly) and
 * rendered as stacked bars.
 */
export interface FaceBucket {
  bucketId: string; // Time period identifier (e.g., "2023-12", "2024-Q1")
  opportunities: Opportunity[];
  yPosition: number; // Vertical position of the bucket
  height: number; // Height of the bucket row
  totalRevenue: number; // Sum of revenue for sizing calculations
  maxWidth: number; // Maximum width constraint for the stacked bar
}

/**
 * Represents an individual opportunity within a stacked bar in the Face.
 * Contains computed positioning and visual state for D3 rendering.
 */
export interface StackedOpportunity {
  opportunity: Opportunity; // Reference to source Opportunity
  bucketId: string; // Reference to parent FaceBucket
  xPosition: number; // Computed horizontal position within the bar
  width: number; // Computed width based on normalized revenue
  isSelected: boolean; // Visual state for selection
  isHovered: boolean; // Visual state for hover
  opacity: number; // Visual state for emphasis/de-emphasis
}

/**
 * Aggregated metrics for a single opportunity stage used by the nose layer.
 */
export interface StageBucket {
  stage: string;
  opportunityRevenueTotal: number;
  activityCountTotal: number;
}

/**
 * Aggregated stage data for the nose donut section.
 */
export interface StageAggregationResult {
  buckets: StageBucket[];
  allStagesRevenueTotal: number;
  allStagesActivityCountTotal: number;
}
