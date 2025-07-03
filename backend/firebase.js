const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let db;

try {
  console.log('🧪 Initializing Firebase...');

  // --- THIS IS THE ONLY LINE THAT CHANGES ---
  // It now looks in the main project folder, which is where Render places the secret file.
  const filePath = path.join(process.cwd(), 'firebaseServiceKey.json');

  if (!fs.existsSync(filePath)) {
    console.error('❌ firebaseServiceKey.json is missing!');
    process.exit(1);
  }

  const serviceAccount = require(filePath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'tangoapp-8bd65-storage'
  });

  db = admin.firestore();
  console.log('✅ Firebase initialized!');
} catch (error) {
  console.error('❌ Firebase failed to initialize:', error);
  process.exit(1);
}

module.exports = { db };
