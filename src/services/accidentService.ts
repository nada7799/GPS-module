import { Location, Geofence } from '../types';
import { notifyNearbyUsers } from '../utils/notifications';

export const processAccident = async (longitude: number,latitude: number, severity: string) => {
    if (severity !== 'high') {
        console.log('Non-high severity; skipping user notification.');
        return;
    }


    console.log('High-severity accident detected. Notifying nearby users...');
    await notifyNearbyUsers(longitude,latitude);
};
