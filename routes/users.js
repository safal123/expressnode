const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Bring the user model
const User = require('../models/user');

// Register form
router.get('/register', (req, res) => {
    res.render('users/register', { errors: false, user: new User() });
})

// Post register form
router.post('/register', (req, res) => {
    const { name, email, username, password, confirm_password } = req.body;
    let errors = userFormValidation(req, password);
    if (errors) {
        res.render('users/register', { errors, user:  req.body });
    } else {
        let user = new User({name, email, username, password});
        bcrypt.genSalt(10, (_err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) {
                    console.log(err);
                }
                user.password = hash;
                try {
                    user.save();
                    res.redirect('/');
                } catch (err) {
                    console.log(err);
                    res.render('users/register', { errors });
                }
            });
        });
    }
})

// Login form
router.get('/login', (req, res, next) => {
    res.render('users/login', { errors: false });
});

// Post login form
router.post('/login', (req, res, next) => {
    const { email, password } = req.body;
});


module.exports = router

// Password hash
function bcryptPassword(user) {
    
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
