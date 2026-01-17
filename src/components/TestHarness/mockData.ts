import { Activity } from "../../types/reindeer";

export const smallDataset: Activity[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    timestamp: "2023-11-01T10:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Charlie Brown", role: "CTO" }],
    description: "Initial discovery meeting.",
    linkedOpportunities: [
      {
        closeDate: "2023-12-15",
        stage: "Discovery",
        revenue: 50000,
        stageAdjustedRevenue: 10000,
      },
    ],
  },
];

export const typicalDataset: Activity[] = [
  {
    id: "a1",
    timestamp: "2023-10-01T09:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Charlie Brown", role: "CTO" }],
    description: "First contact",
    linkedOpportunities: [
      {
        closeDate: "2023-12-15",
        stage: "Discovery",
        revenue: 50000,
        stageAdjustedRevenue: 5000,
      },
    ],
  },
  {
    id: "a2",
    timestamp: "2023-10-15T14:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Diana Prince", role: "VP Engineering" }],
    description: "Deep dive demo",
    linkedOpportunities: [
      {
        closeDate: "2023-12-15",
        stage: "Proposal",
        revenue: 50000,
        stageAdjustedRevenue: 25000,
      },
    ],
  },
  {
    id: "b1",
    timestamp: "2023-11-01T10:00:00Z",
    sellers: [{ name: "Bob Jones", role: "Sales Engineer" }],
    customers: [{ name: "Eve White", role: "IT Manager" }],
    description: "Technical review",
    linkedOpportunities: [
      {
        closeDate: "2024-01-20",
        stage: "Qualified",
        revenue: 120000,
        stageAdjustedRevenue: 60000,
      },
    ],
  },
];

export const edgeCaseEmpty: Activity[] = [];

export const edgeCaseLarge: Activity[] = Array.from({ length: 20 }, (_, i) => ({
  id: `large-${i}`,
  timestamp: new Date(2023, 9, 1 + i).toISOString(),
  sellers: [{ name: "Seller A", role: "AE" }],
  customers: [{ name: "Customer B", role: "Champion" }],
  description: `Activity ${i}`,
  linkedOpportunities: [
    {
      closeDate: "2023-12-31",
      stage: "Closing",
      revenue: 10000 * (i + 1),
      stageAdjustedRevenue: 8000 * (i + 1),
    },
  ],
}));

export const datasets = {
  "Small (1 Activity)": smallDataset,
  "Typical (3 Activities, 2 Opps)": typicalDataset,
  "Edge: Empty": edgeCaseEmpty,
  "Edge: Large (20 Activities)": edgeCaseLarge,
};
