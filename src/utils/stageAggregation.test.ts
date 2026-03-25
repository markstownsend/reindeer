import { describe, it, expect } from 'vitest';
import { aggregateStageData } from './stageAggregation';
import type { Activity } from '../types/reindeer';

const makeActivity = (overrides: Partial<Activity> & { id: string; timestamp: string; linkedOpportunities: Activity['linkedOpportunities'] }): Activity => ({
  sellers: [{ name: 'Test Seller', role: 'AE' }],
  customers: [{ name: 'Test Customer', role: 'CTO' }],
  description: 'Test',
  ...overrides,
});

describe('aggregateStageData', () => {
  it('empty array returns empty buckets and zero totals', () => {
    const result = aggregateStageData([]);
    expect(result.buckets).toEqual([]);
    expect(result.allStagesRevenueTotal).toBe(0);
    expect(result.allStagesActivityCountTotal).toBe(0);
  });

  it('single activity returns 1 stage bucket with correct revenue and activityCount', () => {
    const activities = [makeActivity({
      id: 'a1', timestamp: '2023-10-01T09:00:00Z',
      linkedOpportunities: [{
        id: 'opp-1', closeDate: '2023-12-15', stage: 'Prospect',
        revenue: 50000, stageAdjustedRevenue: 5000,
      }],
    })];
    const result = aggregateStageData(activities);
    expect(result.buckets).toHaveLength(1);
    expect(result.buckets[0].stage).toBe('Prospect');
    expect(result.buckets[0].opportunityRevenueTotal).toBe(50000);
    expect(result.buckets[0].activityCountTotal).toBe(1);
  });

  it('two activities with same opp ID: revenue counted once, activityCount=2', () => {
    const activities = [
      makeActivity({
        id: 'a1', timestamp: '2023-09-01T09:00:00Z',
        linkedOpportunities: [{
          id: 'opp-1', closeDate: '2023-12-15', stage: 'Prospect',
          revenue: 50000, stageAdjustedRevenue: 5000,
        }],
      }),
      makeActivity({
        id: 'a2', timestamp: '2023-11-01T09:00:00Z',
        linkedOpportunities: [{
          id: 'opp-1', closeDate: '2023-12-15', stage: 'Prospect',
          revenue: 50000, stageAdjustedRevenue: 5000,
        }],
      }),
    ];
    const result = aggregateStageData(activities);
    expect(result.buckets).toHaveLength(1);
    expect(result.buckets[0].opportunityRevenueTotal).toBe(50000);
    expect(result.buckets[0].activityCountTotal).toBe(2);
  });

  it('stage buckets sorted by KNOWN_STAGE_ORDER', () => {
    const activities = [
      makeActivity({
        id: 'a1', timestamp: '2023-10-01T09:00:00Z',
        linkedOpportunities: [
          { id: 'opp-1', closeDate: '2023-12-15', stage: 'Committed', revenue: 30000, stageAdjustedRevenue: 24000 },
          { id: 'opp-2', closeDate: '2023-12-15', stage: 'Prospect', revenue: 50000, stageAdjustedRevenue: 5000 },
        ],
      }),
    ];
    const result = aggregateStageData(activities);
    expect(result.buckets[0].stage).toBe('Prospect');
    expect(result.buckets[1].stage).toBe('Committed');
  });

  it('unknown stages sort after known stages', () => {
    const activities = [
      makeActivity({
        id: 'a1', timestamp: '2023-10-01T09:00:00Z',
        linkedOpportunities: [
          { id: 'opp-1', closeDate: '2023-12-15', stage: 'CustomStage', revenue: 10000, stageAdjustedRevenue: 1000 },
          { id: 'opp-2', closeDate: '2023-12-15', stage: 'Prospect', revenue: 50000, stageAdjustedRevenue: 5000 },
        ],
      }),
    ];
    const result = aggregateStageData(activities);
    expect(result.buckets[0].stage).toBe('Prospect');
    expect(result.buckets[1].stage).toBe('CustomStage');
  });

  it('totalRevenue and totalActivities are correct sums', () => {
    const activities = [
      makeActivity({
        id: 'a1', timestamp: '2023-10-01T09:00:00Z',
        linkedOpportunities: [
          { id: 'opp-1', closeDate: '2023-12-15', stage: 'Prospect', revenue: 50000, stageAdjustedRevenue: 5000 },
        ],
      }),
      makeActivity({
        id: 'a2', timestamp: '2023-11-01T09:00:00Z',
        linkedOpportunities: [
          { id: 'opp-2', closeDate: '2023-12-15', stage: 'Qualified', revenue: 30000, stageAdjustedRevenue: 6000 },
        ],
      }),
    ];
    const result = aggregateStageData(activities);
    expect(result.allStagesRevenueTotal).toBe(80000);
    expect(result.allStagesActivityCountTotal).toBe(2);
  });
});
