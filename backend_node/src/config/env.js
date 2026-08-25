const dotenv=require("dotenv");
dotenv.config();

module.exports={
    PORT : process.env.PORT || 5000,
    PYTHON_SERVICE_URL : process.env.PYTHON_SERVICE_URL || 'http://localhost:8000/analyze'
}