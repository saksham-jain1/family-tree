// src/lib/firebaseAdmin.js
import admin from "firebase-admin";

// Check if app is already initialized
if (!admin.apps.length) {
  try {
    const firebaseConfig = {
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
    });
    console.log("Firebase admin initialized");
  } catch (error) {
    console.error("Firebase admin initialization error", error.stack);
  }
}

/**
 * Verifies the Firebase ID token and returns the decoded user object.
 * @param {string} idToken - The Firebase ID token from the Authorization header.
 * @returns {Promise<admin.auth.DecodedIdToken | null>}
 */
export const verifyIdToken = async (idToken) => {
  if (!idToken) {
    return null;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    return null;
  }
};

export default admin;
