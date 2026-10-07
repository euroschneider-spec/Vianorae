'use client';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { getCopy, type Locale } from '@/lib/i18n';
import { getAccessCopy } from '@/lib/accessibility-copy';

type Preferences={size:'normal'|'large'|'larger';theme:'light'|'dark'|'contrast';spacing:boolean};
const defaults:Preferences={size:'normal',theme:'light',spacing:false};
const key='vianorae:reading:v1';
const ReadingContext=createContext<{open:(button:HTMLButtonElement)=>void;isOpen:boolean}|null>(null);
function apply(p:Preferences) { const root=document.documentElement; root.dataset.theme=p.theme; root.dataset.textSize=p.size; root.dataset.spacing=String(p.spacing); }

function placePanel(panel:HTMLDialogElement,button:HTMLButtonElement) {
  const width=Math.min(360,window.innerWidth-32);
  panel.style.left=`${Math.max(16,Math.min(button.getBoundingClientRect().left-width-12,window.innerWidth-width-16))}px`;
}

export function ReadingSettingsProvider({locale,children}:{locale:Locale;children:React.ReactNode}) {
  const t=getCopy(locale);const a=getAccessCopy(locale);const path=usePathname();
  const [prefs,setPrefs]=useState(defaults);const [isOpen,setOpen]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);const trigger=useRef<HTMLButtonElement|null>(null);
  useEffect(()=>{
    let frame:number|undefined;
    try {
      const stored=JSON.parse(localStorage.getItem(key)||'null');
      if(stored && ['normal','large','larger'].includes(stored.size) && ['light','dark','contrast'].includes(stored.theme) && typeof stored.spacing==='boolean') {
        apply(stored);frame=requestAnimationFrame(()=>setPrefs(stored));
      }
    } catch { /* Defaults work when storage is unavailable. */ }
    return()=>{if(frame!==undefined) cancelAnimationFrame(frame);};
  },[]);
  useEffect(()=>{dialog.current?.close();},[path]);
  useEffect(()=>{
    if(!isOpen) return;
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';
    const resize=()=>{if(dialog.current && trigger.current?.isConnected) placePanel(dialog.current,trigger.current);};
    resize();window.addEventListener('resize',resize);
    return()=>{document.body.style.overflow=previous;window.removeEventListener('resize',resize);};
  },[isOpen]);
  function update(next:Preferences) {setPrefs(next);apply(next);try{localStorage.setItem(key,JSON.stringify(next));}catch{/* Settings still work for this visit. */}}
  function open(button:HTMLButtonElement) {
    if(!dialog.current || dialog.current.open) return;
    trigger.current=button;
    // Place the panel to the left of the image control, within the viewport.
    placePanel(dialog.current,button);
    dialog.current.showModal();setOpen(true);
  }
  function closed() {setOpen(false);if(trigger.current?.isConnected) trigger.current.focus({preventScroll:true});}
  return <ReadingContext.Provider value={{open,isOpen}}>{children}
    <dialog ref={dialog} id="reading-panel" className="reading-dialog" aria-labelledby="reading-title" aria-describedby="reading-intro" aria-modal="true" onClose={closed}
      onKeyDown={event=>{
        if(event.key!=='Tab') return;
        const controls=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),select:not(:disabled),input:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]')).filter(node=>node.getClientRects().length);
        const first=controls[0];const last=controls[controls.length-1];
        if(event.shiftKey && document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus();}
      }}
      onClick={event=>{const bounds=event.currentTarget.getBoundingClientRect();if(event.target===event.currentTarget && (event.clientX<bounds.left || event.clientX>bounds.right || event.clientY<bounds.top || event.clientY>bounds.bottom)) event.currentTarget.close();}}>
      <div className="reading-dialog-heading"><h2 id="reading-title">{t.settings}</h2><button type="button" className="icon-button" aria-label={a.close} onClick={()=>dialog.current?.close()}><X aria-hidden="true" size={20}/></button></div>
      <p id="reading-intro">{a.readingIntro}</p>
      <div className="form-field"><label htmlFor="reading-size">{t.fontSize}</label><select id="reading-size" autoFocus value={prefs.size} onChange={e=>update({...prefs,size:e.target.value as Preferences['size']})}><option value="normal">{t.normal}</option><option value="large">{t.large}</option><option value="larger">{t.larger}</option></select></div>
      <div className="form-field"><label htmlFor="reading-theme">{t.theme}</label><select id="reading-theme" value={prefs.theme} onChange={e=>update({...prefs,theme:e.target.value as Preferences['theme']})}><option value="light">{t.lightMode}</option><option value="dark">{t.darkMode}</option><option value="contrast">{t.contrast}</option></select></div>
      <label className="checkbox-label"><input type="checkbox" checked={prefs.spacing} onChange={e=>update({...prefs,spacing:e.target.checked})}/>{t.spacing}</label>
      <p className="notice reading-sound-note">{a.withoutSound}</p>
      <button type="button" className="text-button" onClick={()=>update(defaults)}>{t.reset}</button>
    </dialog>
  </ReadingContext.Provider>;
}

export function ReadingSettingsButton({locale,className='',showLabel=false}:{locale:Locale;className?:string;showLabel?:boolean}) {
  const context=useContext(ReadingContext);const t=getCopy(locale);
  if(!context) throw new Error('ReadingSettingsButton needs ReadingSettingsProvider');
  return <button type="button" className={`reading-trigger ${className}`} aria-label={t.settings} title={t.settings} aria-haspopup="dialog" aria-controls="reading-panel" aria-expanded={context.isOpen} onClick={event=>context.open(event.currentTarget)}><SlidersHorizontal size={20} aria-hidden="true"/>{showLabel && <span aria-hidden="true">{t.settings}</span>}</button>;
}
