const {getLanguageById,submitBatch,submitToken}=require('../utils/problemUtility');
const Problem=require("../models/problem");



const createProblem= async (req,res)=>{

    const {title,description, difficulty,tags,
        visibleTestCases,hiddenTestCases, startCode,referenceSolution,
        problemCreator
    }=req.body;
    try{
        for(const {language,completeCode} of referenceSolution){
            
        // source_code:
        // language_id:
        // stdin: 
        // expectedOutput:

        const languageId=getLanguageById(language);

        // I am creating Batch submission
        const submissions=visibleTestCases.map((testcase)=>({
            source_code:completeCode,
            language_id:languageId,
            stdin:testcase.input,
            expected_output:testcase.output

        }))
  
        const submitResult= await submitBatch(submissions);

        const resultToken=submitResult.map((value)=>value.token);

        const testResult=await submitToken(resultToken);

        for(const test of testResult){
            if(test.status_id!=3)
                return res.status(400).send("Error Occured");
        }
        }
        console.log(req.body)
        //we can store it in our db
        const userProblem=await Problem.create({
            ...req.body,
            problemCreator:req.result._id
        })
        res.status(201).send("Problem saved successfully")

    }
    catch(err){
        res.status(400).send("Error: "+err);

    }
}

module.exports=createProblem