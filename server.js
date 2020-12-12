const express = require('express');
const articleRouter = require('./routes/articles');
const userRouter = require('./routes/users');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const methodOverride = require('method-override');

// Import article model
const Article = require('./models/article');

const app = express();
mongoose.connect('mongodb://localhost/blog',
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

// Set the view engine
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(methodOverride('_method'));


app.get('/', async (req, res) => {
    const articles = await Article.find().sort({ createdAt: 'desc' })
    res.render('articles/index', { articles: articles });
});

app.use('/articles', articleRouter);
app.use('/users', userRouter);

app.listen(5000);