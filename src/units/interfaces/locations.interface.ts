export interface LocationNode {
  id: number;
  name: string;
  parent_location_id: number | null;
  children: LocationNode[];
}