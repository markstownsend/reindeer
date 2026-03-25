import { describe, it, expect } from 'vitest';
import { calculateBeamPositions } from './beamAggregation';
import type { Activity } from '../types/reindeer';

const makeActivity = (overrides: Partial<Activity> & { id: string; timestamp: string; linkedOpportunities: Activity['linkedOpportunities'] }): Activity => ({
  sellers: [{ name: 'Test Seller', role: 'AE' }],
  customers: [{ name: 'Test Customer', role: 'CTO' }],
  description: 'Test',
  ...overrides,
});

describe('calculateBeamPositions', () => {
  it('empty array returns empty beams', () => {
    expect(calculateBeamPositions([])).toEqual([]);
  });

  it('single activity with linked opportunity returns 1 bound beam with ordinal 1', () => {
    const activities = [makeActivity({
      id: 'a1', timestamp: '2023-10-01T09:00:00Z',
      linkedOpportunities: [{
        id: 'opp-1', closeDate: '2023-12-15', stage: 'Prospect',
        revenue: 50000, stageAdjustedRevenue: 5000,
      }],
    })];
    const beams = calculateBeamPositions(activities);
    expect(beams).toHaveLength(1);
    expect(beams[0].ordinalPosition).toBe(1);
    expect(beams[0].type).toBe('bound');
  });

  it('single free activity returns 1 free beam with ordinal 0', () => {
    const activities = [makeActivity({
      id: 'a1', timestamp: '2023-10-01T09:00:00Z',
      linkedOpportunities: [],
    })];
    const beams = calculateBeamPositions(activities);
    expect(beams).toHaveLength(1);
    expect(beams[0].ordinalPosition).toBe(0);
    expect(beams[0].type).toBe('free');
  });

  it('multiple opportunities get alternating ordinals sorted by revenue desc', () => {
    const activities = [
      makeActivity({
        id: 'a1', timestamp: '2023-10-01T09:00:00Z',
        linkedOpportunities: [{ id: 'opp-small', closeDate: '2023-12-15', stage: 'Prospect', revenue: 10000, stageAdjustedRevenue: 1000 }],
      }),
      makeActivity({
        id: 'a2', timestamp: '2023-10-02T09:00:00Z',
        linkedOpportunities: [{ id: 'opp-big', closeDate: '2023-12-15', stage: 'Qualified', revenue: 90000, stageAdjustedRevenue: 18000 }],
      }),
      makeActivity({
        id: 'a3', timestamp: '2023-10-03T09:00:00Z',
        linkedOpportunities: [{ id: 'opp-mid', closeDate: '2023-12-15', stage: 'Committed', revenue: 50000, stageAdjustedRevenue: 40000 }],
      }),
    ];
    const beams = calculateBeamPositions(activities);
    // Sorted by revenue desc: opp-big(90k), opp-mid(50k), opp-small(10k)
    // Ordinals: 1, -1, 2
    const boundBeams = beams.filter(b => b.type === 'bound');
    expect(boundBeams).toHaveLength(3);
    const ordinals = boundBeams.map(b => b.ordinalPosition);
    expect(ordinals).toEqual([1, -1, 2]);
  });

  it('beam contains correct activities and linkedOpportunityId', () => {
    const activities = [makeActivity({
      id: 'a1', timestamp: '2023-10-01T09:00:00Z',
      linkedOpportunities: [{
        id: 'opp-1', closeDate: '2023-12-15', stage: 'Prospect',
        revenue: 50000, stageAdjustedRevenue: 5000,
      }],
    })];
    const beams = calculateBeamPositions(activities);
    expect(beams[0].activities).toHaveLength(1);
    expect(beams[0].activities[0].id).toBe('a1');
    expect(beams[0].linkedOpportunityId).toBe('opp-1');
  });

  it('beam has correct verticalExtent', () => {
    const activities = [
      makeActivity({
        id: 'a1', timestamp: '2023-10-01T09:00:00Z',
        linkedOpportunities: [{ id: 'opp-1', closeDate: '2023-12-15', stage: 'Prospect', revenue: 50000, stageAdjustedRevenue: 5000 }],
      }),
      makeActivity({
        id: 'a2', timestamp: '2023-11-15T09:00:00Z',
        linkedOpportunities: [{ id: 'opp-1', closeDate: '2023-12-15', stage: 'Qualified', revenue: 50000, stageAdjustedRevenue: 10000 }],
      }),
    ];
    const beams = calculateBeamPositions(activities);
    const beam = beams[0];
    expect(beam.verticalExtent.min.toISOString()).toBe('2023-10-01T09:00:00.000Z');
    expect(beam.verticalExtent.max.toISOString()).toBe('2023-11-15T09:00:00.000Z');
  });
});
