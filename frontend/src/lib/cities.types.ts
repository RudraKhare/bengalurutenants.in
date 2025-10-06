// Type definitions for cities module
export interface CityCoordinates {
  lat: number;
  lng: number;
}

export type CityCentersType = Record<string, CityCoordinates>;
