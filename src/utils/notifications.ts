// src/utils/notification.ts
import { Location, Geofence } from '../types';
import axios from 'axios';
import { User } from '../types/user'
export const notifyNearbyUsers = async (longitude:number, latitude:number) => {
    try {
        const response = await axios.get('http://localhost:8000/get-users-in-radius', {
        params: {
            latitude,
            longitude,
            radius: 2.5
        }
        });
        console.log(response)
        const data: User[] = response.data;
        console.log(data)
        const fcmTokens = data.map(user => user.fcmToken);
        sendNotification(fcmTokens,longitude,latitude);
    } catch (error) {
        console.error('Error fetching users in radius:', error);
        throw new Error((error as Error).message);
    }
};

const sendNotification = (fcmTokens:string[],longitude:number,latitude:number) => {

    console.log(`Alerting user ${fcmTokens[0]} about accident at ${latitude}, ${longitude}`);
    // Implement actual push notification logic here
};
