const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const User = require('../models/user');

// render new page
router.get('/new',  ensureAuthUser, (req, res) => {
    res.render('articles/new', { article: new Article() });
});

// render edit page
router.get('/edit/:id', async(req, res) => {
    const article = await Article.findById(req.params.id);
    if (!article) {
        res.redirect('/');
    }
    if (article.author !== req.user._id) {
        req.flash('danger', 'Unauthorised.')
        res.redirect('/');
    }
    res.render('articles/edit', { article });
});

// render single article page
router.get('/:slug', async (req, res) => {
    const article = await Article.findOne({ slug: req.params.slug });
    if (article == null) {
        res.redirect('/')
    }
    const author = await User.findById(article.author)
    res.render('articles/show', { article, author });
});

// create new article
router.post('/', async (req, res, next) => {
    req.article = new Article();
    next();
}, saveArticleAndRedirect('new'));

// update article
router.put('/:id', async (req, res, next) => {
    req.article = await Article.findById(req.params.id)
    next();
}, saveArticleAndRedirect('edit'))

// delete article
router.delete('/:id', async (req, res) => {
    await Article.findByIdAndDelete(req.params.id);
    req.flash('danger', 'Article deleted successfully.');
    res.redirect('/');
})


function saveArticleAndRedirect(path) {
    return async (req, res) => {
        let article = req.article
        article.title = req.body.title
        article.description = req.body.description
        article.markdown = req.body.markdown
        article.author = req.user._id
        try {
            article = await article.save();
            if (path == 'new') {
                req.flash('success', 'Article created successfully.');
            } else if (path == 'edit') {
                req.flash('info', 'Article updated successfully.');
            }
            res.redirect(`/articles/${article.slug}`)
        } catch (e) {
            req.flash('danger', 'Something went wrong.');
            res.render(`articles/${path}`, { article });
        }
    }
}

function ensureAuthUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}


module.exports = router


