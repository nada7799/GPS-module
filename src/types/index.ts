export interface Location {
    latitude: number;
    longitude: number;
  }
  export interface Geofence {
    center: Location;
    radius: number;
}

export interface UserLocation extends Location {
    userId: string;
}
