const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let db;

try {
  console.log('🧪 Initializing Firebase...');

  const filePath = path.resolve(__dirname, 'firebaseServiceKey.json');

  if (!fs.existsSync(filePath)) {
    console.error('❌ firebaseServiceKey.json is missing!');
    process.exit(1);
  }

  const serviceAccount = require(filePath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'tangoapp-8bd65.appspot.com'
  });

  db = admin.firestore();
  console.log('✅ Firebase initialized!');
} catch (error) {
  console.error('❌ Firebase failed to initialize:', error);
  process.exit(1);
}

module.exports = { db };
