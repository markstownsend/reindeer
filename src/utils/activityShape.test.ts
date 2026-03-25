import { describe, it, expect } from 'vitest';
import { activityShapePath } from './activityShape';

describe('activityShapePath', () => {
  it('returns a path string for each type', () => {
    for (const type of ['call', 'email', 'demo', 'workshop', 'meeting', undefined]) {
      const path = activityShapePath(type, 10);
      expect(typeof path).toBe('string');
      expect(path.length).toBeGreaterThan(0);
    }
  });

  it('all paths start with M and end with Z', () => {
    for (const type of ['call', 'email', 'demo', 'workshop', 'meeting', undefined]) {
      const path = activityShapePath(type, 10);
      expect(path[0]).toBe('M');
      expect(path[path.length - 1]).toBe('Z');
    }
  });

  it('default/meeting returns a circle arc path containing A', () => {
    const path = activityShapePath(undefined, 10);
    expect(path).toContain('A');
    expect(activityShapePath('meeting', 10)).toContain('A');
  });

  it('call (diamond) path contains 4 L commands', () => {
    const path = activityShapePath('call', 10);
    expect((path.match(/L/g) || []).length).toBe(3); // M + 3L + Z = 4 points
  });

  it('email (square) path contains 4 L commands', () => {
    const path = activityShapePath('email', 10);
    expect((path.match(/L/g) || []).length).toBe(3); // M + 3L + Z = 4 points
  });

  it('demo (triangle) path contains 2 L commands', () => {
    const path = activityShapePath('demo', 10);
    expect((path.match(/L/g) || []).length).toBe(2);
  });

  it('workshop (star) path contains 10 L commands', () => {
    const path = activityShapePath('workshop', 10);
    // Star: M + 9L + Z (10 points total, first via M, rest via L)
    expect((path.match(/L/g) || []).length).toBe(9);
  });

  it('radius parameter affects path coordinates', () => {
    const path10 = activityShapePath('call', 10);
    const path20 = activityShapePath('call', 20);
    expect(path10).not.toBe(path20);
    // Diamond: M0,-r L r,0 L0,r L-r,0 Z
    expect(path10).toContain('0,-10');
    expect(path20).toContain('0,-20');
  });
});
