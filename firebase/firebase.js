// firebase.js (or any other appropriate filename)
const admin = require("firebase-admin");
const serviceAccount = require("./med-daily-firebase-adminsdk-sdkfv-a2860ef59f.json");

// Check if Firebase app is not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "med-daily.appspot.com",
  });
}

const storage = admin.storage();
const bucket = storage.bucket();

module.exports = { bucket };
