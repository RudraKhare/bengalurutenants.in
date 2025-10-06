declare module '@/lib/cities' {
  export interface CityCoordinates {
    lat: number;
    lng: number;
  }

  export const DEFAULT_CENTER: CityCoordinates;
  export function getAllCities(): string[];
  export function getCityCenter(city: string): CityCoordinates;

  const api: {
    centers: Record<string, CityCoordinates>;
    defaultCenter: CityCoordinates;
    getAllCities(): string[];
    getCityCenter(city: string): CityCoordinates;
  };
  export default api;
}
