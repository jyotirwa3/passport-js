// index.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const User = require('./models/User');
require('./config/passport')(passport);

const app = express();
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }));

app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/passport_local')
    .then(() => {
        console.log("database connected")
    })
    .catch(() => {
        console.log("database not connected")
    });

app.get('/', (req, res) => {
    res.send("<h1>home page</h1> <a href='/signup'>signup</a>")
})

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = new User({ username, password });
        await user.save();
        res.redirect('/login');
    } catch (err) {
        res.status(500).send('Error signing up');
    }
});

app.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
    })
);

app.get('/dashboard', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('dashboard', { username: req.user.username });
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/views/signup.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});


app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
