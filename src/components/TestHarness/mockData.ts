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
        id: "opp-001",
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
        id: "opp-101",
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
        id: "opp-101",
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
        id: "opp-102",
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
      id: `opp-large-${i}`,
      closeDate: "2023-12-31",
      stage: "Closing",
      revenue: 10000 * (i + 1),
      stageAdjustedRevenue: 8000 * (i + 1),
    },
  ],
}));

// Face-specific test scenarios for Visual TDD
export const faceSingleYearLowRevenue: Activity[] = [
  {
    id: "face-single-1",
    timestamp: "2023-03-15T10:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Bob Johnson", role: "CTO" }],
    description: "Q1 Discovery Call",
    linkedOpportunities: [
      {
        closeDate: "2023-03-31",
        stage: "Discovery",
        revenue: 15000,
        stageAdjustedRevenue: 3000,
      },
    ],
  },
  {
    id: "face-single-2",
    timestamp: "2023-06-10T14:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Carol White", role: "VP Engineering" }],
    description: "Q2 Demo",
    linkedOpportunities: [
      {
        closeDate: "2023-06-30",
        stage: "Proposal",
        revenue: 25000,
        stageAdjustedRevenue: 12500,
      },
    ],
  },
  {
    id: "face-single-3",
    timestamp: "2023-09-20T09:00:00Z",
    sellers: [{ name: "Bob Jones", role: "Sales Engineer" }],
    customers: [{ name: "Dave Brown", role: "IT Manager" }],
    description: "Q3 Technical Review",
    linkedOpportunities: [
      {
        closeDate: "2023-09-15",
        stage: "Qualified",
        revenue: 10000,
        stageAdjustedRevenue: 5000,
      },
    ],
  },
];

export const faceMultiYearOpportunities: Activity[] = [
  {
    id: "face-multi-1",
    timestamp: "2022-11-01T10:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Eve Green", role: "CFO" }],
    description: "2022 Q4 Initial Contact",
    linkedOpportunities: [
      {
        closeDate: "2022-12-15",
        stage: "Discovery",
        revenue: 50000,
        stageAdjustedRevenue: 10000,
      },
    ],
  },
  {
    id: "face-multi-2",
    timestamp: "2023-02-15T11:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Frank Black", role: "CTO" }],
    description: "2023 Q1 Follow-up",
    linkedOpportunities: [
      {
        closeDate: "2023-03-31",
        stage: "Proposal",
        revenue: 75000,
        stageAdjustedRevenue: 37500,
      },
    ],
  },
  {
    id: "face-multi-3",
    timestamp: "2023-07-20T14:00:00Z",
    sellers: [{ name: "Bob Jones", role: "Sales Engineer" }],
    customers: [{ name: "Grace Lee", role: "VP Engineering" }],
    description: "2023 Q3 Expansion",
    linkedOpportunities: [
      {
        closeDate: "2023-08-31",
        stage: "Closing",
        revenue: 120000,
        stageAdjustedRevenue: 96000,
      },
    ],
  },
  {
    id: "face-multi-4",
    timestamp: "2024-01-10T09:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Henry Wilson", role: "CEO" }],
    description: "2024 Q1 Renewal",
    linkedOpportunities: [
      {
        closeDate: "2024-02-28",
        stage: "Qualified",
        revenue: 90000,
        stageAdjustedRevenue: 45000,
      },
    ],
  },
];

export const faceSameMonthMultipleOpps: Activity[] = [
  {
    id: "face-same-1",
    timestamp: "2023-06-01T10:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Ian Davis", role: "CTO" }],
    description: "June Deal 1 - Large Enterprise",
    linkedOpportunities: [
      {
        closeDate: "2023-06-30",
        stage: "Closing",
        revenue: 200000,
        stageAdjustedRevenue: 160000,
      },
    ],
  },
  {
    id: "face-same-2",
    timestamp: "2023-06-05T14:00:00Z",
    sellers: [{ name: "Bob Jones", role: "Sales Engineer" }],
    customers: [{ name: "Jane Miller", role: "VP Engineering" }],
    description: "June Deal 2 - Mid-Market",
    linkedOpportunities: [
      {
        closeDate: "2023-06-15",
        stage: "Proposal",
        revenue: 75000,
        stageAdjustedRevenue: 37500,
      },
    ],
  },
  {
    id: "face-same-3",
    timestamp: "2023-06-10T11:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Kevin Brown", role: "IT Director" }],
    description: "June Deal 3 - SMB",
    linkedOpportunities: [
      {
        closeDate: "2023-06-20",
        stage: "Discovery",
        revenue: 25000,
        stageAdjustedRevenue: 5000,
      },
    ],
  },
  {
    id: "face-same-4",
    timestamp: "2023-06-15T09:00:00Z",
    sellers: [{ name: "Carol White", role: "Account Executive" }],
    customers: [{ name: "Laura Chen", role: "CFO" }],
    description: "June Deal 4 - Strategic",
    linkedOpportunities: [
      {
        closeDate: "2023-06-28",
        stage: "Qualified",
        revenue: 150000,
        stageAdjustedRevenue: 75000,
      },
    ],
  },
  {
    id: "face-same-5",
    timestamp: "2023-07-01T10:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Mike Taylor", role: "CTO" }],
    description: "July Deal - Comparison",
    linkedOpportunities: [
      {
        closeDate: "2023-07-31",
        stage: "Proposal",
        revenue: 100000,
        stageAdjustedRevenue: 50000,
      },
    ],
  },
];

export const datasets = {
  "Small (1 Activity)": smallDataset,
  "Typical (3 Activities, 2 Opps)": typicalDataset,
  "Edge: Empty": edgeCaseEmpty,
  "Edge: Large (20 Activities)": edgeCaseLarge,
  "Face: Single Year, Low Revenue": faceSingleYearLowRevenue,
  "Face: Multi-Year Opportunities": faceMultiYearOpportunities,
  "Face: Same Month Multiple Opps": faceSameMonthMultipleOpps,
};
