import { admin, firestore } from '../database/firebase';
import {redis} from '../redis/redis'

async function testRedisConnection() {
  try {
    console.log('Testing Redis connection...');
    await redis.ping(); // Send a PING command to Redis
    console.log('✅ Redis connection successful!');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
  }
}


// we get the near by
async function getNearbyFcmTokens(latitude: number, longitude: number, radiusKm: number) {
  testRedisConnection();
  try {
    // Find FCM tokens within the given radius (in kilometers)
    const nearbyTokens = await redis.georadius(
      'active_users', // Key for the geospatial set
      longitude, // Longitude of the center point
      latitude, // Latitude of the center point
      radiusKm, // Radius in kilometers
      'km', // Unit (kilometers)
      'WITHCOORD', // Include coordinates in the result
      'WITHDIST', // Include distance in the result
    ) as [string, string, [string, string]][];

    // Extract FCM tokens from the result
    const fcmTokens = nearbyTokens.map((token:[string, string, [string, string]]) => token[0]); // token[0] is the FCM token

    return fcmTokens;
  } catch (error) {
    console.error('❌ Error querying nearby FCM tokens:', error);
    throw error;
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dx = lat2 - lat1;
  const dy = lon2 - lon1;
  return Math.sqrt(dx * dx + dy * dy); 
}


export const notifyNearbyUsers = async (longitude:number, latitude:number) => {
    try {
        console.time('getNearbyUsers');
        const nearbyFcmTokens = await getNearbyFcmTokens(latitude, longitude, 1);
        console.timeEnd('getNearbyUsers'); 
        console.log(nearbyFcmTokens)
        //sendNotification(nearbyFcmTokens,longitude,latitude);
    } catch (error) {
        console.error('Error fetching users in radius:', error);
        throw new Error((error as Error).message);
    }
};

const sendNotification = async (fcmTokens:string[],longitude:number,latitude:number) => {

    const payload = {
        notification: {
          title: '🚨 Accident Alert!',
          body: `An accident was reported near you. Stay alert & help if possible!`,
        },
        data: {
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }
      };
    
      await admin.messaging().sendMulticast({
        tokens: fcmTokens,
        ...payload
      });
    
      console.log(`✅ Sent notifications to ${fcmTokens.length} users`);
};
