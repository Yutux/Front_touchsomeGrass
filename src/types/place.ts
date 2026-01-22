export interface PlaceData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  photoReferences?: string[];
  photoUrls?: string[];
}
