import passport from 'passport';

export const login = async (req, res) => {
        console.log("SESSION : ", req.session)
}

// export const logout = async (req, res) => {
        
// }

// Import dependencies
// import passport from 'passport';
// import session from 'express-session';

// // OAuth routes
// export const signupWithGoogle = (req, res, next) => {
//         passport.authenticate('google', (err, user, info) => {
//                 if (err) return next(err);
//                 if (!user) return res.redirect('/login');
//                 req.logIn(user, err => {
//                         if (err) return next(err);
//                         res.redirect('/home');
//                 });
//                 console.log('sessiom : ',req.session)
//         })(req, res, next);
// }


// export const googleAuthCallback = (req, res, next) => {
//         passport.authenticate('google', (err, user, info) => {
//                 if (err) return next(err);
//                 if (!user) return res.redirect('/login');
//                 res.redirect('/home');
//                 console.log('sessiom : ',req.session)
//         })(req, res, next);

// }
// // Login route
// export const login = (req, res) => {
//         console.log("SESSION: ", req.session);
// }

// // Logout route
// export const logout = (req, res) => {

//         req.logout(err => {
//                 if (err) return next(err);

//                 req.session.destroy(err => {
//                         res.redirect('/');
//                 });
//         });

// }

