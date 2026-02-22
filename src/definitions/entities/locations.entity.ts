export interface LocationEntity {
  // id: number;
  // en_name: string;
  // ar_name: string | null;
  // parent_location_id: number | null;
  id: number;
  project_id: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  en_name: string;
  ar_name: string | null;
  parent_location_id: number | null;
  location_type_id: number;
  location_code: string | null;
  locations?: LocationEntity | null; // Nested child object

}