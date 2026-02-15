import type { Activity } from "../../types/reindeer";

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
        id: "opp-face-single-1",
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
        id: "opp-face-single-2",
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
        id: "opp-face-single-3",
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
        id: "opp-face-multi-1",
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
        id: "opp-face-multi-2",
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
        id: "opp-face-multi-3",
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
        id: "opp-face-multi-4",
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
        id: "opp-face-same-1",
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
        id: "opp-face-same-2",
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
        id: "opp-face-same-3",
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
        id: "opp-face-same-4",
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
        id: "opp-face-same-5",
        closeDate: "2023-07-31",
        stage: "Proposal",
        revenue: 100000,
        stageAdjustedRevenue: 50000,
      },
    ],
  },
];

// Antler/Beam-specific test scenarios for Visual TDD
export const beamComplexDisplacement: Activity[] = [
  {
    id: "beam-1",
    timestamp: "2023-01-15T10:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Charlie Brown", role: "CTO" }],
    description: "Large opp - first activity",
    linkedOpportunities: [
      {
        id: "opp-beam-1",
        closeDate: "2023-12-31",
        stage: "Closing",
        revenue: 500000,
        stageAdjustedRevenue: 400000,
      },
    ],
  },
  {
    id: "beam-2",
    timestamp: "2023-02-10T14:00:00Z",
    sellers: [{ name: "Bob Jones", role: "Sales Engineer" }],
    customers: [{ name: "Diana Prince", role: "VP Engineering" }],
    description: "Large opp - second activity",
    linkedOpportunities: [
      {
        id: "opp-beam-1",
        closeDate: "2023-12-31",
        stage: "Closing",
        revenue: 500000,
        stageAdjustedRevenue: 400000,
      },
    ],
  },
  {
    id: "beam-3",
    timestamp: "2023-03-20T09:00:00Z",
    sellers: [{ name: "Carol White", role: "Account Executive" }],
    customers: [{ name: "Eve Green", role: "CFO" }],
    description: "Second largest opp - activity 1",
    linkedOpportunities: [
      {
        id: "opp-beam-2",
        closeDate: "2023-11-30",
        stage: "Proposal",
        revenue: 300000,
        stageAdjustedRevenue: 150000,
      },
    ],
  },
  {
    id: "beam-4",
    timestamp: "2023-04-15T11:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Frank Black", role: "CTO" }],
    description: "Third largest opp - activity 1",
    linkedOpportunities: [
      {
        id: "opp-beam-3",
        closeDate: "2023-10-15",
        stage: "Qualified",
        revenue: 200000,
        stageAdjustedRevenue: 100000,
      },
    ],
  },
  {
    id: "beam-5",
    timestamp: "2023-05-10T10:00:00Z",
    sellers: [{ name: "Bob Jones", role: "Sales Engineer" }],
    customers: [{ name: "Grace Lee", role: "VP Engineering" }],
    description: "Fourth largest opp - activity 1",
    linkedOpportunities: [
      {
        id: "opp-beam-4",
        closeDate: "2023-09-30",
        stage: "Discovery",
        revenue: 150000,
        stageAdjustedRevenue: 7500,
      },
    ],
  },
  {
    id: "beam-6",
    timestamp: "2023-06-05T14:00:00Z",
    sellers: [{ name: "Carol White", role: "Account Executive" }],
    customers: [{ name: "Henry Wilson", role: "CEO" }],
    description: "Fifth largest opp - activity 1",
    linkedOpportunities: [
      {
        id: "opp-beam-5",
        closeDate: "2023-08-31",
        stage: "Proposal",
        revenue: 100000,
        stageAdjustedRevenue: 50000,
      },
    ],
  },
];

export const beamSingleActivity: Activity[] = [
  {
    id: "beam-single-1",
    timestamp: "2023-03-15T10:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Bob Johnson", role: "CTO" }],
    description: "Single activity on beam",
    linkedOpportunities: [
      {
        id: "opp-beam-single-1",
        closeDate: "2023-12-31",
        stage: "Discovery",
        revenue: 75000,
        stageAdjustedRevenue: 7500,
      },
    ],
  },
];

export const beamMultipleParticipants: Activity[] = [
  {
    id: "beam-multi-1",
    timestamp: "2023-01-15T10:00:00Z",
    sellers: [
      { name: "Alice Smith", role: "Account Executive" },
      { name: "Bob Jones", role: "Sales Engineer" },
    ],
    customers: [
      { name: "Charlie Brown", role: "CTO" },
      { name: "Diana Prince", role: "VP Engineering" },
    ],
    description: "Activity with multiple participants",
    linkedOpportunities: [
      {
        id: "opp-beam-multi-1",
        closeDate: "2023-12-31",
        stage: "Closing",
        revenue: 200000,
        stageAdjustedRevenue: 160000,
      },
    ],
  },
  {
    id: "beam-multi-2",
    timestamp: "2023-02-20T14:00:00Z",
    sellers: [{ name: "Carol White", role: "Account Executive" }],
    customers: [{ name: "Eve Green", role: "CFO" }],
    description: "Activity with single participant",
    linkedOpportunities: [
      {
        id: "opp-beam-multi-1",
        closeDate: "2023-12-31",
        stage: "Closing",
        revenue: 200000,
        stageAdjustedRevenue: 160000,
      },
    ],
  },
];

