export interface Seller {
  name: string;
  role: string;
}

export interface Customer {
  name: string;
  role: string;
}

export interface Opportunity {
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
