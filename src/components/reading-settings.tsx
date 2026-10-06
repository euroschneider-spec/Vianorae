'use client';
import { useState, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { getCopy, type Locale } from '@/lib/i18n';
type Preferences={size:'normal'|'large'|'larger';theme:'light'|'dark'|'contrast';spacing:boolean};
const defaults:Preferences={size:'normal',theme:'light',spacing:false};
const key='vianorae:reading:v1';
function apply(p:Preferences) { const root=document.documentElement; root.dataset.theme=p.theme; root.dataset.textSize=p.size; root.dataset.spacing=String(p.spacing); }
export function ReadingSettings({locale}:{locale:Locale}) {
  const t=getCopy(locale); const [prefs,setPrefs]=useState(defaults);
  useEffect(()=>{ try { const stored=JSON.parse(localStorage.getItem(key)||'null'); if(stored && ['normal','large','larger'].includes(stored.size) && ['light','dark','contrast'].includes(stored.theme) && typeof stored.spacing==='boolean') { apply(stored); requestAnimationFrame(()=>setPrefs(stored)); } } catch { /* Defaults work when storage is unavailable. */ } },[]);
  function update(next:Preferences) { setPrefs(next);apply(next);try{localStorage.setItem(key,JSON.stringify(next));}catch{/* Settings still work for this visit. */} }
  return <details className="reading-settings"><summary><SlidersHorizontal size={16} aria-hidden="true"/>{t.settings}</summary><div className="reading-panel">
    <label>{t.fontSize}<select aria-label={t.fontSize} value={prefs.size} onChange={e=>update({...prefs,size:e.target.value as Preferences['size']})}><option value="normal">{t.normal}</option><option value="large">{t.large}</option><option value="larger">{t.larger}</option></select></label>
    <label>{t.theme}<select aria-label={t.theme} value={prefs.theme} onChange={e=>update({...prefs,theme:e.target.value as Preferences['theme']})}><option value="light">{t.lightMode}</option><option value="dark">{t.darkMode}</option><option value="contrast">{t.contrast}</option></select></label>
    <label className="checkbox-label"><input type="checkbox" checked={prefs.spacing} onChange={e=>update({...prefs,spacing:e.target.checked})}/>{t.spacing}</label><button className="text-button" onClick={()=>update(defaults)}>{t.reset}</button>
  </div></details>;
}
