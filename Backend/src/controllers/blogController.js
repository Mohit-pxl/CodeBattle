const Blog=require('../models/blog');
const User=require('../models/users');


const createblog=async (req,res)=>{
    try{
        const { title, content, tags, category } = req.body;
        const author = req.result._id;

        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        const newBlog = new Blog({
            title,
            content,
            tags,
            category: category || "General",
            author
        });

        await newBlog.save();
        res.status(201).json(newBlog);
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
};

const getAllBlogs=async (req,res)=>{
     try{
        const blogs = await Blog.find().populate('author', 'firstName emailId').sort({ createdAt: -1 });
        res.status(200).json(blogs);
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
};

const getblog=async (req,res)=>{
     const {id}=req.params;
     try{
        if(!id)
            return res.status(400).json({message: "ID is missing"});

        const blog=await Blog.findById(id).populate('author','firstName emailId');
        if(!blog)
            return res.status(404).json({message: "Blog not found"});

        res.status(200).json(blog);
       

    }
    catch(err){
        res.status(500).json({message: err.message});
    }
};

const updateblog=async (req,res)=>{
    const {id}=req.params;
     try{
        if(!id)
            return res.status(400).json({message: "ID is missing"});

        const updateblog = await Blog.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );
        if(!updateblog)
            return res.status(404).json({message: "Blog not found"});

        res.status(200).json(updateblog);
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
};

const deleteblog=async (req,res)=>{
    const {id}=req.params;
     try{
        if(!id)
            return res.status(400).json({message: "ID is missing"});

        const deleteblog=await Blog.findByIdAndDelete(id);
        if(!deleteblog)
            return res.status(404).json({message: "Blog not found"});

        res.status(200).json({message: "Blog deleted successfully"});

    }
    catch(err){
        res.status(500).json({message: err.message});
    }
};

module.exports={createblog,getAllBlogs,getblog,updateblog,deleteblog};