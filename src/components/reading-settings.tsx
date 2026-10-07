'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { SlidersHorizontal, X, GripHorizontal, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { getCopy, type Locale } from '@/lib/i18n';
import { getAccessCopy } from '@/lib/accessibility-copy';
import { ReadAloud } from './read-aloud';

type Preferences={size:'normal'|'large'|'larger';theme:'light'|'dark'|'contrast';spacing:boolean};
const defaults:Preferences={size:'normal',theme:'light',spacing:false};
const key='vianorae:reading:v1';
function apply(p:Preferences) { const root=document.documentElement; root.dataset.theme=p.theme; root.dataset.textSize=p.size; root.dataset.spacing=String(p.spacing); }

const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(value,Math.max(min,max)));
function placeLauncher(button:HTMLButtonElement) {
  const anchor=document.querySelector<HTMLElement>('[data-reading-anchor]')?.getBoundingClientRect();
  const bounds=button.getBoundingClientRect();const mobile=window.innerWidth<=760;
  button.style.left=`${mobile?16:clamp(anchor?anchor.left-bounds.width-16:16,16,window.innerWidth-bounds.width-16)}px`;
  button.style.top=`${mobile?window.innerHeight-bounds.height-16:clamp(anchor?.top??120,88,window.innerHeight-bounds.height-16)}px`;
}
function movePanel(panel:HTMLDialogElement,left:number,top:number) {
  const bounds=panel.getBoundingClientRect();
  panel.style.left=`${clamp(left,16,window.innerWidth-bounds.width-16)}px`;
  panel.style.top=`${clamp(top,16,window.innerHeight-bounds.height-16)}px`;
}
function placePanel(panel:HTMLDialogElement,button:HTMLButtonElement) {
  const bounds=button.getBoundingClientRect();
  // The popup's right edge sits just left of the image; its coordinates stay fixed on scroll.
  movePanel(panel,bounds.right-panel.getBoundingClientRect().width,bounds.top);
}

