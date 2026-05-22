const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User=require("../models/users")
const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");

const submitCode = async (req,res)=>{
   
    // 
    try{
       const userId = req.result._id;
       const problemId = req.params.id;

       const {code,language: rawLanguage} = req.body;

      if(!userId||!code||!problemId||!rawLanguage)
        return res.status(400).send("Some field missing");

      const language = rawLanguage === 'cpp' ? 'c++' : rawLanguage;
      

    //    Fetch the problem from database
       const problem =  await Problem.findById(problemId);
       if(!problem) return res.status(404).send("Problem not found");
    //    testcases(Hidden)

    //   Kya apne submission store kar du pehle....
    const submittedResult = await Submission.create({
          userId,
          problemId,
          code,
          language,
          status:'pending',
          testCasesTotal: (problem.hiddenTestCases || []).length
        })

    //    Judge0 code ko submit karna hai

    const languageId = getLanguageById(language);
    if(!languageId) return res.status(400).send("Unsupported language: " + language);

    const hiddenTests = problem.hiddenTestCases || [];
    if(hiddenTests.length === 0) return res.status(400).send("No hidden test cases found for this problem");

    const submissions = hiddenTests.map((testcase)=>({
        source_code:code,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output
    }));


    const submitResult = await submitBatch(submissions);
    
    if(!Array.isArray(submitResult)) {
      console.error('submitBatch returned non-array:', submitResult);
      return res.status(500).send("Judge0 returned unexpected response");
    }

    const resultToken = submitResult.map((value)=> value.token);

    const testResult = await submitToken(resultToken);
    

    // submittedResult ko update karo
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = null;


    for(const test of testResult){
        if(test.status_id==3){
           testCasesPassed++;
           runtime = runtime+parseFloat(test.time)
           memory = Math.max(memory,test.memory);
        }else{
          if(test.status_id==4){
            status = 'error'
            errorMessage = test.stderr
          }
          else{
            status = 'wrong'
            errorMessage = test.stderr
          }
        }
    }


    // Store the result in Database in Submission
    submittedResult.status   = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();
    
    // ProblemId ko insert karenge userSchema ke problemSolved mein if it is not persent there.
    
    // req.result == user Information

    if(!req.result.problemSolved.includes(problemId)){
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    res.status(201).send(submittedResult);
       
    }
    catch(err){
      console.error('submitCode error:', err);
      res.status(500).send("Internal Server Error "+ err);
    }

}


const runCode = async(req,res)=>{
    
     // 
     try{
      const userId = req.result._id;
      const problemId = req.params.id;

      const {code,language: rawLanguage} = req.body;

     if(!userId||!code||!problemId||!rawLanguage)
       return res.status(400).send("Some field missing");

     const language = rawLanguage === 'cpp' ? 'c++' : rawLanguage;

   //    Fetch the problem from database
      const problem =  await Problem.findById(problemId);
      if(!problem) return res.status(404).send("Problem not found");
   //    testcases(Visible)
      

   //    Judge0 code ko submit karna hai

   const languageId = getLanguageById(language);
   if(!languageId) return res.status(400).send("Unsupported language: " + language);

   const visibleTests = problem.visibleTestCases || [];
   if(visibleTests.length === 0) return res.status(400).send("No visible test cases found for this problem");

   const submissions = visibleTests.map((testcase)=>({
       source_code:code,
       language_id: languageId,
       stdin: testcase.input,
       expected_output: testcase.output
   }));


   const submitResult = await submitBatch(submissions);
   
   if(!Array.isArray(submitResult)) {
     console.error('submitBatch returned non-array:', submitResult);
     return res.status(500).send("Judge0 returned unexpected response");
   }

   const resultToken = submitResult.map((value)=> value.token);

   const testResult = await submitToken(resultToken);

   
  
   res.status(201).send(testResult);
      
   }
   catch(err){
     res.status(500).send("Internal Server Error "+ err);
   }
}


const getUserSubmissions = async (req,res) => {
    try {
        const userId = req.result._id;
        const submissions = await Submission.find({userId}).sort({createdAt: -1}).populate('problemId');
        res.status(200).send(submissions);
    } catch(err) {
        res.status(500).send("Internal Server Error " + err);
    }
}

module.exports = {submitCode,runCode,getUserSubmissions};



//     language_id: 54,
//     stdin: '2 3',
//     expected_output: '5',
//     stdout: '5',
//     status_id: 3,
//     created_at: '2025-05-12T16:47:37.239Z',
//     finished_at: '2025-05-12T16:47:37.695Z',
//     time: '0.002',
//     memory: 904,
//     stderr: null,
//     token: '611405fa-4f31-44a6-99c8-6f407bc14e73',


// User.findByIdUpdate({
// })

//const user =  User.findById(id)
// user.firstName = "Mohit";
// await user.save();