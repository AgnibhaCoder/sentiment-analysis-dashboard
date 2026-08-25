const axios=require('axios');
const {PYTHON_SERVICE_URL}=require('../config/env');

const analyzeTextSentiment=async (text)=>
{
    try{
        const response=await axios.post(PYTHON_SERVICE_URL,{text});
        return response.data;
    }catch(error){
        console.error('Error:',error.message);
        throw new Error('Failed to compute analysis');
    }
};

module.exports={analyzeTextSentiment};