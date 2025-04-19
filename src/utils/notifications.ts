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
        const nearbyFcmTokensHard = ["e4bwEL26R0K0vyt41im3XP:APA91bGLtx9EIvV--dU4eXFNpkN9zIA6zxWORNIX0BqFWY7fpwbrSnZFVkHP98fpZpnUBGMjk2bS3Vgb52w6zvyzv4H0Z3YMgClMDOCjXWfXWgyPp6nsbPc"]
        sendNotification(nearbyFcmTokensHard,longitude,latitude);
    } catch (error) {
        console.error('Error fetching users in radius:', error);
        throw new Error((error as Error).message);
    }
};



const sendNotification = async (fcmTokens: string[], longitude: number, latitude: number) => {
  if (fcmTokens.length === 0) {
    console.log("❌ No FCM tokens provided.");
    return;
  }

  // Firebase allows max 500 tokens per request
  const chunkSize = 500;
  for (let i = 0; i < fcmTokens.length; i += chunkSize) {
    const chunk = fcmTokens.slice(i, i + chunkSize);

    const message = {
      tokens: chunk, // Firebase requires this inside `message`
      notification: {
        title: "🚨 Accident Alert!",
        body: "An accident was reported near you. Stay alert & help if possible!",
      },
      data: {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);

      console.log(`✅ Sent notifications to ${chunk.length} users`);

      // Remove invalid tokens from DB if necessary
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp: { success: any; }, index: number) => {
          if (!resp.success) {
            console.error(`❌ Failed to send notification to: ${chunk[index]}`);
            failedTokens.push(chunk[index]);
          }
        });
        // Handle invalid tokens (e.g., remove from DB)
        if (failedTokens.length > 0) {
          console.log("🚨 Invalid tokens:", failedTokens);
          // Remove these tokens from your database if necessary
        }
      }
    } catch (error) {
      console.error("❌ Error sending notification:", error);
    }
  }
};

export default sendNotification;
