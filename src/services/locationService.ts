import axios from 'axios';
import {Location} from '../types';

export class LocationService {
  // Gets the user's location based on IP
  static async getCurrentLocation(): Promise<Location> {
    try {
      const response = await axios.get('http://ip-api.com/json/');
      const data = response.data;

      return {
        latitude: data.lat,
        longitude: data.lon,
      };
    } catch (error) {
      throw new Error("Could not get location: " + error);
    }
  }
}

  