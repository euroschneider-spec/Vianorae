import { NextResponse } from 'next/server';
import { isLocale } from '@/lib/i18n';
export async function GET(request:Request,{params}:{params:Promise<{code:string}>}){const {code}=await params;if(code!=='willow-museum')return new Response('Unknown guide code',{status:404});const url=new URL(request.url);const requested=url.searchParams.get('locale')||'en';const locale=isLocale(requested)?requested:'en';return NextResponse.redirect(new URL(`/${locale}/places/willow-museum/guide`,url.origin),{status:307,headers:{'Cache-Control':'public, max-age=0, must-revalidate'}});}
