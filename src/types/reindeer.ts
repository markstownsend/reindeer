// Raw Data Interfaces (migrated from src/types.ts)

export interface Seller {
  name: string;
  role: string;
}

export interface Customer {
  name: string;
  role: string;
}

export interface Opportunity {
  id: string;
  closeDate: string; // ISO 8601 date YYYY-MM-DD
  stage: string;
  revenue: number;
  stageAdjustedRevenue: number;
}

export interface Activity {
  id: string;
  timestamp: string; // ISO 8601 UTC format
  sellers: Seller[];
  customers: Customer[];
  description: string;
  linkedOpportunities: Opportunity[];
}

export interface ReindeerData {
  activities: Activity[];
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
}

/**
 * Represents a complete antler structure combining a beam (vertical timeline)
 * with its burr (horizontal connector) and the associated opportunity.
 */
export interface Antler {
  beam: Beam;
  burr: { startX: number; endX: number; y: number };
  connectedOpportunity: Opportunity;
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

// Configuration Interfaces

/**
 * Configuration for mapping stage and role values to Tailwind CSS classes.
 * Supports visual differentiation of opportunities by stage and
 * activities by participant role.
 */
export interface ReindeerConfig {
  stageStyleMap: Record<string, string>; // e.g., { "Discovery": "fill-blue-500", "Proposal": "fill-green-500" }
  roleStyleMap: Record<string, string>; // e.g., { "economic buyer": "fill-red-500", "technical buyer": "fill-yellow-500" }
}
