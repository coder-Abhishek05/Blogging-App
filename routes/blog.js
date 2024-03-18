const { Router } = require("express");
const multer = require('multer');
const path = require('path');

const Blog = require('../models/blog');
const Comment = require('../models/comment');

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/uploads/`));
    },
    filename: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  });

const upload = multer({storage: storage});

router.get("/add-new", (req, res) => {
    return res.render("addBlog", {
        user: req.user,
    });
});

router.get("/home", (req, res) => {
    return res.redirect('/');
    
});


// router.get('/edit/:id', async(req, res) => {
//     const blog = await Blog.findById(req.params.id)
//     res.render('/edit', { blog: blog })
// })

router.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({ blogId: req.params.id}).populate(
        "createdBy"
    );
    console.log("blog", blog);
    return res.render("blog", {
        user: req.user,
        blog,
        comments,
    });
});

router.delete('/:id',async(req,res)=>{
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect('/');
})

router.post('/comment/:blogId', async (req, res) => {
    await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/", upload.single("coverImage"), async (req, res) => {
    const { title, body} = req.body;
    const blog = await Blog.create({
        body,
        title,
        createdBy: req.user._id,
        coverImageURL: `/uploads/${req.file.filename}`
    });
    return res.redirect(`/blog/${blog._id}`);
});

// router.post('/', async (req, res,next) => {
//     req.blog=new Blog()
//     next()
// },saveArticle('new'))

// router.put('/:id', async (req, res,next) => {
//     req.blog=await Blog.findById(req.params.id)
//     next()
// },saveArticle('edit'))

// function saveArticle(path){
//     return async(req,res)=>{
//     let blog = req.blog
//         blog.title= req.body.coverImageURL
//         blog.description= req.body.title
//         blog.body= req.body.body
    
//     try {
//         blog = await blog.save()
//         // res.redirect(`/articles/${article.slug}`)
//     } catch (e) {
//         res.render(`${path}`, { blog: blog })
//     }
// }}

module.exports = router;