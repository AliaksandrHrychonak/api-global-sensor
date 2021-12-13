const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const RoleModel = require('../models/role-model')
const User = require("../models/user-model");
const uuid = require('uuid');
const bcrypt = require('bcrypt')

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_AUTH_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, cb) => {

      const userRole = await RoleModel.findOne({ value: "USER" })
      const userPas = uuid.v4() + accessToken + profile.id
      const hash = await bcrypt.hash(userPas, 10);

      const newUser = {
        name: profile.name.givenName,
        surname: profile.name.familyName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value,
        googleId: profile.id,
        password: hash,
        isActivated: profile.emails[0].verified,
        roles: [userRole.value]
      }

      try {
        let user = await User.findOne({ googleId: profile.id })

        if (user) {
          cb(null, user)
        } else {
          user = await User.create(newUser)
          cb(null, user)
        }
      } catch (err) {
        console.error(err)
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user))
})