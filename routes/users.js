const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring the user model
const User = require('../models/user');

// Register form
router.get('/register', ensureNoAuthUser, (req, res) => {
    res.render('users/register', { errors: false });
})

// Post register form
router.post('/register', (req, res) => {
    const { name, email, username, password, confirm_password } = req.body;
    let errors = userFormValidation(req, password);
    if (errors) {
        req.flash('danger', 'Please fix the following errors.');
        res.render('users/register', { errors, user:  req.body });
    } else {
        let user = new User({name, email, username, password});
        passwordHash(user, res, req, errors);
    }
})

// Login form
router.get('/login', ensureNoAuthUser, (req, res, next) => {
    res.render('users/login', { errors: false });
});

// Post login form
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        successFlash: true,
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success', 'Logged out successfully.')
    res.redirect('/users/login');
})


module.exports = router

function passwordHash(user, res, req, errors) {
    bcrypt.genSalt(10, (_err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
                console.log(err);
            }
            user.password = hash;
            try {
                user.save();
                req.flash('success', 'Account created successfully.');
                res.redirect('/users/login');
            } catch (err) {
                console.log(err);
                req.flash('danger', 'Something went wrong.');
                res.render('users/register', { errors });
            }
        });
    });
}

// Vlaidate User form
function userFormValidation(req, password) {
    req.check('name', 'Name is required.').notEmpty();
    req.check('username', 'Username is required.').notEmpty();
    req.check('email', 'Email is required.').notEmpty();
    req.check('email', 'Email is not valid').isEmail();
    req.check('password', 'Password is required.').notEmpty();
    req.check('confirm_password', 'Passwords do not match.').equals(password);

    let errors = req.validationErrors();
    return errors;
}

function ensureNoAuthUser(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }
}
