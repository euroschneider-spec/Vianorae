import type { Locale } from '@/lib/i18n';
import { getEvidenceCopy, type MandateDocument } from '@/lib/mandate-evidence';
export function MandateDocuments({locale,documents}:{locale:Locale;documents:MandateDocument[]}) {
 const t=getEvidenceCopy(locale);
 return <section className="notice"><h3>{t.title}</h3>{documents.length ? <ul>{documents.map(doc=><li key={doc.id}><a href={`/api/verification/documents?id=${doc.id}`} download>{t.download}: {doc.filename}</a> <small>({Math.ceil(doc.byte_size/1024)} KB)</small></li>)}</ul> : <p>{t.missing}</p>}</section>;
}
