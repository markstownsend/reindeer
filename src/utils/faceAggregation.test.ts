import { describe, it, expect } from 'vitest';
import { aggregateFaceData } from './faceAggregation';
import type { Activity } from '../types/reindeer';

const makeActivity = (overrides: Partial<Activity> & { id: string; timestamp: string; linkedOpportunities: Activity['linkedOpportunities'] }): Activity => ({
  sellers: [{ name: 'Test Seller', role: 'AE' }],
  customers: [{ name: 'Test Customer', role: 'CTO' }],
  description: 'Test',
  ...overrides,
});

describe('aggregateFaceData', () => {
  it('empty array returns empty buckets and stacked', () => {
    const result = aggregateFaceData([]);
    expect(result.buckets).toEqual([]);
    expect(result.stacked).toEqual([]);
  });

  it('single activity with one opportunity returns 1 bucket with 1 stacked opportunity', () => {
    const activities = [makeActivity({
      id: 'a1',
      timestamp: '2023-10-01T09:00:00Z',
      linkedOpportunities: [{
        id: 'opp-1', closeDate: '2023-12-15', stage: 'Prospect',
        revenue: 50000, stageAdjustedRevenue: 5000,
      }],
    })];
    const result = aggregateFaceData(activities);
    expect(result.buckets).toHaveLength(1);
    expect(result.buckets[0].bucketId).toBe('2023-12');
    expect(result.stacked).toHaveLength(1);
    expect(result.stacked[0].opportunity.id).toBe('opp-1');
  });

  it('deduplicates same opportunity ID, latest timestamp wins', () => {
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
          id: 'opp-1', closeDate: '2023-12-15', stage: 'Qualified',
          revenue: 60000, stageAdjustedRevenue: 12000,
        }],
      }),
    ];
    const result = aggregateFaceData(activities);
    expect(result.buckets).toHaveLength(1);
    expect(result.stacked).toHaveLength(1);
    expect(result.stacked[0].opportunity.stage).toBe('Qualified');
  });

  it('activities with opportunities in different months create separate buckets', () => {
    const activities = [
      makeActivity({
        id: 'a1', timestamp: '2023-10-01T09:00:00Z',
        linkedOpportunities: [{
          id: 'opp-1', closeDate: '2023-10-15', stage: 'Prospect',
          revenue: 50000, stageAdjustedRevenue: 5000,
        }],
      }),
      makeActivity({
        id: 'a2', timestamp: '2023-11-01T09:00:00Z',
        linkedOpportunities: [{
          id: 'opp-2', closeDate: '2023-12-15', stage: 'Qualified',
          revenue: 30000, stageAdjustedRevenue: 6000,
        }],
      }),
    ];
    const result = aggregateFaceData(activities);
    expect(result.buckets).toHaveLength(2);
  });

  it('buckets are sorted chronologically', () => {
    const activities = [
      makeActivity({
        id: 'a1', timestamp: '2023-12-01T09:00:00Z',
        linkedOpportunities: [{
          id: 'opp-1', closeDate: '2024-03-15', stage: 'Prospect',
          revenue: 50000, stageAdjustedRevenue: 5000,
        }],
      }),
      makeActivity({
        id: 'a2', timestamp: '2023-10-01T09:00:00Z',
        linkedOpportunities: [{
          id: 'opp-2', closeDate: '2023-11-15', stage: 'Qualified',
          revenue: 30000, stageAdjustedRevenue: 6000,
        }],
      }),
    ];
    const result = aggregateFaceData(activities);
    expect(result.buckets[0].bucketId).toBe('2023-11');
    expect(result.buckets[1].bucketId).toBe('2024-03');
  });

  it('stacked opportunity widths are proportional to revenue', () => {
    const activities = [
      makeActivity({
        id: 'a1', timestamp: '2023-10-01T09:00:00Z',
        linkedOpportunities: [
          { id: 'opp-1', closeDate: '2023-12-15', stage: 'Prospect', revenue: 75000, stageAdjustedRevenue: 7500 },
          { id: 'opp-2', closeDate: '2023-12-20', stage: 'Qualified', revenue: 25000, stageAdjustedRevenue: 5000 },
        ],
      }),
    ];
    const result = aggregateFaceData(activities, { maxWidth: 400 });
    const widths = result.stacked.map(s => s.width);
    expect(widths[0]).toBeCloseTo(300); // 75000/100000 * 400
    expect(widths[1]).toBeCloseTo(100); // 25000/100000 * 400
  });
});
