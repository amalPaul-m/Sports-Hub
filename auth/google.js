const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const usersSchema = require('../models/usersSchema')

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await usersSchema.findOne({ googleId: profile.id });

      if (!user) {

        const existingEmailUser = await usersSchema.findOne({ email: profile.emails[0].value });
        if (existingEmailUser) {
          // Option 1: Link Google account to existing user (recommended)
          await usersSchema.findByIdAndUpdate(existingEmailUser._id, 
            { $set: { googleId: profile.id } });
          user = { ...existingEmailUser, googleId: profile.id };
        } else {

          const newUser = new usersSchema({

            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id
          });
          const result = await newUser.save();
          user = { ...newUser, _id: result.insertedId };

        }


      }
      return done(null, user);
    } catch (error) {
      console.error('Error in Google Strategy:', error);
      return done(error, null);
    }
  }));

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await usersSchema.findOne({ _id: id });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});


module.exports = passport;




