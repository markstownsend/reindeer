import { describe, it, expect } from 'vitest';
import { calculateLayout, updateLayoutWithBuckets } from './scales';
import type { FaceBucket } from '../types/reindeer';

describe('calculateLayout', () => {
  it('returns correct dimensions with defaults', () => {
    const layout = calculateLayout(800, 600, 0.6, 0.5);
    expect(layout.width).toBe(800);
    expect(layout.height).toBe(600);
    expect(layout.faceWidth).toBeCloseTo(680 * 0.6); // (800-80-40) * 0.6
  });

  it('clamps faceWidthRatio: 0.0 → 0.1', () => {
    const layout = calculateLayout(800, 600, 0.0, 0.5);
    expect(layout.faceWidth).toBeCloseTo(680 * 0.1);
  });

  it('clamps faceWidthRatio: 1.5 → 1.0', () => {
    const layout = calculateLayout(800, 600, 1.5, 0.5);
    expect(layout.faceWidth).toBeCloseTo(680 * 1.0);
  });

  it('clamps activitiesHeightRatio: 0.0 → 0.1', () => {
    const layout = calculateLayout(800, 600, 0.6, 0.0);
    const totalAvailable = 600 - 60 - 40; // 500
    expect(layout.activitiesHeight).toBeCloseTo(totalAvailable * 0.1);
  });

  it('clamps activitiesHeightRatio: 1.0 → 0.9', () => {
    const layout = calculateLayout(800, 600, 0.6, 1.0);
    const totalAvailable = 600 - 60 - 40;
    expect(layout.activitiesHeight).toBeCloseTo(totalAvailable * 0.9);
  });

  it('faceLeft centers the face', () => {
    const layout = calculateLayout(800, 600, 0.6, 0.5);
    const totalAvailableWidth = 800 - 80 - 40; // 680
    const faceWidth = totalAvailableWidth * 0.6;
    const expectedFaceLeft = 80 + (totalAvailableWidth - faceWidth) / 2;
    expect(layout.faceLeft).toBeCloseTo(expectedFaceLeft);
  });

  it('activitiesHeight + opportunitiesHeight = total available height', () => {
    const layout = calculateLayout(800, 600, 0.6, 0.5);
    const totalAvailable = 600 - 60 - 40;
    expect(layout.activitiesHeight + layout.opportunitiesHeight).toBeCloseTo(totalAvailable);
  });
});

describe('updateLayoutWithBuckets', () => {
  const baseLayout = calculateLayout(800, 600, 0.6, 0.5);

  it('with 0 buckets, rowHeight stays at default 40', () => {
    const updated = updateLayoutWithBuckets(baseLayout, []);
    expect(updated.rowHeight).toBe(40);
  });

  it('with N buckets, rowHeight = min(40, plotHeight / N)', () => {
    const buckets: FaceBucket[] = Array.from({ length: 20 }, (_, i) => ({
      bucketId: `2023-${String(i + 1).padStart(2, '0')}`,
      opportunities: [],
      yPosition: 0,
      height: 60,
      totalRevenue: 0,
      maxWidth: 400,
    }));
    const updated = updateLayoutWithBuckets(baseLayout, buckets);
    const expected = Math.min(40, baseLayout.opportunitiesPlotHeight / 20);
    expect(updated.rowHeight).toBeCloseTo(expected);
  });
});
