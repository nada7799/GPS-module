
export interface User {
    userId: string;
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    fcmToken: string;
    lastUpdated: string;
    isOnline: boolean;
  }