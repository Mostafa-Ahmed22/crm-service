export interface LocationEntity {
  id: number;
  en_name: string;
  ar_name: string | null;
  parent_location_id: number | null;
}