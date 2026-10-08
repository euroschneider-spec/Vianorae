'use client';
import { useSyncExternalStore } from 'react';

export type Theme='light'|'dark'|'contrast';
export type Size='normal'|'large'|'larger';
export type Width='default'|'narrow';
export type Font='default'|'hyperlegible';
export type Density='full'|'summary';
export type Preferences={size:Size;theme:Theme;spacing:boolean;width:Width;font:Font;density:Density};

// Dark is the design default; the stored choice is reapplied before paint in the locale layout.
export const defaults:Preferences={size:'normal',theme:'dark',spacing:false,width:'default',font:'default',density:'full'};
export const storageKey='vianorae:reading:v1';

const sizes:Size[]=['normal','large','larger'];
const themes:Theme[]=['light','dark','contrast'];
const widths:Width[]=['default','narrow'];
const fonts:Font[]=['default','hyperlegible'];
const densities:Density[]=['full','summary'];

// Each field is validated on its own so preferences stored before a field existed still load.
// Rejecting the whole object would silently reset a reader's theme when we add a setting.
function one<T extends string>(value:unknown,allowed:T[],fallback:T):T {
  return allowed.includes(value as T) ? value as T : fallback;
}

export function fromStored(raw:unknown):Preferences {
  const v=(raw||{}) as Partial<Record<keyof Preferences,unknown>>;
  return {
    size:one(v.size,sizes,defaults.size),
    theme:one(v.theme,themes,defaults.theme),
    spacing:typeof v.spacing==='boolean'?v.spacing:defaults.spacing,
    width:one(v.width,widths,defaults.width),
    font:one(v.font,fonts,defaults.font),
    density:one(v.density,densities,defaults.density),
  };
}

export function readPreferences():Preferences {
  try { return fromStored(JSON.parse(localStorage.getItem(storageKey)||'null')); }
  catch { return defaults; }
}

export function applyPreferences(p:Preferences) {
  const root=document.documentElement;
  root.dataset.theme=p.theme;root.dataset.textSize=p.size;root.dataset.spacing=String(p.spacing);
  root.dataset.width=p.width;root.dataset.font=p.font;root.dataset.density=p.density;
}

export function savePreferences(p:Preferences) {
  applyPreferences(p);
  try { localStorage.setItem(storageKey,JSON.stringify(p)); } catch { /* Settings still work for this visit. */ }
}

/** Change one setting, leaving every other choice the reader made untouched. */
export function setPreference<K extends keyof Preferences>(key:K,value:Preferences[K]) {
  savePreferences({...readPreferences(),[key]:value});
}

// The data attributes on <html> are the single source of truth, so controls in the header, the
// reading panel and the page body never disagree about the current setting.
function watch(attribute:string) {
  return (notify:()=>void)=>{
    const observer=new MutationObserver(notify);
    observer.observe(document.documentElement,{attributes:true,attributeFilter:[attribute]});
    return ()=>observer.disconnect();
  };
}

const themeStore=watch('data-theme');
const densityStore=watch('data-density');

export function useTheme():Theme {
  return useSyncExternalStore<Theme>(themeStore,
    ()=>one(document.documentElement.dataset.theme,themes,defaults.theme),
    ()=>defaults.theme);
}

export function useDensity():Density {
  return useSyncExternalStore<Density>(densityStore,
    ()=>one(document.documentElement.dataset.density,densities,defaults.density),
    ()=>defaults.density);
}
