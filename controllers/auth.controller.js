import passport from 'passport';
import session from 'express-session'

export const signupWithGoogle = passport.authenticate('google', { scope: ['profile', 'email'] })
export const googleAuthCallback = passport.authenticate('google', { successRedirect:'/', failureRedirect: '/login' })
    
export const login = async (req, res) => {
        console.log("LOGIN")
}
    
export const logout = async (req, res) => {
        session.
}