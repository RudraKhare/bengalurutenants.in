declare module '@/lib/cities' {
  export interface CityCoordinates {
    lat: number;
    lng: number;
  }

  export type CityCenters = Record<string, CityCoordinates>;
  export const CityCenters: CityCenters;
  export function getAllCities(): string[];
  export function getCityCenter(city: string): CityCoordinates;
}
