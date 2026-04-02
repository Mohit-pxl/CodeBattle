const express=require('express')
const blogRouter=express.Router()
const {createblog,getAllBlogs,getblog,updateblog,deleteblog}=require('../controllers/blogController');
const userMiddleware = require('../middleware/userMiddleware')


blogRouter.post('/createPost',userMiddleware,createblog);
blogRouter.get('/allBlogs',userMiddleware,getAllBlogs);
blogRouter.get('/blog/:id',userMiddleware,getblog);
blogRouter.put('/blog/:id',userMiddleware,updateblog);
blogRouter.delete('/blog/:id',userMiddleware,deleteblog);

module.exports=blogRouter;
