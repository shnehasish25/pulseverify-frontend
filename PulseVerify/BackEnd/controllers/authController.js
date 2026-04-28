import User from '../models/User.js';

export const verifyAndRegister = async (req, res) => {
  try {
    const { uid, email } = req.user; // req.user is attached by checkAuth middleware

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // New user registration
      user = await User.create({
        firebaseUid: uid,
        email: email,
        lastLogin: new Date()
      });
      return res.status(201).json({ message: "User registered successfully", status: "new", user });
    }

    // Returning user
    user.lastLogin = new Date();
    await user.save();
    
    return res.status(200).json({ message: "Login successful", status: "returning", user });
  } catch (error) {
    console.error("Auth Controller Error:", error);
    res.status(500).json({ message: "Server error during authentication" });
  }
};
