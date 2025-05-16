const mongoose = require("mongoose");
require('dotenv').config({path: '../../.env'});
const connectDB=async()=>{
    try{
        if(!process.env.MONGO_URI)
        {
            console.error('Error: MONGO_URI is not defined. Check if it is set in your .env file');
            process.exit(1);
        }

        const conn=await mongoose.connect(process.env.MONGO_URI,{

        });

        console.log(`MONGODB CONNECTED: ${conn.connection.host}`);
    }

    catch(error)
    {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports=connectDB;

