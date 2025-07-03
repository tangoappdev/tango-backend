const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let db, bucket; // <-- Define bucket here

try {
  console.log('🧪 Initializing Firebase...');

  const filePath = path.join(process.cwd(), 'firebaseServiceKey.json');

  if (!fs.existsSync(filePath)) {
    console.error('❌ firebaseServiceKey.json is missing!');
    process.exit(1);
  }

  const serviceAccount = require(filePath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'tangoapp-8bd65-storage' // Make sure this is the correct bucket name we found
  });

  db = admin.firestore();
  bucket = admin.storage().bucket(); // <-- ADD THIS LINE to get the bucket

  console.log('✅ Firebase initialized!');
} catch (error) {
  console.error('❌ Firebase failed to initialize:', error);
  process.exit(1);
}

module.exports = { db, bucket }; // <-- ADD bucket TO THE EXPORT