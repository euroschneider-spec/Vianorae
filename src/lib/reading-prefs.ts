'use client';
import { useSyncExternalStore } from 'react';

export type Theme='light'|'dark'|'contrast';
export type Preferences={size:'normal'|'large'|'larger';theme:Theme;spacing:boolean};

// Dark is the design default; the stored choice is reapplied before paint in the locale layout.
export const defaults:Preferences={size:'normal',theme:'dark',spacing:false};
export const storageKey='vianorae:reading:v1';

const sizes:Preferences['size'][]=['normal','large','larger'];
const themes:Theme[]=['light','dark','contrast'];

export function isPreferences(value:unknown):value is Preferences {
  const p=value as Partial<Preferences>|null;
  return !!p && sizes.includes(p.size as Preferences['size']) && themes.includes(p.theme as Theme) && typeof p.spacing==='boolean';
}

export function readPreferences():Preferences {
  try {
    const stored=JSON.parse(localStorage.getItem(storageKey)||'null');
    if(isPreferences(stored)) return stored;
  } catch { /* Defaults work when storage is unavailable. */ }
  return defaults;
}

export function applyPreferences(p:Preferences) {
  const root=document.documentElement;
  root.dataset.theme=p.theme;root.dataset.textSize=p.size;root.dataset.spacing=String(p.spacing);
}

export function savePreferences(p:Preferences) {
  applyPreferences(p);
  try { localStorage.setItem(storageKey,JSON.stringify(p)); } catch { /* Settings still work for this visit. */ }
}

/** Change only the theme, leaving the text size and spacing the visitor chose untouched. */
export function setTheme(theme:Theme) { savePreferences({...readPreferences(),theme}); }

// <html data-theme> is the single source of truth, so the header toggle and the reading panel
// never disagree about the current theme no matter which one the visitor used.
function subscribe(notify:()=>void) {
  const observer=new MutationObserver(notify);
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  return ()=>observer.disconnect();
}

export function useTheme():Theme {
  return useSyncExternalStore<Theme>(subscribe,
    ()=>{const value=document.documentElement.dataset.theme;return themes.includes(value as Theme)?value as Theme:defaults.theme;},
    ()=>defaults.theme);
}
