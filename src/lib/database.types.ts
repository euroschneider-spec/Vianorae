// Row contracts maintained against reviewed migrations.
// Regenerate from the dedicated project when management access is restored.
export type UUID=string;
export type Json=string|number|boolean|null|{[key:string]:Json|undefined}|Json[];
export type RecordStatus='draft'|'published'|'archived';
export type SourceLevel='venue_provided'|'assessor_verified'|'independent_audit';
export type OrganizationRole='owner'|'admin'|'editor'|'assessor'|'reviewer';
export type SensoryLevel='unknown'|'low'|'moderate'|'high'|'variable';
export interface OrganizationRow{id:UUID;name:string;country_code:string|null;organization_type:'institution'|'museum'|'hotel'|'cultural'|'public_service'|'other';status:RecordStatus;approval_status:'pending'|'approved'|'suspended';created_at:string}
export interface OrganizationMemberRow{organization_id:UUID;user_id:UUID;role:OrganizationRole;created_at:string}
export interface PlaceRow{id:UUID;organization_id:UUID;slug:string;country_code:string|null;city:string;address:string;place_type:string;status:RecordStatus;template_id:UUID|null;created_at:string;revision:number;updated_at:string}
export interface ZoneRow{id:UUID;place_id:UUID;organization_id:UUID;parent_zone_id:UUID|null;type:string;sort_order:number;status:RecordStatus}
export interface GuideRow{id:UUID;place_id:UUID;organization_id:UUID;locale:string;status:RecordStatus;current_version:number|null;published_at:string|null;created_at:string}
export interface GuideVersionRow{id:UUID;guide_id:UUID;place_id:UUID;organization_id:UUID;version:number;schema_version:string;methodology_version:string;source_level:SourceLevel;content:Json;created_at:string;created_by:UUID}
export interface SensoryProfileRow{id:UUID;zone_id:UUID;place_id:UUID;organization_id:UUID;schema_version:string;source_level:SourceLevel;sound_level:SensoryLevel;light_level:SensoryLevel;smell_level:SensoryLevel;crowding_level:SensoryLevel;temperature_level:SensoryLevel;visual_complexity_level:SensoryLevel;predictability_flags:Json}
export interface AssessmentRow{id:UUID;place_id:UUID;organization_id:UUID;method:string;protocol_version:string;assessed_on:string;valid_until:string;assessor_id:UUID;reviewer_id:UUID|null;instruments:Json;source_level:SourceLevel;status:'draft'|'in_review'|'approved'|'expired'|'withdrawn';created_at:string}
export interface MeasurementRow{id:UUID;profile_id:UUID;place_id:UUID;organization_id:UUID;assessment_id:UUID;metric:'sound'|'light'|'temperature';value:number;unit:'dB(A)'|'lux'|'C';instrument:string;measured_at:string;assessor_id:UUID}
export interface QrRedirectRow{public_code:string;place_id:UUID;organization_id:UUID;guide_id:UUID}

export interface OrganizationAcknowledgementRow{organization_id:UUID;user_id:UUID;representative_name:string;statement_version:string;statement_locale:'en'|'ro'|'de';accepted_at:string}

export interface PlaceTranslationRow{place_id:UUID;organization_id:UUID;locale:string;name:string;short_description:string;arrival_info:string}
export interface ZoneTranslationRow{zone_id:UUID;place_id:UUID;organization_id:UUID;locale:string;title:string;description:string;useful_note:string;next_step:string}
export interface GuideStepRow{id:UUID;guide_id:UUID;place_id:UUID;organization_id:UUID;zone_id:UUID;sort_order:number;draft_position:number;optional:boolean;active:boolean}
export interface MediaAssetRow{id:UUID;organization_id:UUID;place_id:UUID;zone_id:UUID|null;storage_key:string;alt_text:Record<string,string>;rights:string;sort_order:number;active:boolean;photographed_on:string|null}
