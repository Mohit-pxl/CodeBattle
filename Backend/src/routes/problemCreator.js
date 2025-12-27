const express = require('express');
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem}=require('../controllers/userProblem')
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware=require('../middleware/userMiddleware')

const problemRouter =  express.Router();


// Create
problemRouter.post("/create",adminMiddleware,createProblem);
problemRouter.patch("/update/:id",adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware,deleteProblem);


problemRouter.get("/problemById/:id",userMiddleware,getProblemById);
problemRouter.get("/getAllProblem", userMiddleware,getAllProblem);
problemRouter.get("/problemSolvedByUser",userMiddleware,solvedAllProblembyUser);

module.exports=problemRouter