import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID?.trim(),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.trim(),
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      })
    });
    console.log("✅ Firebase Admin initialized.");
  } catch (err) {
    console.error("⚠️  Firebase Admin initialization failed:", err.message);
  }
}

export const checkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Firebase Admin
    if (admin.apps.length > 0) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
    } else {
      // Fallback: accept any token in development when Firebase Admin isn't configured
      console.warn("⚠️  Firebase Admin not initialized. Allowing request with mock user.");
      req.user = { uid: 'dev_user', email: 'dev@pulseverify.test' };
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ success: false, message: 'Unauthorized. Invalid or expired token.' });
  }
};
