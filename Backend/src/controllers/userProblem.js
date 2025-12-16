const {getLanguageById,submitBatch}=require('../utils/problemUtility')


const createProblem= async (requestAnimationFrame,res)=>{

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
        const submissions=visibleTestCases.map((input,output)=>({
            source_code:completeCode,
            language_id:languageId,
            stdin:input,
            expectedOutput:output

        }))

        const submitResult= await submitBatch(submissions);

        }

    }
    catch{

    }
}