export interface Location {
    latitude: number;
    longitude: number;
  }


export interface UserLocation extends Location {
    userId: string;
}