// Multi-scale test scenarios
export const multiScaleActivitiesOnly: Activity[] = [
  {
    id: "ms-activities-1",
    timestamp: "2023-01-15T10:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Charlie Brown", role: "CTO" }],
    description: "Q1 Discovery Call",
    linkedOpportunities: [],
  },
  {
    id: "ms-activities-2",
    timestamp: "2023-02-20T14:00:00Z",
    sellers: [{ name: "Bob Jones", role: "Sales Engineer" }],
    customers: [{ name: "Diana Prince", role: "VP Engineering" }],
    description: "Q2 Technical Review",
    linkedOpportunities: [],
  },
  {
    id: "ms-activities-3",
    timestamp: "2023-03-10T09:00:00Z",
    sellers: [{ name: "Carol White", role: "Account Executive" }],
    customers: [{ name: "Eve Green", role: "CFO" }],
    description: "Q3 Demo",
    linkedOpportunities: [],
  },
];

export const multiScaleOpportunitiesOnly: Activity[] = [
  {
    id: "ms-opps-1",
    timestamp: "2023-01-15T10:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Charlie Brown", role: "CTO" }],
    description: "Linked to opp 1",
    linkedOpportunities: [
      {
        id: "opp-ms-1",
        closeDate: "2023-06-30",
        stage: "Discovery",
        revenue: 50000,
        stageAdjustedRevenue: 5000,
      },
    ],
  },
  {
    id: "ms-opps-2",
    timestamp: "2023-02-20T14:00:00Z",
    sellers: [{ name: "Bob Jones", role: "Sales Engineer" }],
    customers: [{ name: "Diana Prince", role: "VP Engineering" }],
    description: "Linked to opp 2",
    linkedOpportunities: [
      {
        id: "opp-ms-2",
        closeDate: "2023-07-31",
        stage: "Proposal",
        revenue: 75000,
        stageAdjustedRevenue: 37500,
      },
    ],
  },
  {
    id: "ms-opps-3",
    timestamp: "2023-03-10T09:00:00Z",
    sellers: [{ name: "Carol White", role: "Account Executive" }],
    customers: [{ name: "Eve Green", role: "CFO" }],
    description: "Linked to opp 3",
    linkedOpportunities: [
      {
        id: "opp-ms-3",
        closeDate: "2023-08-31",
        stage: "Closing",
        revenue: 120000,
        stageAdjustedRevenue: 96000,
      },
    ],
  },
];

export const multiScaleBothSections: Activity[] = [
  // Activities in Q1 2023 (will appear in top section)
  {
    id: "ms-both-activity-1",
    timestamp: "2023-01-15T10:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Charlie Brown", role: "CTO" }],
    description: "Q1 Discovery Call",
    linkedOpportunities: [
      {
        id: "opp-ms-both-1",
        closeDate: "2023-06-30",
        stage: "Discovery",
        revenue: 50000,
        stageAdjustedRevenue: 5000,
      },
    ],
  },
  {
    id: "ms-both-activity-2",
    timestamp: "2023-02-20T14:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Diana Prince", role: "VP Engineering" }],
    description: "Q2 Demo",
    linkedOpportunities: [
      {
        id: "opp-ms-both-1",
        closeDate: "2023-06-30",
        stage: "Proposal",
        revenue: 50000,
        stageAdjustedRevenue: 25000,
      },
    ],
  },
  {
    id: "ms-both-activity-3",
    timestamp: "2023-03-10T09:00:00Z",
    sellers: [{ name: "Bob Jones", role: "Sales Engineer" }],
    customers: [{ name: "Eve Green", role: "CFO" }],
    description: "Q3 Technical Review",
    linkedOpportunities: [
      {
        id: "opp-ms-both-2",
        closeDate: "2023-07-31",
        stage: "Qualified",
        revenue: 75000,
        stageAdjustedRevenue: 37500,
      },
    ],
  },
  {
    id: "ms-both-activity-4",
    timestamp: "2023-04-15T11:00:00Z",
    sellers: [{ name: "Carol White", role: "Account Executive" }],
    customers: [{ name: "Frank Black", role: "CTO" }],
    description: "Q4 Follow-up",
    linkedOpportunities: [
      {
        id: "opp-ms-both-3",
        closeDate: "2023-08-31",
        stage: "Closing",
        revenue: 120000,
        stageAdjustedRevenue: 96000,
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
  "Beam: Complex Displacement (5 Opps)": beamComplexDisplacement,
  "Beam: Single Activity": beamSingleActivity,
  "Beam: Multiple Participants": beamMultipleParticipants,
  "Multi-Scale: Activities Only": multiScaleActivitiesOnly,
  "Multi-Scale: Opportunities Only": multiScaleOpportunitiesOnly,
  "Multi-Scale: Both Sections": multiScaleBothSections,
};
