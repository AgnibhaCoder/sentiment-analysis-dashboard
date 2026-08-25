const sentimentService=require('../services/sentimentService');

const handleAnalysis=async(req,res)=>{
    const {text}=req.body;
    if(!text)
        return res.status(400).json({error:"text field is required"});

    try{
        const result=await sentimentService.analyzeTextSentiment(text);
        return res.status(200).json(result);
    }
    catch(error){
        return res.status(500).json({error:error.message});
    }
};

module.exports={handleAnalysis};