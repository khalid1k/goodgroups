// config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const AppleStrategy = require("passport-apple").Strategy; // For Apple login
const IndividualUser = require("../models/individual-account");
const GroupAccount = require("../models/group-account");

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (token, tokenSecret, profile, done) => {
      try {
        const user = {
          email: profile.emails[0].value,
        };
        console.log("user gooogle profile is", user);
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Facebook Strategy
// passport.use(new FacebookStrategy({
//     clientID: process.env.FACEBOOK_APP_ID,
//     clientSecret: process.env.FACEBOOK_APP_SECRET,
//     callbackURL: process.env.FACEBOOK_CALLBACK_URL,
//     profileFields: ['id', 'emails'],
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       const user = {
//         email: profile.emails[0].value,
//       };
//       return done(null, user);
//     } catch (error) {
//       return done(error, false);
//     }
//   }
// ));

// Apple Strategy (requires Apple setup)
// passport.use(new AppleStrategy({
//     clientID: process.env.APPLE_CLIENT_ID,
//     teamID: process.env.APPLE_TEAM_ID,
//     keyID: process.env.APPLE_KEY_ID,
//     privateKeyLocation: './path_to_apple_private_key.p8', // Path to Apple private key
//     callbackURL: process.env.APPLE_CALLBACK_URL,
//   },
//   async (accessToken, refreshToken, idToken, profile, done) => {
//     try {
//       const user = {
//         email: profile.email,  // Apple returns the email
//       };
//       return done(null, user);
//     } catch (error) {
//       return done(error, false);
//     }
//   }
// ));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
