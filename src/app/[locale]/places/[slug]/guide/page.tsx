import { notFound } from 'next/navigation';
import ExampleGuide from '../../../example-guide/page';
export function generateStaticParams(){return [{slug:'willow-museum'}];}
export default async function PlaceGuide({params}:{params:Promise<{locale:string;slug:string}>}){const {locale,slug}=await params;if(slug!=='willow-museum')notFound();return <ExampleGuide params={Promise.resolve({locale})}/>;}
