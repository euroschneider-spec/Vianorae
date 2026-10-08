import { describe, it, expect } from 'vitest';
import { clamp, launcherTop } from '@/components/reading-settings';

describe('clamp', () => {
  it('passes through values inside the range', () => { expect(clamp(5, 0, 10)).toBe(5); });
  it('floors values below the minimum', () => { expect(clamp(-5, 0, 10)).toBe(0); });
  it('ceils values above the maximum', () => { expect(clamp(15, 0, 10)).toBe(10); });
});

describe('launcherTop', () => {
  it('docks near the bottom of a tall viewport', () => {
    expect(launcherTop(900, 56)).toBe(900 - 56 - 24);
  });
  it('never overlaps the top edge on a short viewport', () => {
    expect(launcherTop(40, 56)).toBe(8);
  });
});
