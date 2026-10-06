// Foundation contract, maintained manually until the dedicated Supabase project exists.
// Regenerate from that project's schema before using supabase-js in live features.
export type UUID=string;
export type Json=string|number|boolean|null|{[key:string]:Json|undefined}|Json[];
export type RecordStatus='draft'|'published'|'archived';
export type SourceLevel='venue_provided'|'assessor_verified'|'independent_audit';
export type OrganizationRole='owner'|'admin'|'editor'|'assessor'|'reviewer';
export type SensoryLevel='unknown'|'low'|'moderate'|'high'|'variable';
export interface OrganizationRow{id:UUID;name:string;country_code:string|null;status:RecordStatus;created_at:string}
export interface OrganizationMemberRow{organization_id:UUID;user_id:UUID;role:OrganizationRole;created_at:string}
export interface PlaceRow{id:UUID;organization_id:UUID;slug:string;country_code:string|null;city:string;address:string;place_type:string;status:RecordStatus;template_id:UUID|null;created_at:string}
export interface ZoneRow{id:UUID;place_id:UUID;organization_id:UUID;parent_zone_id:UUID|null;type:string;sort_order:number;status:RecordStatus}
export interface GuideRow{id:UUID;place_id:UUID;organization_id:UUID;locale:string;status:RecordStatus;current_version:number|null;published_at:string|null;created_at:string}
export interface GuideVersionRow{id:UUID;guide_id:UUID;place_id:UUID;organization_id:UUID;version:number;schema_version:string;methodology_version:string;source_level:SourceLevel;content:Json;created_at:string;created_by:UUID}
export interface SensoryProfileRow{id:UUID;zone_id:UUID;place_id:UUID;organization_id:UUID;schema_version:string;source_level:SourceLevel;sound_level:SensoryLevel;light_level:SensoryLevel;smell_level:SensoryLevel;crowding_level:SensoryLevel;temperature_level:SensoryLevel;visual_complexity_level:SensoryLevel;predictability_flags:Json}
export interface AssessmentRow{id:UUID;place_id:UUID;organization_id:UUID;method:string;protocol_version:string;assessed_on:string;valid_until:string;assessor_id:UUID;reviewer_id:UUID|null;instruments:Json;source_level:SourceLevel;status:'draft'|'in_review'|'approved'|'expired'|'withdrawn';created_at:string}
export interface MeasurementRow{id:UUID;profile_id:UUID;place_id:UUID;organization_id:UUID;assessment_id:UUID;metric:'sound'|'light'|'temperature';value:number;unit:'dB(A)'|'lux'|'C';instrument:string;measured_at:string;assessor_id:UUID}
export interface QrRedirectRow{public_code:string;place_id:UUID;organization_id:UUID;guide_id:UUID}
