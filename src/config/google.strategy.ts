import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../models/users/user.model";

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email    = profile.emails?.[0]?.value;
        const username = profile.displayName || profile.emails?.[0]?.value?.split("@")[0] || "User";
        const image    = profile.photos?.[0]?.value || "";

        if (!email) return done(new Error("No email from Google"), undefined);

        // Check if user already exists
        let user = await UserModel.findOne({ email });

        if (user) {
          // Update profile image if they have a Google photo and no custom one
          if (!user.image && image) {
            user.image = image;
            await user.save();
          }
          return done(null, user);
        }

        // Create new user from Google profile
        user = await UserModel.create({
          email,
          username,
          image,
          password:  Math.random().toString(36).slice(-12), // random password — they use Google to login
          role:      "parent",
          googleId:  profile.id,
        });

        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

export default passport;