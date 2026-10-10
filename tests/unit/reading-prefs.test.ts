import { describe, expect, it } from 'vitest';
import { defaults, fromStored } from '@/lib/reading-prefs';

describe('tone preference',()=>{
  it('defaults to cool, so nobody sees a change until they choose one',()=>{
    expect(defaults.tone).toBe('cool');
    expect(fromStored(null).tone).toBe('cool');
  });
  it('keeps a stored warm choice',()=>{
    expect(fromStored({tone:'warm'}).tone).toBe('warm');
  });
  it('falls back to cool for an unknown value without resetting other choices',()=>{
    const p=fromStored({tone:'neon',theme:'light',size:'large'});
    expect(p.tone).toBe('cool');
    expect(p.theme).toBe('light');
    expect(p.size).toBe('large');
  });
  it('loads preferences saved before tone existed',()=>{
    const p=fromStored({theme:'light',size:'large',spacing:true,width:'narrow',font:'hyperlegible',density:'summary'});
    expect(p).toEqual({theme:'light',size:'large',spacing:true,width:'narrow',font:'hyperlegible',density:'summary',tone:'cool'});
  });
});
