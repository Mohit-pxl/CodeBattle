const axios = require('axios');

const getLanguageById=(lang)=>{

     const language = {
        "c++":54,
        "java":62,
        "javascript":63
    }

    return language[lang.toLowerCase()];

}


const submitBatch= async (submissions)=>{

const options = {
  method: 'POST',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  headers: {
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
    submissions
    
  }
}
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data
	} catch (error) {
		console.error(error);
	}
}

return await fetchData();

module.exports={getLanguageById,submitBatch};