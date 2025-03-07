import { readFileSync } from 'fs';
const { initialize } = require('fireorm');
import path from 'path';
const admin = require("firebase-admin");

const serviceAccountPath = path.resolve(process.cwd(), 'src/database', 'firebase.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});



const firestore = admin.firestore();
initialize(firestore);


export { firestore, admin };


