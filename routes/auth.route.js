import express, { json } from 'express'
import { login } from '../controllers/auth.controller.js'
import passport from 'passport'
import cookieSession from 'cookie-session';


const router = express.Router()

function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }),(req,res,next)=>{
    next()
})
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth/failure' }), (req,res)=>{
    if(!req.user){
        console.log("SIGN IN FAILED")
        res.status(401).json({message: 'Sign in failed'})
    }
    const userData = req.user;
    const redirectUrl = 'http://localhost:5173/signup';
    res.redirect(`${redirectUrl}/?userData=${JSON.stringify(userData)}`);

})

router.get('/failure', (req, res)=>{
    res.status(401).json({message: 'Sign in failed', user: null})
})

router.post('/logout', (req,res)=>{
    try {
        console.log("LOG OUT")
        req.logout((err)=>{
            if(err){
                console.log(err)
                res.send('LOGOUT FAILED')
                return res.status(500).json({ message: 'Failed to logout. QQQ' });
            }
            console.log("LOG OUT SUCCESS /// USER : ",req.user)
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).json({ message: 'Failed to logout.' });
                }
                console.log("SESSION CLEARED SUCCESSFULLY. USER", req.session)
                res.status(201).json({ message: 'Logout successful.' });
            });
        });

} catch (error) {
        console.log('Something went wrong.', error.message)
        res.status(500).json({ message: 'Something went wrong.' })
}
})

router.get('/login', login)


export default router