export function ReadingSettingsProvider({locale,children}:{locale:Locale;children:React.ReactNode}) {
  const t=getCopy(locale);const a=getAccessCopy(locale);const path=usePathname();
  const [prefs,setPrefs]=useState(defaults);const [isOpen,setOpen]=useState(false);const [moveControls,setMoveControls]=useState(false);const [audioOpen,setAudioOpen]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);const trigger=useRef<HTMLButtonElement>(null);
  const moved=useRef(false);const restoreFocus=useRef(true);const dragged=useRef(false);
  const drag=useRef<{x:number;y:number;left:number;top:number}|null>(null);
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
  useEffect(()=>{
    restoreFocus.current=false;dialog.current?.close();
    const position=()=>{if(trigger.current)placeLauncher(trigger.current);};
    const frame=requestAnimationFrame(position);window.addEventListener('resize',position);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',position);};
  },[path]);
  useEffect(()=>{
    if(!isOpen) return;
    const resize=()=>{
      if(!dialog.current || !trigger.current) return;
      if(moved.current){const bounds=dialog.current.getBoundingClientRect();movePanel(dialog.current,bounds.left,bounds.top);}
      else placePanel(dialog.current,trigger.current);
    };
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape' && !event.defaultPrevented){event.preventDefault();restoreFocus.current=true;dialog.current?.close();}};
    const outside=(event:PointerEvent)=>{
      if(event.target instanceof Node && !dialog.current?.contains(event.target) && !trigger.current?.contains(event.target)) {
        restoreFocus.current=false;dialog.current?.close();
      }
    };
    resize();window.addEventListener('resize',resize);window.addEventListener('keydown',escape);document.addEventListener('pointerdown',outside);
    const observer=new ResizeObserver(resize);if(dialog.current)observer.observe(dialog.current);
    return()=>{observer.disconnect();window.removeEventListener('resize',resize);window.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside);};
  },[isOpen]);
  function update(next:Preferences) {setPrefs(next);apply(next);try{localStorage.setItem(key,JSON.stringify(next));}catch{/* Settings still work for this visit. */}}
  function close() {restoreFocus.current=true;dialog.current?.close();}
  function open() {
    if(!dialog.current || !trigger.current) return;
    if(dialog.current.open){close();return;}
    moved.current=false;restoreFocus.current=true;
    // A nonmodal dialog leaves page scrolling and background controls available.
    dialog.current.show();placePanel(dialog.current,trigger.current);setOpen(true);
  }
  function closed() {setOpen(false);setMoveControls(false);setAudioOpen(false);drag.current=null;if(restoreFocus.current)trigger.current?.focus({preventScroll:true});}
  function nudge(x:number,y:number) {
    if(!dialog.current) return;const bounds=dialog.current.getBoundingClientRect();moved.current=true;movePanel(dialog.current,bounds.left+x,bounds.top+y);
  }
  function resetPosition() {moved.current=false;if(dialog.current && trigger.current)placePanel(dialog.current,trigger.current);}
  return <>{children}
    <button ref={trigger} type="button" className="reading-trigger floating-reading" aria-label={t.settings} title={t.settings} aria-haspopup="dialog" aria-controls="reading-panel" aria-expanded={isOpen} onClick={open}><SlidersHorizontal size={20} aria-hidden="true"/><span aria-hidden="true">{a.tools}</span></button>
    <dialog ref={dialog} id="reading-panel" className="reading-dialog" aria-labelledby="reading-title" aria-describedby="reading-intro reading-popup-hint" onClose={closed} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();close();}}}>
      <div className="reading-dialog-heading"><h2 id="reading-title">{t.settings}</h2>
        <button type="button" className="icon-button panel-drag-handle" aria-label={a.movePanel} title={a.movePanel} aria-expanded={moveControls} aria-controls="reading-move-controls" onClick={()=>{if(dragged.current){dragged.current=false;return;}setMoveControls(value=>!value);}}
          onPointerDown={event=>{if(event.button!==0 || !dialog.current)return;dragged.current=false;const bounds=dialog.current.getBoundingClientRect();drag.current={x:event.clientX,y:event.clientY,left:bounds.left,top:bounds.top};event.currentTarget.setPointerCapture(event.pointerId);}}
          onPointerMove={event=>{if(!drag.current || !dialog.current)return;const dx=event.clientX-drag.current.x;const dy=event.clientY-drag.current.y;if(Math.abs(dx)+Math.abs(dy)>4){dragged.current=true;moved.current=true;movePanel(dialog.current,drag.current.left+dx,drag.current.top+dy);}}}
          onLostPointerCapture={()=>{drag.current=null;}}
          onKeyDown={event=>{const offsets:Record<string,[number,number]>={ArrowLeft:[-24,0],ArrowRight:[24,0],ArrowUp:[0,-24],ArrowDown:[0,24]};if(offsets[event.key]){event.preventDefault();nudge(...offsets[event.key]);}else if(event.key==='Home'){event.preventDefault();resetPosition();}}}><GripHorizontal size={20} aria-hidden="true"/></button>
        <button type="button" className="icon-button" aria-label={a.close} onClick={close}><X aria-hidden="true" size={20}/></button>
      </div>
      <div id="reading-move-controls" className="panel-move-controls" hidden={!moveControls} role="group" aria-label={a.movePanel}>
        <button type="button" className="icon-button" aria-label={a.moveLeft} onClick={()=>nudge(-24,0)}><ArrowLeft size={18} aria-hidden="true"/></button>
        <button type="button" className="icon-button" aria-label={a.moveRight} onClick={()=>nudge(24,0)}><ArrowRight size={18} aria-hidden="true"/></button>
        <button type="button" className="icon-button" aria-label={a.moveUp} onClick={()=>nudge(0,-24)}><ArrowUp size={18} aria-hidden="true"/></button>
        <button type="button" className="icon-button" aria-label={a.moveDown} onClick={()=>nudge(0,24)}><ArrowDown size={18} aria-hidden="true"/></button>
        <button type="button" className="icon-button" aria-label={a.resetPosition} onClick={resetPosition}><RotateCcw size={18} aria-hidden="true"/></button>
      </div>
      <p id="reading-popup-hint" className="small-note">{a.popupHint}</p>
      <p id="reading-intro">{a.readingIntro}</p>
      <div className="form-field"><label htmlFor="reading-size">{t.fontSize}</label><select id="reading-size" autoFocus value={prefs.size} onChange={e=>update({...prefs,size:e.target.value as Preferences['size']})}><option value="normal">{t.normal}</option><option value="large">{t.large}</option><option value="larger">{t.larger}</option></select></div>
      <div className="form-field"><label htmlFor="reading-theme">{t.theme}</label><select id="reading-theme" value={prefs.theme} onChange={e=>update({...prefs,theme:e.target.value as Preferences['theme']})}><option value="light">{t.lightMode}</option><option value="dark">{t.darkMode}</option><option value="contrast">{t.contrast}</option></select></div>
      <label className="checkbox-label"><input type="checkbox" checked={prefs.spacing} onChange={e=>update({...prefs,spacing:e.target.checked})}/>{t.spacing}</label>
      <p className="notice reading-sound-note">{a.withoutSound}</p>
      <button type="button" className="text-button" onClick={()=>update(defaults)}>{t.reset}</button>
      <details className="reading-audio-details" open={audioOpen} onToggle={event=>setAudioOpen(event.currentTarget.open)}><summary>{a.listenPage}</summary><ReadAloud locale={locale} label={a.listenPage} enabled={isOpen && audioOpen}/></details>
    </dialog>
  </>;
}
