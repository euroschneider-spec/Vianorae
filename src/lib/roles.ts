import type { Locale } from './i18n';
export type OrganisationRole='owner'|'admin'|'editor'|'assessor'|'reviewer';
export const roleDescriptions:Record<Locale,Record<OrganisationRole,string>>={
 en:{owner:'Manage members and all organisation locations.',admin:'Manage locations, review content and publish guides.',editor:'Prepare place and guide content; cannot publish or manage roles.',assessor:'Record observations and measurements for assigned places.',reviewer:'Review assigned assessments independently; cannot publish guides.'},
 ro:{owner:'Gestionează membrii și toate locațiile organizației.',admin:'Gestionează locațiile, verifică și publică ghiduri.',editor:'Pregătește conținut; fără publicare sau administrarea rolurilor.',assessor:'Înregistrează observații și măsurători în locații asignate.',reviewer:'Verifică independent evaluările asignate; fără publicarea ghidurilor.'},
 de:{owner:'Mitglieder und alle Standorte verwalten.',admin:'Standorte und Inhalte verwalten, Guides veröffentlichen.',editor:'Inhalte vorbereiten; keine Veröffentlichung oder Rollenverwaltung.',assessor:'Beobachtungen und Messwerte für zugewiesene Orte erfassen.',reviewer:'Zugewiesene Bewertungen unabhängig prüfen; keine Guide-Veröffentlichung.'}
};
