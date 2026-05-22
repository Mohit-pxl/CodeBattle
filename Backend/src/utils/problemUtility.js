const axios = require('axios');

const getLanguageById=(lang)=>{

     const language = {
        "c++":54,
        "java":62,
        "javascript":63,
        "python":71,
        "go":60
    }

    return language[lang.toLowerCase()];

}


const submitBatch= async (submissions)=>{

const options = {
  method: 'POST',
  url: 'http://localhost:2358/submissions/batch',
   params: {
    base64_encoded: 'false'
  },
  headers: {
    
    'Content-Type': 'application/json'
  },
  data: {
    submissions

  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		const data = response.data;
		// Judge0 may return a flat array or { submissions: [...] }
		if (Array.isArray(data)) return data;
		if (data && Array.isArray(data.submissions)) return data.submissions;
		throw new Error('Unexpected response format from Judge0: ' + JSON.stringify(data));
	} catch (error) {
		console.error('submitBatch error:', error.message);
		throw error;
	}
}

return fetchData();
}

const waiting = (timer) => {
  return new Promise(resolve => setTimeout(resolve, timer));
};

const submitToken = async(resultToken)=>{

const options = {
  method: 'GET',
  url: 'http://localhost:2358/submissions/batch',
  params: {
    tokens: resultToken.join(","),
    base64_encoded: 'false',
    fields: '*'
  },
  headers: {
    "Content-Type": "application/json"
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}

 while(true){

 const result =  await fetchData();

  if (!result || !result.submissions) {
    console.error("Judge0 result is undefined or malformed, retrying...");
    await waiting(1000);
    continue;
  }

  const IsResultObtained =  result.submissions.every((r)=>r.status_id>2);

  if(IsResultObtained)
    return result.submissions;

  
  await waiting(1000);
}



}

module.exports={getLanguageById,submitBatch,submitToken};