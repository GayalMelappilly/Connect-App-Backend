import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';

export const oAuthConfig = () => {
    passport.use(
        new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
            scope: ['profile', 'email']
        },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await User.findOne({ googleId: profile.id });

                    if (!user) {
                        user = new User({
                            googleId: profile.id,
                            displayName: profile.displayName,
                            email: profile.emails[0].value,
                            image: profile.photos[0].value
                        });
                        await user.save();
                    }
                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            })
    );
}
