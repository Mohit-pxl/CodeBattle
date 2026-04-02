const mongoose = require('mongoose');
const { Schema } = mongoose;

const blogSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String, // markdown or HTML
    required: true
  },
  category: {
    type: String,
    default: "General"
  },
  tags: [String],

  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  likes: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  
  views: {
    type: Number,
    default: 0
  },

  comments: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Blog= mongoose.model("Blog", blogSchema);
module.exports=Blog;