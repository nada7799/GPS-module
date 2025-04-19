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
console.log("🔥 Firebase Admin SDK initialized:", admin.apps.length > 0);
console.log("🔥 Firestore initialized:", firestore !== undefined);
console.log("🔥 Service Account Path:", serviceAccountPath);

async function checkFirebase() {
  try {
      const db = admin.firestore();
      const testDoc = db.collection('test').doc('check');
      await testDoc.set({ message: "Firebase connection successful!" });
      const doc = await testDoc.get();
      console.log("✅ Firestore Write & Read Success:", doc.data());
  } catch (error) {
      console.error("❌ Firebase Admin Error:", error);
  }
}

checkFirebase();


export { firestore, admin };


