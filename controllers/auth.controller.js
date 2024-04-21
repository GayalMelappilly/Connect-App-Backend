import passport from 'passport';
import session from 'express-session'

export const signupWithGoogle = passport.authenticate('google', { scope: ['profile', 'email'] })
export const googleAuthCallback = passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' })

export const login = async (req, res) => {
        console.log("SESSION : ",req.session)
}

export const logout = async (req, res) => {
        try {
                console.log("IN LOGOUT")

                req.logout(err => {
                        req.session.destroy(() => {
                                if (err) return (err);
                                res.status(200).json({ message: 'Logout successful.' })
                                console.log("LOGOUT SUCCESSFUL.")
                        })
                })
        } catch (error) {
                console.log('Something went wrong.', error.message)
                res.status(500).json({ message: 'Something went wrong.' })
        }
}