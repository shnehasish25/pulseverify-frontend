const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const { admin } = require('./firebase');
const User = require('../models/User');

passport.use(new BearerStrategy(async (token, done) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, phone_number, picture } = decodedToken;

    let user = await User.findOne({ uid });

    if (!user) {
      if (email) {
        user = await User.findOne({ email });
      }
      
      if (user) {
        user.uid = uid;
        if (phone_number && !user.phoneNumber) user.phoneNumber = phone_number;
        if (picture && !user.picture) user.picture = picture;
        await user.save();
      } else {
        let displayName = name;
        if (!displayName) {
          if (email) displayName = email.split('@')[0];
          else if (phone_number) displayName = phone_number;
          else displayName = 'User';
        }

        user = await User.create({
          name: displayName,
          email: email || undefined,
          phoneNumber: phone_number || undefined,
          uid: uid,
          picture: picture || undefined
        });
      }
    }

    
    return done(null, {
      userId: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: user.name,
      picture: user.picture
    });
  } catch (error) {
    return done(error);
  }
}));

module.exports = passport;
