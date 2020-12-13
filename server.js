const express = require('express');
const articleRouter = require('./routes/articles');
const userRouter = require('./routes/users');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const methodOverride = require('method-override');
const expressLayout = require('express-ejs-layouts');
const flash = require('express-flash');
const session = require('express-session');
const config = require('./config/database')
const passport = require('passport');
const path = require('path');

// Import article model
const Article = require('./models/article');

const app = express();
mongoose.connect(config.database,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

// Set the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(methodOverride('_method'));
app.use(expressLayout);
app.use(flash());
app.use(session({
    secret: 'mysecret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
    res.locals.user = req.user ;
    next();
})

app.get('/', async (req, res) => {
    const articles = await Article.find().sort({ createdAt: 'desc' })
    res.render('articles/index', { articles: articles });
});

app.use('/articles', articleRouter);
app.use('/users', userRouter);



app.listen(process.env.PORT || 5000);