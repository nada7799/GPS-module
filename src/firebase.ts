import express, { Request, Response } from 'express';
import admin from 'firebase-admin';
import bodyParser from 'body-parser';
import { GeoCollectionReference, GeoFirestore } from 'geofirestore';

// Initialize Firebase Admin SDK
const serviceAccount = require('../firebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://fluttergeofile.firebaseio.com',
});

const db = admin.firestore();
const geoFirestore = new GeoFirestore(db);

// Initialize Express app
const app = express();
app.use(bodyParser.json());



// Get users in radius
app.get('/get-users-in-radius', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius } = req.query;

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const radiusInKm = parseFloat(radius as string);


    const center = new admin.firestore.GeoPoint(lat, lng);

    const usersCollectionRef: GeoCollectionReference = geoFirestore.collection('users_locations_data');
    const geofilter = usersCollectionRef.near({ center, radius: radiusInKm });

    const snapshot = await geofilter.get();

    

    const users = snapshot.docs.map((doc) => doc.data());
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Write geospatial data
app.post('/write-data', async (req: Request, res: Response) => {
  try {
    const { userId, name, latitude, longitude, fcmToken } = req.body;
    
    if (!userId) {
      throw new Error('userId is required');
    }

    const usersCollectionRef: GeoCollectionReference = geoFirestore.collection('users_locations_data');
    
    const userData = {
      userId,
      name,
      coordinates: new admin.firestore.GeoPoint(latitude, longitude),
      fcmToken,
      lastUpdated: admin.firestore.Timestamp.now(),
      isOnline: true
    };
    
    // Use userId as document ID for easy querying
    await usersCollectionRef.add(userData);
    
    res.status(200).json({ message: 'Data written successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});


// Start the server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
